// ignore_for_file: unnecessary_getters_setters

import 'package:cloud_firestore/cloud_firestore.dart';

import '/backend/schema/util/firestore_util.dart';

import '/flutter_flow/flutter_flow_util.dart';

class PropertySnapshotStruct extends FFFirebaseStruct {
  PropertySnapshotStruct({
    String? idRefPropertyRecord,
    String? valueProperty,
    String? idRefFieldRecord,
    String? nameField,
    FirestoreUtilData firestoreUtilData = const FirestoreUtilData(),
  })  : _idRefPropertyRecord = idRefPropertyRecord,
        _valueProperty = valueProperty,
        _idRefFieldRecord = idRefFieldRecord,
        _nameField = nameField,
        super(firestoreUtilData);

  // "idRefPropertyRecord" field.
  String? _idRefPropertyRecord;
  String get idRefPropertyRecord => _idRefPropertyRecord ?? '';
  set idRefPropertyRecord(String? val) => _idRefPropertyRecord = val;

  bool hasIdRefPropertyRecord() => _idRefPropertyRecord != null;

  // "valueProperty" field.
  String? _valueProperty;
  String get valueProperty => _valueProperty ?? '';
  set valueProperty(String? val) => _valueProperty = val;

  bool hasValueProperty() => _valueProperty != null;

  // "idRefFieldRecord" field.
  String? _idRefFieldRecord;
  String get idRefFieldRecord => _idRefFieldRecord ?? '';
  set idRefFieldRecord(String? val) => _idRefFieldRecord = val;

  bool hasIdRefFieldRecord() => _idRefFieldRecord != null;

  // "nameField" field.
  String? _nameField;
  String get nameField => _nameField ?? '';
  set nameField(String? val) => _nameField = val;

  bool hasNameField() => _nameField != null;

  static PropertySnapshotStruct fromMap(Map<String, dynamic> data) =>
      PropertySnapshotStruct(
        idRefPropertyRecord: data['idRefPropertyRecord'] as String?,
        valueProperty: data['valueProperty'] as String?,
        idRefFieldRecord: data['idRefFieldRecord'] as String?,
        nameField: data['nameField'] as String?,
      );

  static PropertySnapshotStruct? maybeFromMap(dynamic data) => data is Map
      ? PropertySnapshotStruct.fromMap(data.cast<String, dynamic>())
      : null;

  Map<String, dynamic> toMap() => {
        'idRefPropertyRecord': _idRefPropertyRecord,
        'valueProperty': _valueProperty,
        'idRefFieldRecord': _idRefFieldRecord,
        'nameField': _nameField,
      }.withoutNulls;

  @override
  Map<String, dynamic> toSerializableMap() => {
        'idRefPropertyRecord': serializeParam(
          _idRefPropertyRecord,
          ParamType.String,
        ),
        'valueProperty': serializeParam(
          _valueProperty,
          ParamType.String,
        ),
        'idRefFieldRecord': serializeParam(
          _idRefFieldRecord,
          ParamType.String,
        ),
        'nameField': serializeParam(
          _nameField,
          ParamType.String,
        ),
      }.withoutNulls;

  static PropertySnapshotStruct fromSerializableMap(
          Map<String, dynamic> data) =>
      PropertySnapshotStruct(
        idRefPropertyRecord: deserializeParam(
          data['idRefPropertyRecord'],
          ParamType.String,
          false,
        ),
        valueProperty: deserializeParam(
          data['valueProperty'],
          ParamType.String,
          false,
        ),
        idRefFieldRecord: deserializeParam(
          data['idRefFieldRecord'],
          ParamType.String,
          false,
        ),
        nameField: deserializeParam(
          data['nameField'],
          ParamType.String,
          false,
        ),
      );

  @override
  String toString() => 'PropertySnapshotStruct(${toMap()})';

  @override
  bool operator ==(Object other) {
    return other is PropertySnapshotStruct &&
        idRefPropertyRecord == other.idRefPropertyRecord &&
        valueProperty == other.valueProperty &&
        idRefFieldRecord == other.idRefFieldRecord &&
        nameField == other.nameField;
  }

  @override
  int get hashCode => const ListEquality()
      .hash([idRefPropertyRecord, valueProperty, idRefFieldRecord, nameField]);
}

PropertySnapshotStruct createPropertySnapshotStruct({
  String? idRefPropertyRecord,
  String? valueProperty,
  String? idRefFieldRecord,
  String? nameField,
  Map<String, dynamic> fieldValues = const {},
  bool clearUnsetFields = true,
  bool create = false,
  bool delete = false,
}) =>
    PropertySnapshotStruct(
      idRefPropertyRecord: idRefPropertyRecord,
      valueProperty: valueProperty,
      idRefFieldRecord: idRefFieldRecord,
      nameField: nameField,
      firestoreUtilData: FirestoreUtilData(
        clearUnsetFields: clearUnsetFields,
        create: create,
        delete: delete,
        fieldValues: fieldValues,
      ),
    );

PropertySnapshotStruct? updatePropertySnapshotStruct(
  PropertySnapshotStruct? propertySnapshot, {
  bool clearUnsetFields = true,
  bool create = false,
}) =>
    propertySnapshot
      ?..firestoreUtilData = FirestoreUtilData(
        clearUnsetFields: clearUnsetFields,
        create: create,
      );

void addPropertySnapshotStructData(
  Map<String, dynamic> firestoreData,
  PropertySnapshotStruct? propertySnapshot,
  String fieldName, [
  bool forFieldValue = false,
]) {
  firestoreData.remove(fieldName);
  if (propertySnapshot == null) {
    return;
  }
  if (propertySnapshot.firestoreUtilData.delete) {
    firestoreData[fieldName] = FieldValue.delete();
    return;
  }
  final clearFields =
      !forFieldValue && propertySnapshot.firestoreUtilData.clearUnsetFields;
  if (clearFields) {
    firestoreData[fieldName] = <String, dynamic>{};
  }
  final propertySnapshotData =
      getPropertySnapshotFirestoreData(propertySnapshot, forFieldValue);
  final nestedData =
      propertySnapshotData.map((k, v) => MapEntry('$fieldName.$k', v));

  final mergeFields = propertySnapshot.firestoreUtilData.create || clearFields;
  firestoreData
      .addAll(mergeFields ? mergeNestedFields(nestedData) : nestedData);
}

Map<String, dynamic> getPropertySnapshotFirestoreData(
  PropertySnapshotStruct? propertySnapshot, [
  bool forFieldValue = false,
]) {
  if (propertySnapshot == null) {
    return {};
  }
  final firestoreData = mapToFirestore(propertySnapshot.toMap());

  // Add any Firestore field values
  propertySnapshot.firestoreUtilData.fieldValues
      .forEach((k, v) => firestoreData[k] = v);

  return forFieldValue ? mergeNestedFields(firestoreData) : firestoreData;
}

List<Map<String, dynamic>> getPropertySnapshotListFirestoreData(
  List<PropertySnapshotStruct>? propertySnapshots,
) =>
    propertySnapshots
        ?.map((e) => getPropertySnapshotFirestoreData(e, true))
        .toList() ??
    [];
