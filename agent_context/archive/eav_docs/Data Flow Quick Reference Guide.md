# Data Flow Quick Reference Guide

## 🎯 When to Use What

| Scenario | Use | Why |
|----------|-----|-----|
| Fetching from Firestore | `*Record` classes | Have DocumentReference & snapshot methods |
| Passing data to widgets | `*Struct` classes | Lightweight, serializable, immutable |
| Storing in widget state | `*Struct` classes | No unnecessary Firestore metadata |
| Navigation parameters | `*Struct` classes | Can be serialized with `serializeParam()` |
| Writing to Firestore | Convert Struct → Map | Use `create*RecordData()` functions |
| StreamBuilder source | `*Record` stream | Firestore streams return Records |

## 📊 Data Structure Cheat Sheet

```
DataRecord (Firestore Doc)
  └─ recordStruct: RecordStruct
       ├─ idRecord: String
       └─ objectStruct: ObjectStruct
            ├─ idRefObjectRecord: String
            ├─ typeObject: String
            └─ fieldGroupStructs: List<FieldGroupStruct>
                 ├─ idRefFieldGroupRecord: String
                 ├─ nameFieldGroup: String
                 └─ fieldStructs: List<FieldStruct>
                      ├─ idRefFieldRecord: String
                      ├─ nameField: String
                      ├─ inputType: String
                      ├─ displayPosition: double
                      ├─ isSelectMany: bool
                      ├─ isSystem: bool
                      └─ propertyStructs: List<PropertyStruct>
                           ├─ valueProperty: String
                           └─ recordSnapshotStruct: RecordSnapshotStruct
```

## 🔄 Common Conversion Patterns

### Record → Struct (Database to UI)
```dart
DataRecord record = await getDataRecord();
RecordStruct struct = record.recordStruct;  // Extract struct
```

### Struct → Record Data (UI to Database)
```dart
Map<String, dynamic> data = createDataRecordData(
  recordStruct: myStruct,
);
await documentRef.update(data);
```

## 📝 Code Snippets

### 1. Fetch and Display Pattern
```dart
StreamBuilder<List<DataRecord>>(
  stream: queryDataRecordCollection(),
  builder: (context, snapshot) {
    if (!snapshot.hasData) return LoadingWidget();
    
    return ListView.builder(
      itemCount: snapshot.data!.length,
      itemBuilder: (context, index) {
        final struct = snapshot.data![index].recordStruct;
        return MyWidget(data: struct.objectStruct);
      },
    );
  },
)
```

### 2. Pass Data Down Widget Tree
```dart
// Parent
class ParentWidget extends StatelessWidget {
  final RecordStruct recordStruct;
  
  Widget build(BuildContext context) {
    return ChildWidget(
      objectStruct: recordStruct.objectStruct,  // Pass struct down
    );
  }
}

// Child
class ChildWidget extends StatelessWidget {
  final ObjectStruct objectStruct;  // Receive struct
  
  Widget build(BuildContext context) {
    return Text(objectStruct.typeObject);
  }
}
```

### 3. Navigate with Nested Data
```dart
// Access nested struct
final fieldGroups = recordStruct.objectStruct.fieldGroupStructs;

for (final group in fieldGroups) {
  final fields = group.fieldStructs;
  for (final field in fields) {
    final properties = field.propertyStructs;
    // Use nested data
  }
}
```

### 4. Safe Null Handling
```dart
// Check existence
if (recordStruct.hasObjectStruct()) {
  final obj = recordStruct.objectStruct;
}

// Safe access with defaults
final type = recordStruct.objectStruct.typeObject;  // Returns '' if null
final groups = objectStruct.fieldGroupStructs;      // Returns [] if null

// Null-aware
final name = fieldGroup?.nameFieldGroup ?? 'Unknown';
```

### 5. Update Struct (Immutable Pattern)
```dart
// Create new struct with updates
FieldStruct updated = createFieldStruct(
  idRefFieldRecord: original.idRefFieldRecord,
  nameField: 'New Name',  // Changed value
  inputType: original.inputType,
  displayPosition: original.displayPosition,
  isSelectMany: original.isSelectMany,
  isSystem: original.isSystem,
);

// Or use update helper
FieldStruct? updated = updateFieldStruct(
  original,
  clearUnsetFields: false,
);
```

