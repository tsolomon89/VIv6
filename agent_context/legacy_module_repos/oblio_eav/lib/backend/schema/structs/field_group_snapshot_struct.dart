// ignore_for_file: unnecessary_getters_setters

import 'package:cloud_firestore/cloud_firestore.dart';

import '/backend/schema/util/firestore_util.dart';

import 'index.dart';
import '/flutter_flow/flutter_flow_util.dart';

class FieldGroupSnapshotStruct extends FFFirebaseStruct {
  FieldGroupSnapshotStruct({
    String? idRefFieldGroupRecord,
    String? nameFieldGroup,
    List<FieldSnapshotStruct>? fieldSnapshotStructs,
    FirestoreUtilData firestoreUtilData = const FirestoreUtilData(),
  })  : _idRefFieldGroupRecord = idRefFieldGroupRecord,
        _nameFieldGroup = nameFieldGroup,
        _fieldSnapshotStructs = fieldSnapshotStructs,
        super(firestoreUtilData);

  // "idRefFieldGroupRecord" field.
  String? _idRefFieldGroupRecord;
  String get idRefFieldGroupRecord => _idRefFieldGroupRecord ?? '';
  set idRefFieldGroupRecord(String? val) => _idRefFieldGroupRecord = val;

  bool hasIdRefFieldGroupRecord() => _idRefFieldGroupRecord != null;

  // "nameFieldGroup" field.
  String? _nameFieldGroup;
  String get nameFieldGroup => _nameFieldGroup ?? '';
  set nameFieldGroup(String? val) => _nameFieldGroup = val;

  bool hasNameFieldGroup() => _nameFieldGroup != null;

  // "fieldSnapshotStructs" field.
  List<FieldSnapshotStruct>? _fieldSnapshotStructs;
  List<FieldSnapshotStruct> get fieldSnapshotStructs =>
      _fieldSnapshotStructs ?? const [];
  set fieldSnapshotStructs(List<FieldSnapshotStruct>? val) =>
      _fieldSnapshotStructs = val;

  void updateFieldSnapshotStructs(
      Function(List<FieldSnapshotStruct>) updateFn) {
    updateFn(_fieldSnapshotStructs ??= []);
  }

  bool hasFieldSnapshotStructs() => _fieldSnapshotStructs != null;

  static FieldGroupSnapshotStruct fromMap(Map<String, dynamic> data) =>
      FieldGroupSnapshotStruct(
        idRefFieldGroupRecord: data['idRefFieldGroupRecord'] as String?,
        nameFieldGroup: data['nameFieldGroup'] as String?,
        fieldSnapshotStructs: getStructList(
          data['fieldSnapshotStructs'],
          FieldSnapshotStruct.fromMap,
        ),
      );

  static FieldGroupSnapshotStruct? maybeFromMap(dynamic data) => data is Map
      ? FieldGroupSnapshotStruct.fromMap(data.cast<String, dynamic>())
      : null;

  Map<String, dynamic> toMap() => {
        'idRefFieldGroupRecord': _idRefFieldGroupRecord,
        'nameFieldGroup': _nameFieldGroup,
        'fieldSnapshotStructs':
            _fieldSnapshotStructs?.map((e) => e.toMap()).toList(),
      }.withoutNulls;

  @override
  Map<String, dynamic> toSerializableMap() => {
        'idRefFieldGroupRecord': serializeParam(
          _idRefFieldGroupRecord,
          ParamType.String,
        ),
        'nameFieldGroup': serializeParam(
          _nameFieldGroup,
          ParamType.String,
        ),
        'fieldSnapshotStructs': serializeParam(
          _fieldSnapshotStructs,
          ParamType.DataStruct,
          isList: true,
        ),
      }.withoutNulls;

  static FieldGroupSnapshotStruct fromSerializableMap(
          Map<String, dynamic> data) =>
      FieldGroupSnapshotStruct(
        idRefFieldGroupRecord: deserializeParam(
          data['idRefFieldGroupRecord'],
          ParamType.String,
          false,
        ),
        nameFieldGroup: deserializeParam(
          data['nameFieldGroup'],
          ParamType.String,
          false,
        ),
        fieldSnapshotStructs: deserializeStructParam<FieldSnapshotStruct>(
          data['fieldSnapshotStructs'],
          ParamType.DataStruct,
          true,
          structBuilder: FieldSnapshotStruct.fromSerializableMap,
        ),
      );

