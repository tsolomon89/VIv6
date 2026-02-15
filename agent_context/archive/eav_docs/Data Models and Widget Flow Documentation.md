# Data Models and Widget Flow Documentation

## Table of Contents
1. [Overview](#overview)
2. [Core Concepts](#core-concepts)
3. [Data Structure Hierarchy](#data-structure-hierarchy)
4. [Records vs Structs](#records-vs-structs)
5. [Data Flow Patterns](#data-flow-patterns)
6. [Best Practices](#best-practices)
7. [Common Patterns](#common-patterns)
8. [Examples](#examples)

---

## Overview

This project uses a sophisticated data architecture that separates **Firebase Records** (database entities) from **Structs** (data transfer objects). Understanding the distinction and the flow of data through the widget tree is essential for maintaining and extending the application.

### Key Principle
**Data flows down, events flow up**: Parent widgets pass data to children as constructor parameters, while children notify parents through callbacks.

---

## Core Concepts

### 1. Firebase Records (FirestoreRecord)
**Location:** `lib/backend/schema/`

Records represent documents in your Firebase Firestore database. They:
- Extend `FirestoreRecord`
- Have a `DocumentReference` for database operations
- Contain metadata like `snapshotData` for raw Firestore data
- Include methods for streams and snapshots (`getDocument`, `getDocumentOnce`)
- Are typically used at the data layer (fetching from database)

**Example Records:**
- `DataRecord` - Main data storage
- `FieldRecord` - Field definitions in subcollections
- `ObjectRecord` - Object definitions in subcollections
- `FieldGroupRecord` - Field group definitions
- `PropertyRecord` - Property definitions

### 2. Structs (FFFirebaseStruct)
**Location:** `lib/backend/schema/structs/`

Structs are lightweight data containers that:
- Extend `FFFirebaseStruct`
- Are immutable value objects
- Can be easily serialized/deserialized
- Are passed through the widget tree
- Support nested relationships
- Don't carry Firebase metadata

**Example Structs:**
- `RecordStruct` - Wraps record data
- `ObjectStruct` - Object metadata
- `FieldGroupStruct` - Group of fields
- `FieldStruct` - Individual field definition
- `PropertyStruct` - Property values

---

## Data Structure Hierarchy

Your data model follows this nested structure:

```
DataRecord (Firebase Document)
└── RecordStruct
    ├── idRecord: String
    └── ObjectStruct
        ├── idRefObjectRecord: String
        ├── typeObject: String
        └── List<FieldGroupStruct>
            ├── idRefFieldGroupRecord: String
            ├── nameFieldGroup: String
            └── List<FieldStruct>
                ├── idRefFieldRecord: String
                ├── nameField: String
                ├── inputType: String
                ├── displayPosition: double
                ├── isSelectMany: bool
                ├── isSystem: bool
                └── List<PropertyStruct>
                    ├── valueProperty: String
                    └── RecordSnapshotStruct
```

### Visual Representation

```
┌─────────────────────────────────────────┐
│         DataRecord (Firestore)          │
│  • reference: DocumentReference         │
│  • snapshotData: Map<String, dynamic>   │
└─────────────────┬───────────────────────┘
                  │
                  │ contains
                  ▼
┌─────────────────────────────────────────┐
│           RecordStruct                  │
│  • idRecord: String                     │
│  • objectStruct: ObjectStruct           │
└─────────────────┬───────────────────────┘
                  │
                  │ contains
                  ▼
┌─────────────────────────────────────────┐
│           ObjectStruct                  │
│  • idRefObjectRecord: String            │
│  • typeObject: String                   │
│  • fieldGroupStructs: List<...>         │
└─────────────────┬───────────────────────┘
                  │
                  │ contains multiple
                  ▼
┌─────────────────────────────────────────┐
│        FieldGroupStruct                 │
│  • idRefFieldGroupRecord: String        │
│  • nameFieldGroup: String               │
│  • fieldStructs: List<FieldStruct>      │
└─────────────────┬───────────────────────┘
                  │
                  │ contains multiple
                  ▼
┌─────────────────────────────────────────┐
│           FieldStruct                   │
│  • idRefFieldRecord: String             │
│  • nameField: String                    │
│  • inputType: String                    │
│  • displayPosition: double              │
│  • isSelectMany: bool                   │
│  • isSystem: bool                       │
│  • propertyStructs: List<PropertyStruct>│
└─────────────────┬───────────────────────┘
                  │
                  │ contains multiple
                  ▼
┌─────────────────────────────────────────┐
│         PropertyStruct                  │
│  • valueProperty: String                │
│  • recordSnapshotStruct: RecordSnapshot │
└─────────────────────────────────────────┘
```

---

## Records vs Structs

### When to Use Records

Use Records (`*Record` classes) when:
- ✅ Fetching data from Firestore
- ✅ Writing data to Firestore
- ✅ Using StreamBuilder with Firestore streams
- ✅ Querying collections
- ✅ You need the DocumentReference

**Example:**
```dart
// Fetching from Firestore
Stream<FieldRecord> getDocument(DocumentReference ref) =>
    ref.snapshots().map((s) => FieldRecord.fromSnapshot(s));

// Using in StreamBuilder
StreamBuilder<List<FieldRecord>>(
  stream: queryFieldRecord(),
  builder: (context, snapshot) {
    if (!snapshot.hasData) return CircularProgressIndicator();
    final records = snapshot.data!;
    // Convert to structs for passing to widgets
    final structs = records.map((r) => r.dataRecord).toList();
    return MyWidget(fields: structs);
  },
)
```

### When to Use Structs

Use Structs (`*Struct` classes) when:
- ✅ Passing data to widgets
- ✅ Storing data in widget state
- ✅ Serializing for navigation parameters
- ✅ Creating temporary/computed data
- ✅ Building UI components

**Example:**
```dart
class CardDynamicWidget extends StatefulWidget {
  const CardDynamicWidget({
    super.key,
    this.dataObject,        // ObjectStruct - lightweight and serializable
    this.dataFieldGroup,    // FieldGroupStruct - easy to pass
  });

  final ObjectStruct? dataObject;
  final FieldGroupStruct? dataFieldGroup;
}
```

### Conversion Pattern

**Record → Struct** (for UI):
```dart
// Records contain structs as fields
FieldRecord fieldRecord = await getFieldRecord();
RecordStruct struct = fieldRecord.dataRecord;  // Extract struct
```

**Struct → Record** (for database):
```dart
// Create Firestore data from struct
Map<String, dynamic> data = createFieldRecordData(
  dataRecord: myRecordStruct,
);

// Write to Firestore
await FieldRecord.collection(parent).doc(id).set(data);
```

---

## Data Flow Patterns

### Pattern 1: Fetch → Transform → Display

This is the most common pattern in your app.

```dart
// Step 1: Fetch Records from Firestore (Data Layer)
Stream<List<DataRecord>> dataStream = queryDataRecords();

// Step 2: Transform to Structs (Transform Layer)
StreamBuilder<List<DataRecord>>(
  stream: dataStream,
  builder: (context, snapshot) {
    if (!snapshot.hasData) return LoadingWidget();
    
    // Extract structs from records
    final recordStructs = snapshot.data!
        .map((record) => record.recordStruct)
        .toList();
    
    // Step 3: Pass Structs to UI (Presentation Layer)
    return ListView.builder(
      itemCount: recordStructs.length,
      itemBuilder: (context, index) {
        return CardDynamicWidget(
          dataObject: recordStructs[index].objectStruct,
        );
      },
    );
  },
)
```

### Pattern 2: Parent Passes Data Down

Parent widgets own the data and pass it down to children.

```dart
// Parent Widget
class RecordReadViewWidget extends StatefulWidget {
  final DataRecord dataRecord;
  
  @override
  Widget build(BuildContext context) {
    final recordStruct = dataRecord.recordStruct;
    
    return Column(
      children: [
        // Pass object data to card
        CardDynamicWidget(
          dataObject: recordStruct.objectStruct,
        ),
        
        // Pass specific field group to form
        BarSideFormWidget(
          fieldGroup: recordStruct.objectStruct.fieldGroupStructs.first,
        ),
      ],
    );
  }
}

// Child Widget - Receives data via constructor
class CardDynamicWidget extends StatefulWidget {
  const CardDynamicWidget({
    super.key,
    this.dataObject,
  });

  final ObjectStruct? dataObject;  // Receives struct from parent
  
  @override
  Widget build(BuildContext context) {
    // Access nested data
    final fieldGroups = widget.dataObject?.fieldGroupStructs ?? [];
    
    return Column(
      children: fieldGroups.map((group) => 
        FieldGroupWidget(fieldGroup: group)
      ).toList(),
    );
  }
}
```

### Pattern 3: Deep Nesting Navigation

Navigate through nested structures to access specific data.

```dart
class FieldListWidget extends StatelessWidget {
  final ObjectStruct objectStruct;
  
  @override
  Widget build(BuildContext context) {
    // Navigate through nested structure
    return ListView.builder(
      itemCount: objectStruct.fieldGroupStructs.length,
      itemBuilder: (context, groupIndex) {
        final fieldGroup = objectStruct.fieldGroupStructs[groupIndex];
        
        return Column(
          children: [
            Text(fieldGroup.nameFieldGroup),
            
            // Go one level deeper
            ...fieldGroup.fieldStructs.map((field) {
              return FieldDynamicWidget(
                field: field,  // Pass individual field struct
                properties: field.propertyStructs,  // And its properties
              );
            }).toList(),
          ],
        );
      },
    );
  }
}
```

### Pattern 4: Combining Records and Structs

Sometimes you need both - the Record for database operations and Struct for UI.

```dart
class FieldDynamicWidget extends StatefulWidget {
  const FieldDynamicWidget({
    super.key,
    this.field,           // FieldRecord - for database operations
    this.objectField,     // ObjectStruct - for display
    this.recordField,     // RecordStruct - for context
    this.properties,      // List<PropertyStruct> - for values
  });

  final FieldRecord? field;
  final ObjectStruct? objectField;
  final RecordStruct? recordField;
  final List<PropertyStruct>? properties;
}
```

---

## Best Practices

### 1. Immutability
Structs are designed to be immutable. Use helper methods to create modified copies:

```dart
// ❌ DON'T: Modify directly
fieldStruct.nameField = 'New Name';  // This works but violates immutability

// ✅ DO: Use update helpers
FieldStruct updatedField = createFieldStruct(
  idRefFieldRecord: fieldStruct.idRefFieldRecord,
  nameField: 'New Name',
  inputType: fieldStruct.inputType,
  // ... copy other fields
);

// Or use the update function
FieldStruct? updated = updateFieldStruct(
  fieldStruct,
  clearUnsetFields: false,
);
```

### 2. Null Safety
All structs have safe accessors and checks:

```dart
// Check before accessing
if (recordStruct.hasObjectStruct()) {
  final objectStruct = recordStruct.objectStruct;
  // Use objectStruct safely
}

// Or use null-aware operators
final typeObject = recordStruct.objectStruct.typeObject;  // Safe: returns '' if null
```

### 3. List Handling
Handle empty lists gracefully:

```dart
// Get list with default empty list
final fieldGroups = objectStruct.fieldGroupStructs;  // Never null, returns []

// Check if list has items
if (objectStruct.hasFieldGroupStructs()) {
  // List is not null and has items
}

// Safe iteration
for (final group in objectStruct.fieldGroupStructs) {
  // This is safe even if list is empty
}
```

### 4. Widget Decomposition
Break down complex widgets and pass specific data structures:

```dart
// ❌ DON'T: Pass entire top-level structure
class FieldWidget extends StatelessWidget {
  final DataRecord dataRecord;  // Too much data
  
  Widget build(BuildContext context) {
    final field = dataRecord.recordStruct.objectStruct
        .fieldGroupStructs[0].fieldStructs[0];  // Deep navigation
    return Text(field.nameField);
  }
}

// ✅ DO: Pass only what's needed
class FieldWidget extends StatelessWidget {
  final FieldStruct field;  // Exact data needed
  
  Widget build(BuildContext context) {
    return Text(field.nameField);  // Direct access
  }
}
```

### 5. State Management
Keep structs in widget state, not records:

```dart
class _MyWidgetState extends State<MyWidget> {
  // ✅ Good: Store struct in state
  late ObjectStruct _objectStruct;
  
  // ❌ Avoid: Storing records in state
  // DataRecord? _dataRecord;  // Use streams instead
  
  @override
  void initState() {
    super.initState();
    _objectStruct = widget.dataObject ?? ObjectStruct();
  }
  
  void updateObject(ObjectStruct newObject) {
    setState(() {
      _objectStruct = newObject;
    });
  }
}
```

### 6. Navigation Parameters
Use structs for navigation - they're serializable:

```dart
// ✅ Structs can be passed through routes
context.pushNamed(
  'RecordReadView',
  queryParameters: {
    'recordStruct': serializeParam(
      recordStruct,
      ParamType.DataStruct,
    ),
  },
);

// Retrieve in destination
final recordStruct = getParameter<RecordStruct>(
  context,
  'recordStruct',
);
```

---

## Common Patterns

### Pattern: Conditional Widget Based on Data

```dart
Widget build(BuildContext context) {
  final inputType = widget.field?.inputType ?? '';
  
  // Render different widgets based on struct data
  switch (inputType) {
    case 'text':
      return FieldStringWidget(
        field: widget.field,
        properties: widget.properties,
      );
    case 'number':
      return FieldNumberWidget(
        field: widget.field,
        properties: widget.properties,
      );
    case 'dropdown':
      return FieldDropdownWidget(
        field: widget.field,
        properties: widget.properties,
      );
    default:
      return Container();
  }
}
```

### Pattern: Building Lists from Nested Structs

```dart
Widget build(BuildContext context) {
  return ListView.builder(
    itemCount: widget.dataObject?.fieldGroupStructs.length ?? 0,
    itemBuilder: (context, index) {
      final fieldGroup = widget.dataObject!.fieldGroupStructs[index];
      
      return ExpansionTile(
        title: Text(fieldGroup.nameFieldGroup),
        children: fieldGroup.fieldStructs.map((field) {
          return ListTile(
            title: Text(field.nameField),
            subtitle: Text(field.inputType),
            trailing: Text('Position: ${field.displayPosition}'),
          );
        }).toList(),
      );
    },
  );
}
```

### Pattern: Filtering and Transforming Data

```dart
Widget build(BuildContext context) {
  // Filter non-system fields
  final userFields = widget.fieldGroup?.fieldStructs
      .where((field) => !field.isSystem)
      .toList() ?? [];
  
  // Sort by display position
  userFields.sort((a, b) => 
    a.displayPosition.compareTo(b.displayPosition)
  );
  
  // Transform to widgets
  return Column(
    children: userFields.map((field) {
      return FieldDynamicWidget(field: field);
    }).toList(),
  );
}
```

### Pattern: Updating Nested Structures

```dart
void updateFieldName(String fieldGroupId, String fieldId, String newName) {
  setState(() {
    // Create updated object with new nested data
    _objectStruct = ObjectStruct(
      idRefObjectRecord: _objectStruct.idRefObjectRecord,
      typeObject: _objectStruct.typeObject,
      fieldGroupStructs: _objectStruct.fieldGroupStructs.map((group) {
        if (group.idRefFieldGroupRecord == fieldGroupId) {
          // Update specific field in this group
          return FieldGroupStruct(
            idRefFieldGroupRecord: group.idRefFieldGroupRecord,
            nameFieldGroup: group.nameFieldGroup,
            fieldStructs: group.fieldStructs.map((field) {
              if (field.idRefFieldRecord == fieldId) {
                // Update this field
                return createFieldStruct(
                  idRefFieldRecord: field.idRefFieldRecord,
                  nameField: newName,  // New value
                  inputType: field.inputType,
                  // ... copy other fields
                );
              }
              return field;
            }).toList(),
          );
        }
        return group;
      }).toList(),
    );
  });
}
```

---

## Examples

### Example 1: Complete Data Flow - Card Widget

This example shows the complete flow from database to UI:

```dart
// 1. Page fetches data from Firestore
class HomePage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return StreamBuilder<List<DataRecord>>(
      stream: queryDataRecordCollection(),
      builder: (context, snapshot) {
        if (!snapshot.hasData) {
          return Center(child: CircularProgressIndicator());
        }
        
        // 2. Extract records and convert to structs
        final dataRecords = snapshot.data!;
        
        return ListView.builder(
          itemCount: dataRecords.length,
          itemBuilder: (context, index) {
            final recordStruct = dataRecords[index].recordStruct;
            
            // 3. Pass struct to card widget
            return CardDynamicWidget(
              dataObject: recordStruct.objectStruct,
              dataFieldGroup: recordStruct.objectStruct.fieldGroupStructs.firstOrNull,
            );
          },
        );
      },
    );
  }
}

// 4. Card widget receives and displays struct data
class CardDynamicWidget extends StatefulWidget {
  const CardDynamicWidget({
    super.key,
    this.dataObject,
    this.dataFieldGroup,
  });

  final ObjectStruct? dataObject;
  final FieldGroupStruct? dataFieldGroup;

  @override
  State<CardDynamicWidget> createState() => _CardDynamicWidgetState();
}

class _CardDynamicWidgetState extends State<CardDynamicWidget> {
  late CardDynamicModel _model;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Column(
        children: [
          // 5. Display data from struct
          CardTitleWidget(
            title: widget.dataObject?.typeObject ?? '',
          ),
          
          // 6. Pass nested data to child widgets
          ...widget.dataObject?.fieldGroupStructs.map((group) {
            return ListTileGroupWidget(
              fieldGroup: group,
            );
          }).toList() ?? [],
        ],
      ),
    );
  }
}

// 7. Nested widget receives specific part of struct
class ListTileGroupWidget extends StatelessWidget {
  const ListTileGroupWidget({
    super.key,
    required this.fieldGroup,
  });

  final FieldGroupStruct fieldGroup;

  @override
  Widget build(BuildContext context) {
    return ExpansionTile(
      title: Text(fieldGroup.nameFieldGroup),
      children: fieldGroup.fieldStructs.map((field) {
        // 8. Pass individual field to specialized widget
        return TileDynamicWidget(
          fieldStruct: field,
        );
      }).toList(),
    );
  }
}
```

### Example 2: Form with Field Types

This example shows dynamic widget rendering based on struct data:

```dart
class FieldDynamicWidget extends StatefulWidget {
  const FieldDynamicWidget({
    super.key,
    this.properties,
    this.selectedProperties,
    this.field,
    this.objectField,
    this.recordField,
  });

  final List<PropertyStruct>? properties;
  final List<PropertyStruct>? selectedProperties;
  final FieldRecord? field;
  final ObjectStruct? objectField;
  final RecordStruct? recordField;

  @override
  State<FieldDynamicWidget> createState() => _FieldDynamicWidgetState();
}

class _FieldDynamicWidgetState extends State<FieldDynamicWidget> {
  @override
  Widget build(BuildContext context) {
    // Get field struct from record
    final fieldStruct = widget.field?.dataRecord.objectStruct
        .fieldGroupStructs.firstOrNull?.fieldStructs.firstOrNull;
    
    final inputType = fieldStruct?.inputType ?? '';

    // Render different widget based on inputType
    switch (inputType) {
      case 'text':
        return FieldStringWidget(
          fieldStruct: fieldStruct!,
          properties: widget.properties ?? [],
        );
        
      case 'number':
        return FieldNumberWidget(
          fieldStruct: fieldStruct!,
          properties: widget.properties ?? [],
        );
        
      case 'dropdown':
        return FieldDropdownWidget(
          fieldStruct: fieldStruct!,
          properties: widget.properties ?? [],
          options: fieldStruct.propertyStructs,
        );
        
      case 'radio':
        return FieldRadioWidget(
          fieldStruct: fieldStruct!,
          properties: widget.properties ?? [],
          options: fieldStruct.propertyStructs,
        );
        
      case 'image':
        return FieldImageWidget(
          fieldStruct: fieldStruct!,
          properties: widget.properties ?? [],
        );
        
      default:
        return Container(
          child: Text('Unsupported field type: $inputType'),
        );
    }
  }
}
```

### Example 3: Updating Firestore from Struct

This example shows writing struct data back to Firestore:

```dart
class FormWidget extends StatefulWidget {
  final RecordStruct recordStruct;
  final DocumentReference recordReference;
  
  @override
  State<FormWidget> createState() => _FormWidgetState();
}

class _FormWidgetState extends State<FormWidget> {
  late RecordStruct _currentStruct;
  
  @override
  void initState() {
    super.initState();
    _currentStruct = widget.recordStruct;
  }
  
  // Update struct in state
  void updateFieldValue(
    String fieldGroupId,
    String fieldId,
    String propertyValue,
  ) {
    setState(() {
      // Create new struct with updated value
      _currentStruct = RecordStruct(
        idRecord: _currentStruct.idRecord,
        objectStruct: _updateObjectStruct(
          _currentStruct.objectStruct,
          fieldGroupId,
          fieldId,
          propertyValue,
        ),
      );
    });
  }
  
  ObjectStruct _updateObjectStruct(
    ObjectStruct objectStruct,
    String fieldGroupId,
    String fieldId,
    String propertyValue,
  ) {
    return ObjectStruct(
      idRefObjectRecord: objectStruct.idRefObjectRecord,
      typeObject: objectStruct.typeObject,
      fieldGroupStructs: objectStruct.fieldGroupStructs.map((group) {
        if (group.idRefFieldGroupRecord == fieldGroupId) {
          return _updateFieldGroupStruct(group, fieldId, propertyValue);
        }
        return group;
      }).toList(),
    );
  }
  
  FieldGroupStruct _updateFieldGroupStruct(
    FieldGroupStruct group,
    String fieldId,
    String propertyValue,
  ) {
    return FieldGroupStruct(
      idRefFieldGroupRecord: group.idRefFieldGroupRecord,
      nameFieldGroup: group.nameFieldGroup,
      fieldStructs: group.fieldStructs.map((field) {
        if (field.idRefFieldRecord == fieldId) {
          return _updateFieldStruct(field, propertyValue);
        }
        return field;
      }).toList(),
    );
  }
  
  FieldStruct _updateFieldStruct(FieldStruct field, String propertyValue) {
    return createFieldStruct(
      idRefFieldRecord: field.idRefFieldRecord,
      nameField: field.nameField,
      inputType: field.inputType,
      displayPosition: field.displayPosition,
      isSelectMany: field.isSelectMany,
      isSystem: field.isSystem,
      // Update property value
      fieldValues: {
        'propertyStructs': [
          createPropertyStruct(
            valueProperty: propertyValue,
          ).toMap(),
        ],
      },
    );
  }
  
  // Save to Firestore
  Future<void> saveToFirestore() async {
    try {
      // Convert struct to Firestore data
      final data = createDataRecordData(
        recordStruct: _currentStruct,
      );
      
      // Update Firestore document
      await widget.recordReference.update(data);
      
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Saved successfully')),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error saving: $e')),
      );
    }
  }
  
  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // Render fields
        ..._currentStruct.objectStruct.fieldGroupStructs.expand((group) {
          return group.fieldStructs.map((field) {
            return TextFormField(
              decoration: InputDecoration(
                labelText: field.nameField,
              ),
              onChanged: (value) {
                updateFieldValue(
                  group.idRefFieldGroupRecord,
                  field.idRefFieldRecord,
                  value,
                );
              },
            );
          });
        }).toList(),
        
        // Save button
        ElevatedButton(
          onPressed: saveToFirestore,
          child: Text('Save'),
        ),
      ],
    );
  }
}
```

---

## Summary

### Key Takeaways

1. **Records are for Firestore** - Use them when reading/writing database
2. **Structs are for Widgets** - Use them when passing data through UI
3. **Data flows down** - Parent widgets pass structs to children via constructors
4. **Structs are nested** - Navigate through the hierarchy to access specific data
5. **Structs are immutable** - Create new instances rather than modifying existing ones
6. **Use helper functions** - `create*Struct()` and `update*Struct()` for modifications
7. **Null safety** - All structs have safe accessors with default values
8. **Serializable** - Structs can be passed through navigation parameters

### Quick Reference

| Task | Use | Example |
|------|-----|---------|
| Fetch from database | `*Record` | `queryDataRecordCollection()` |
| Pass to widget | `*Struct` | `CardWidget(dataObject: objectStruct)` |
| Store in state | `*Struct` | `late ObjectStruct _objectStruct;` |
| Navigate with data | `*Struct` | `context.pushNamed('page', params: {...})` |
| Update database | Convert Struct → Record | `createDataRecordData(recordStruct: struct)` |
| Access nested data | Navigate struct properties | `recordStruct.objectStruct.fieldGroupStructs[0]` |

---

## Additional Resources

- **Firestore Utilities**: `lib/backend/schema/util/firestore_util.dart`
- **Schema Utilities**: `lib/backend/schema/util/schema_util.dart`
- **Struct Definitions**: `lib/backend/schema/structs/`
- **Record Definitions**: `lib/backend/schema/`
- **Example Widgets**: `lib/cards/card_dynamic/` and `lib/bar_side/forms/`