### 6. Filter and Transform
```dart
// Filter system fields
final userFields = fieldGroup.fieldStructs
    .where((field) => !field.isSystem)
    .toList();

// Sort by position
userFields.sort((a, b) => 
  a.displayPosition.compareTo(b.displayPosition)
);

// Map to widgets
final widgets = userFields.map((field) => 
  FieldWidget(field: field)
).toList();
```

### 7. Dynamic Widget Rendering
```dart
Widget buildField(FieldStruct field) {
  switch (field.inputType) {
    case 'text':
      return FieldStringWidget(fieldStruct: field);
    case 'number':
      return FieldNumberWidget(fieldStruct: field);
    case 'dropdown':
      return FieldDropdownWidget(
        fieldStruct: field,
        options: field.propertyStructs,
      );
    default:
      return Container();
  }
}
```

### 8. Save to Firestore
```dart
Future<void> saveStruct(
  DocumentReference ref,
  RecordStruct struct,
) async {
  final data = createDataRecordData(recordStruct: struct);
  await ref.update(data);
}
```

### 9. Navigate with Struct
```dart
// Navigate with struct parameter
context.pushNamed(
  'DetailPage',
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

### 10. Build List from Nested Structs
```dart
Column(
  children: objectStruct.fieldGroupStructs
    .expand((group) => group.fieldStructs)
    .map((field) => ListTile(
      title: Text(field.nameField),
      subtitle: Text(field.inputType),
    ))
    .toList(),
)
```

## ⚡ Best Practices Checklist

- ✅ Use `*Record` only for Firestore operations
- ✅ Use `*Struct` for all widget parameters
- ✅ Store structs in widget state, not records
- ✅ Extract structs from records immediately after fetching
- ✅ Pass only the needed struct level to child widgets
- ✅ Use `has*()` methods to check for null before accessing
- ✅ Use safe accessors that return defaults (`''`, `[]`, `0.0`)
- ✅ Create new structs instead of modifying existing ones
- ✅ Use helper functions: `create*Struct()`, `update*Struct()`
- ✅ Serialize structs when passing through navigation

## ❌ Common Mistakes to Avoid

- ❌ Passing entire `DataRecord` to widgets
- ❌ Storing `*Record` objects in widget state
- ❌ Mutating struct properties directly
- ❌ Deep navigation without null checks
- ❌ Passing top-level structs when only need nested data
- ❌ Using records for navigation parameters
- ❌ Forgetting to extract structs from records
- ❌ Not using safe accessors (risking null errors)

## 🔍 Debugging Tips

### Check Data Structure
```dart
// Print struct hierarchy
debugPrint('Record: ${recordStruct.toMap()}');
debugPrint('Object: ${objectStruct.toMap()}');
debugPrint('Field Groups: ${fieldGroupStructs.length}');
```

### Verify Null Values
```dart
// Check each level
debugPrint('Has Object: ${recordStruct.hasObjectStruct()}');
debugPrint('Has Groups: ${objectStruct.hasFieldGroupStructs()}');
debugPrint('Groups Count: ${objectStruct.fieldGroupStructs.length}');
```

### Validate Firestore Data
```dart
// Check if data exists in record
final record = await DataRecord.getDocumentOnce(ref);
debugPrint('Snapshot Data: ${record.snapshotData}');
debugPrint('Has Struct: ${record.hasRecordStruct()}');
```

## 📚 Related Files

| File | Purpose |
|------|---------|
| `lib/backend/schema/*_record.dart` | Firestore Record definitions |
| `lib/backend/schema/structs/*_struct.dart` | Struct definitions |
| `lib/backend/schema/util/firestore_util.dart` | Firestore conversion utilities |
| `lib/backend/schema/util/schema_util.dart` | Schema utilities |
| `lib/cards/card_dynamic/` | Example of struct usage in cards |
| `lib/bar_side/forms/field_group_list/` | Example of nested struct navigation |

## 🎓 Learning Path

1. **Start Here**: Read `RecordStruct` and `ObjectStruct` definitions
2. **Understand Nesting**: See how structs contain other structs
3. **See in Action**: Look at `CardDynamicWidget` usage
4. **Practice**: Create a simple widget that displays nested data
5. **Advanced**: Update nested structs immutably
6. **Master**: Build dynamic forms based on struct data

---

**💡 Pro Tip**: When in doubt, use structs for everything except direct Firestore operations!
