# Data Architecture Visual Guide

## 📋 Table of Contents
1. [System Overview](#system-overview)
2. [Data Layer Architecture](#data-layer-architecture)
3. [Widget Data Flow](#widget-data-flow)
4. [Real-World Examples](#real-world-examples)

---

## System Overview

### Three-Layer Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER                       │
│                        (Widgets)                            │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ HomePage │  │  Cards   │  │  Forms   │  │  Lists   │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
│         ▲              ▲              ▲              ▲      │
│         │              │              │              │      │
│         │         Structs flow up     │              │      │
│         │              │              │              │      │
└─────────┼──────────────┼──────────────┼──────────────┼──────┘
          │              │              │              │
┌─────────┼──────────────┼──────────────┼──────────────┼──────┐
│         │              │              │              │      │
│         │        TRANSFORM LAYER       │              │      │
│         │      (Records → Structs)     │              │      │
│         │              │              │              │      │
│  ┌──────▼──────────────▼──────────────▼──────────────▼────┐ │
│  │          StreamBuilder / FutureBuilder                 │ │
│  │  • Fetch Records                                       │ │
│  │  • Extract Structs                                     │ │
│  │  • Pass to Widgets                                     │ │
│  └────────────────────────┬───────────────────────────────┘ │
│                           │                                 │
└───────────────────────────┼─────────────────────────────────┘
                            │
┌───────────────────────────┼─────────────────────────────────┐
│                           │                                 │
│                      DATA LAYER                             │
│                   (Firebase Records)                        │
│                           │                                 │
│  ┌────────────────────────▼───────────────────────────┐    │
│  │             Cloud Firestore Database               │    │
│  │                                                     │    │
│  │  Collection: data                                   │    │
│  │  └─ Document: {id}                                  │    │
│  │      └─ recordStruct: { ... }                       │    │
│  │                                                     │    │
│  │  Collection: field                                  │    │
│  │  └─ Document: {id}                                  │    │
│  │      └─ data_record: { ... }                        │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## Data Layer Architecture

### Record Types and Their Relationships

```
Firestore Collections:
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  📁 data/                                                   │
│    └─ 📄 {documentId}                                       │
│        ├─ recordStruct: RecordStruct                       │
│        └─ (metadata)                                        │
│                                                             │
│  📁 organization/{orgId}/field/                             │
│    └─ 📄 {fieldId}                                          │
│        ├─ data_record: RecordStruct                        │
│        └─ (metadata)                                        │
│                                                             │
│  📁 organization/{orgId}/object/                            │
│    └─ 📄 {objectId}                                         │
│        ├─ data_record: RecordStruct                        │
│        └─ (metadata)                                        │
│                                                             │
│  📁 organization/{orgId}/field_group/                       │
│    └─ 📄 {groupId}                                          │
│        ├─ data_record: RecordStruct                        │
│        └─ (metadata)                                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Record Class Hierarchy

```
FirestoreRecord (Abstract Base)
    │
    ├─ DataRecord
    │   └─ recordStruct: RecordStruct
    │
    ├─ FieldRecord (Subcollection)
    │   └─ dataRecord: RecordStruct
    │
    ├─ ObjectRecord (Subcollection)
    │   └─ dataRecord: RecordStruct
    │
    ├─ FieldGroupRecord (Subcollection)
    │   └─ dataRecord: RecordStruct
    │
    ├─ PropertyRecord (Subcollection)
    │   └─ dataRecord: RecordStruct
    │
    └─ OrganizationRecord
        └─ (various fields)
```

### Struct Class Hierarchy

```
FFFirebaseStruct (Abstract Base)
    │
    ├─ RecordStruct
    │   ├─ idRecord: String
    │   └─ objectStruct: ObjectStruct ────┐
    │                                     │
    ├─ ObjectStruct ◄─────────────────────┘
    │   ├─ idRefObjectRecord: String
    │   ├─ typeObject: String
    │   └─ fieldGroupStructs: List<FieldGroupStruct> ────┐
    │                                                     │
    ├─ FieldGroupStruct ◄─────────────────────────────────┘
    │   ├─ idRefFieldGroupRecord: String
    │   ├─ nameFieldGroup: String
    │   └─ fieldStructs: List<FieldStruct> ────┐
    │                                           │
    ├─ FieldStruct ◄────────────────────────────┘
    │   ├─ idRefFieldRecord: String
    │   ├─ nameField: String
    │   ├─ inputType: String
    │   ├─ displayPosition: double
    │   ├─ isSelectMany: bool
    │   ├─ isSystem: bool
    │   └─ propertyStructs: List<PropertyStruct> ────┐
    │                                                 │
    └─ PropertyStruct ◄───────────────────────────────┘
        ├─ valueProperty: String
        └─ recordSnapshotStruct: RecordSnapshotStruct
```

---

## Widget Data Flow

### Complete Flow: Database → UI

```
1. FETCH FROM FIRESTORE
┌─────────────────────────────────────────┐
│  Stream<List<DataRecord>>               │
│  queryDataRecordCollection()            │
└───────────────┬─────────────────────────┘
                │
                ▼
2. STREAMBUILDER RECEIVES RECORDS
┌─────────────────────────────────────────┐
│  StreamBuilder<List<DataRecord>>(       │
│    stream: queryDataRecordCollection(), │
│    builder: (context, snapshot) { ... } │
│  )                                       │
└───────────────┬─────────────────────────┘
                │
                ▼
3. EXTRACT STRUCTS FROM RECORDS
┌─────────────────────────────────────────┐
│  final records = snapshot.data!;        │
│  final structs = records                │
│    .map((r) => r.recordStruct)          │
│    .toList();                           │
└───────────────┬─────────────────────────┘
                │
                ▼
4. PASS TO LIST BUILDER
┌─────────────────────────────────────────┐
│  ListView.builder(                      │
│    itemCount: structs.length,           │
│    itemBuilder: (context, index) {      │
│      return CardWidget(                 │
│        data: structs[index],            │
│      );                                 │
│    },                                   │
│  )                                      │
└───────────────┬─────────────────────────┘
                │
                ▼
5. WIDGET RECEIVES STRUCT
┌─────────────────────────────────────────┐
│  class CardWidget extends StatelessWidget│
│    final RecordStruct data;             │
│                                         │
│    Widget build(BuildContext context) { │
│      return Text(                       │
│        data.objectStruct.typeObject     │
│      );                                 │
│    }                                    │
│  }                                      │
└─────────────────────────────────────────┘
```

### Nested Widget Data Passing

```
Parent Widget (Page)
  ├─ Receives: DataRecord
  ├─ Extracts: RecordStruct
  └─ Passes Down ──┐
                   │
                   ▼
┌──────────────────────────────────────┐
│  CardDynamicWidget                   │
│  • Receives: RecordStruct            │
│  • Uses: recordStruct.objectStruct   │
│  • Passes Down ──┐                   │
└──────────────────┼───────────────────┘
                   │
                   ▼
┌──────────────────────────────────────┐
│  ListTileGroupWidget                 │
│  • Receives: ObjectStruct            │
│  • Uses: objectStruct.fieldGroups    │
│  • Iterates: fieldGroupStructs       │
│  • Passes Down ──┐                   │
└──────────────────┼───────────────────┘
                   │
                   ▼
┌──────────────────────────────────────┐
│  FieldGroupWidget                    │
│  • Receives: FieldGroupStruct        │
│  • Uses: fieldGroup.nameFieldGroup   │
│  • Iterates: fieldGroup.fieldStructs │
│  • Passes Down ──┐                   │
└──────────────────┼───────────────────┘
                   │
                   ▼
┌──────────────────────────────────────┐
│  FieldDynamicWidget                  │
│  • Receives: FieldStruct             │
│  • Uses: field.inputType             │
│  • Renders: Based on type            │
│  • Uses: field.propertyStructs       │
└──────────────────────────────────────┘
```

### Update Flow: UI → Database

```
1. USER INTERACTION
┌─────────────────────────────────────────┐
│  TextFormField(                         │
│    onChanged: (value) {                 │
│      updateFieldValue(fieldId, value);  │
│    },                                   │
│  )                                      │
└───────────────┬─────────────────────────┘
                │
                ▼
2. UPDATE LOCAL STRUCT (setState)
┌─────────────────────────────────────────┐
│  void updateFieldValue(id, value) {     │
│    setState(() {                        │
│      _recordStruct = _createUpdated(... │
│    });                                  │
│  }                                      │
└───────────────┬─────────────────────────┘
                │
                ▼
3. CREATE UPDATED STRUCT (Immutable)
┌─────────────────────────────────────────┐
│  RecordStruct _createUpdated(...) {     │
│    return RecordStruct(                 │
│      idRecord: _recordStruct.idRecord,  │
│      objectStruct: _updateObject(...),  │
│    );                                   │
│  }                                      │
└───────────────┬─────────────────────────┘
                │
                ▼
4. CONVERT STRUCT TO FIRESTORE DATA
┌─────────────────────────────────────────┐
│  final data = createDataRecordData(     │
│    recordStruct: _recordStruct,         │
│  );                                     │
└───────────────┬─────────────────────────┘
                │
                ▼
5. SAVE TO FIRESTORE
┌─────────────────────────────────────────┐
│  await documentRef.update(data);        │
└─────────────────────────────────────────┘
```

---

## Real-World Examples

### Example 1: Card Component Data Flow

```
HomePage
└─ StreamBuilder<List<DataRecord>>
    └─ ListView.builder
        └─ CardDynamicWidget
            ├─ Input: ObjectStruct
            │   ├─ typeObject: "Contact"
            │   └─ fieldGroupStructs: [
            │       {
            │         nameFieldGroup: "Basic Info",
            │         fieldStructs: [
            │           {
            │             nameField: "First Name",
            │             inputType: "text",
            │             propertyStructs: [{
            │               valueProperty: "John"
            │             }]
            │           },
            │           {
            │             nameField: "Last Name",
            │             inputType: "text",
            │             propertyStructs: [{
            │               valueProperty: "Doe"
            │             }]
            │           }
            │         ]
            │       }
            │     ]
            │
            ├─ CardTitleWidget
            │   └─ Shows: "Contact"
            │
            └─ ListTileGroupWidget (for each fieldGroup)
                └─ Shows: "Basic Info"
                    └─ TileDynamicWidget (for each field)
                        ├─ Shows: "First Name: John"
                        └─ Shows: "Last Name: Doe"
```

### Example 2: Form Component Data Flow

```
BarSideFormWidget
├─ Input: RecordStruct
│   └─ objectStruct
│       └─ fieldGroupStructs
│
├─ State: _currentStruct: RecordStruct
│
└─ Column
    └─ FieldGroupListWidget
        └─ For each fieldGroup in fieldGroupStructs:
            └─ FieldGroupItemWidget
                └─ ExpansionTile(title: fieldGroup.nameFieldGroup)
                    └─ FieldListWidget
                        └─ For each field in fieldGroup.fieldStructs:
                            └─ FieldDynamicWidget
                                ├─ Reads: field.inputType
                                │
                                ├─ If "text": FieldStringWidget
                                │   └─ TextFormField
                                │       ├─ label: field.nameField
                                │       └─ value: field.propertyStructs[0].valueProperty
                                │
                                ├─ If "number": FieldNumberWidget
                                │   └─ TextFormField (numeric keyboard)
                                │
                                ├─ If "dropdown": FieldDropdownWidget
                                │   └─ DropdownButton
                                │       └─ items: field.propertyStructs
                                │
                                └─ If "radio": FieldRadioWidget
                                    └─ Radio buttons
                                        └─ options: field.propertyStructs
```

### Example 3: Nested Data Access Pattern

```dart
// Full path from top to property value:

DataRecord record = await getDataRecord();
                                    │
                                    ▼
RecordStruct recordStruct = record.recordStruct;
                                    │
                                    ▼
ObjectStruct objectStruct = recordStruct.objectStruct;
                                    │
                                    ▼
List<FieldGroupStruct> groups = objectStruct.fieldGroupStructs;
                                    │
                                    ▼
FieldGroupStruct firstGroup = groups[0];
                                    │
                                    ▼
List<FieldStruct> fields = firstGroup.fieldStructs;
                                    │
                                    ▼
FieldStruct firstField = fields[0];
                                    │
                                    ▼
List<PropertyStruct> properties = firstField.propertyStructs;
                                    │
                                    ▼
PropertyStruct firstProperty = properties[0];
                                    │
                                    ▼
String value = firstProperty.valueProperty;
```

### Example 4: State Management Pattern

```
Widget State Lifecycle:

1. INITIALIZATION
   ┌─────────────────────────────────┐
   │  initState() {                  │
   │    _recordStruct = widget.data; │
   │  }                              │
   └─────────────────────────────────┘

2. USER INTERACTION
   ┌─────────────────────────────────┐
   │  onFieldChanged(value) {        │
   │    // Update local struct       │
   │  }                              │
   └─────────────────────────────────┘

3. LOCAL UPDATE
   ┌─────────────────────────────────┐
   │  setState(() {                  │
   │    _recordStruct = newStruct;   │
   │  });                            │
   └─────────────────────────────────┘

4. UI REBUILD
   ┌─────────────────────────────────┐
   │  build(BuildContext context) {  │
   │    return renderStruct(          │
   │      _recordStruct              │
   │    );                           │
   │  }                              │
   └─────────────────────────────────┘

5. SAVE TO DATABASE (when ready)
   ┌─────────────────────────────────┐
   │  onSave() async {               │
   │    final data = create...Data(  │
   │      recordStruct: _recordStruct│
   │    );                           │
   │    await ref.update(data);      │
   │  }                              │
   └─────────────────────────────────┘
```

### Example 5: Dynamic Widget Selection

```
FieldDynamicWidget receives FieldStruct
           │
           ▼
    Check field.inputType
           │
           ├─ "text" ────────► FieldStringWidget
           │                      └─ TextFormField
           │
           ├─ "number" ──────► FieldNumberWidget
           │                      └─ TextFormField (numbers only)
           │
           ├─ "dropdown" ────► FieldDropdownWidget
           │                      └─ DropdownButton
           │                          └─ items from propertyStructs
           │
           ├─ "radio" ───────► FieldRadioWidget
           │                      └─ Radio.group
           │                          └─ options from propertyStructs
           │
           ├─ "checkbox" ────► FieldCheckboxWidget
           │                      └─ Checkbox
           │
           ├─ "date" ────────► FieldDateTimeWidget
           │                      └─ DatePicker
           │
           ├─ "image" ───────► FieldImageWidget
           │                      └─ ImagePicker
           │
           └─ default ───────► Container (empty)
```

---

## Data Access Patterns Summary

### Pattern 1: Direct Property Access
```dart
final name = fieldStruct.nameField;  // Safe, returns '' if null
```

### Pattern 2: Null Check Access
```dart
if (fieldStruct.hasNameField()) {
  final name = fieldStruct.nameField;
}
```

### Pattern 3: Null-Aware Access
```dart
final name = fieldStruct?.nameField ?? 'Default';
```

### Pattern 4: Safe List Access
```dart
final fields = fieldGroup.fieldStructs;  // Never null, returns []
final firstField = fields.firstOrNull;   // Returns null if empty
```

### Pattern 5: Deep Navigation
```dart
final value = recordStruct
    .objectStruct
    .fieldGroupStructs
    .firstOrNull
    ?.fieldStructs
    .firstOrNull
    ?.propertyStructs
    .firstOrNull
    ?.valueProperty ?? 'N/A';
```

---

## Memory & Performance Considerations

### ✅ Efficient Patterns

```
1. Extract structs early, discard records
   Record (with metadata) ──► Struct (lightweight)
   
2. Pass only needed data level
   Don't pass RecordStruct when only need FieldStruct
   
3. Use const constructors where possible
   const FieldWidget(field: field)
   
4. Cache computed values
   Store filtered/sorted lists in state
```

### ❌ Inefficient Patterns

```
1. Keeping records in widget state
   Memory overhead from Firestore metadata
   
2. Deep navigation in build methods
   Recalculated on every rebuild
   
3. Passing entire data trees
   Unnecessary data copying
   
4. Not using const where possible
   More widget rebuilds
```

---

## Troubleshooting Flowchart

```
Widget not showing data?
        │
        ▼
Is snapshot.hasData true? ──NO──► Check stream/future
        │ YES                      Check Firestore rules
        ▼
Is data list empty? ──YES──► Check database
        │ NO                  Check query
        ▼
Extract struct from record ──► Check extraction logic
        │
        ▼
Pass struct to widget ──► Check constructor params
        │
        ▼
Access struct properties ──► Check null safety
        │
        ▼
Display in UI ──► Success!
```

---

## Quick Decision Tree

```
Need to...
    │
    ├─ Fetch from database? ────► Use *Record stream/future
    │
    ├─ Pass to widget? ─────────► Extract & pass *Struct
    │
    ├─ Store in state? ─────────► Use *Struct
    │
    ├─ Navigate with data? ─────► Serialize *Struct
    │
    ├─ Update database? ────────► Convert Struct → Map
    │
    └─ Access nested data? ─────► Navigate through structs
```

---

## Additional Diagrams

### Firestore to Widget Complete Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    FIRESTORE CLOUD                          │
│  data/{docId}                                              │
│    └─ recordStruct: { idRecord, objectStruct: {...} }      │
└───────────────────────┬─────────────────────────────────────┘
                        │ Stream/Future
                        ▼
┌─────────────────────────────────────────────────────────────┐
│              FLUTTER APP - DATA LAYER                       │
│  DataRecord.getDocument(ref)                               │
│    └─ Returns: DataRecord with recordStruct field          │
└───────────────────────┬─────────────────────────────────────┘
                        │ Extract
                        ▼
┌─────────────────────────────────────────────────────────────┐
│           FLUTTER APP - TRANSFORM LAYER                     │
│  final struct = record.recordStruct;                       │
│    └─ RecordStruct { idRecord, objectStruct }              │
└───────────────────────┬─────────────────────────────────────┘
                        │ Pass Down
                        ▼
┌─────────────────────────────────────────────────────────────┐
│          FLUTTER APP - PRESENTATION LAYER                   │
│  MyWidget(data: struct)                                    │
│    └─ Renders UI from struct properties                    │
└─────────────────────────────────────────────────────────────┘
```

---

**💡 Remember**: Records are for database, Structs are for UI. Extract early, pass down efficiently!