  @override
  String toString() => 'FieldGroupSnapshotStruct(${toMap()})';

  @override
  bool operator ==(Object other) {
    const listEquality = ListEquality();
    return other is FieldGroupSnapshotStruct &&
        idRefFieldGroupRecord == other.idRefFieldGroupRecord &&
        nameFieldGroup == other.nameFieldGroup &&
        listEquality.equals(fieldSnapshotStructs, other.fieldSnapshotStructs);
  }

  @override
  int get hashCode => const ListEquality()
      .hash([idRefFieldGroupRecord, nameFieldGroup, fieldSnapshotStructs]);
}

FieldGroupSnapshotStruct createFieldGroupSnapshotStruct({
  String? idRefFieldGroupRecord,
  String? nameFieldGroup,
  Map<String, dynamic> fieldValues = const {},
  bool clearUnsetFields = true,
  bool create = false,
  bool delete = false,
}) =>
    FieldGroupSnapshotStruct(
      idRefFieldGroupRecord: idRefFieldGroupRecord,
      nameFieldGroup: nameFieldGroup,
      firestoreUtilData: FirestoreUtilData(
        clearUnsetFields: clearUnsetFields,
        create: create,
        delete: delete,
        fieldValues: fieldValues,
      ),
    );

FieldGroupSnapshotStruct? updateFieldGroupSnapshotStruct(
  FieldGroupSnapshotStruct? fieldGroupSnapshot, {
  bool clearUnsetFields = true,
  bool create = false,
}) =>
    fieldGroupSnapshot
      ?..firestoreUtilData = FirestoreUtilData(
        clearUnsetFields: clearUnsetFields,
        create: create,
      );

void addFieldGroupSnapshotStructData(
  Map<String, dynamic> firestoreData,
  FieldGroupSnapshotStruct? fieldGroupSnapshot,
  String fieldName, [
  bool forFieldValue = false,
]) {
  firestoreData.remove(fieldName);
  if (fieldGroupSnapshot == null) {
    return;
  }
  if (fieldGroupSnapshot.firestoreUtilData.delete) {
    firestoreData[fieldName] = FieldValue.delete();
    return;
  }
  final clearFields =
      !forFieldValue && fieldGroupSnapshot.firestoreUtilData.clearUnsetFields;
  if (clearFields) {
    firestoreData[fieldName] = <String, dynamic>{};
  }
  final fieldGroupSnapshotData =
      getFieldGroupSnapshotFirestoreData(fieldGroupSnapshot, forFieldValue);
  final nestedData =
      fieldGroupSnapshotData.map((k, v) => MapEntry('$fieldName.$k', v));

  final mergeFields =
      fieldGroupSnapshot.firestoreUtilData.create || clearFields;
  firestoreData
      .addAll(mergeFields ? mergeNestedFields(nestedData) : nestedData);
}

Map<String, dynamic> getFieldGroupSnapshotFirestoreData(
  FieldGroupSnapshotStruct? fieldGroupSnapshot, [
  bool forFieldValue = false,
]) {
  if (fieldGroupSnapshot == null) {
    return {};
  }
  final firestoreData = mapToFirestore(fieldGroupSnapshot.toMap());

  // Add any Firestore field values
  fieldGroupSnapshot.firestoreUtilData.fieldValues
      .forEach((k, v) => firestoreData[k] = v);

  return forFieldValue ? mergeNestedFields(firestoreData) : firestoreData;
}

List<Map<String, dynamic>> getFieldGroupSnapshotListFirestoreData(
  List<FieldGroupSnapshotStruct>? fieldGroupSnapshots,
) =>
    fieldGroupSnapshots
        ?.map((e) => getFieldGroupSnapshotFirestoreData(e, true))
        .toList() ??
    [];
