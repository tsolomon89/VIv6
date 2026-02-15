// ignore_for_file: unnecessary_getters_setters

import 'package:cloud_firestore/cloud_firestore.dart';

import '/backend/schema/util/firestore_util.dart';

import 'index.dart';
import '/flutter_flow/flutter_flow_util.dart';

class FieldGroupStruct extends FFFirebaseStruct {
  FieldGroupStruct({
    String? idRefFieldGroupRecord,
    String? nameFieldGroup,
    List<FieldStruct>? fieldStructs,
    FirestoreUtilData firestoreUtilData = const FirestoreUtilData(),
  })  : _idRefFieldGroupRecord = idRefFieldGroupRecord,
        _nameFieldGroup = nameFieldGroup,
        _fieldStructs = fieldStructs,
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

  // "fieldStructs" field.
  List<FieldStruct>? _fieldStructs;
  List<FieldStruct> get fieldStructs => _fieldStructs ?? const [];
  set fieldStructs(List<FieldStruct>? val) => _fieldStructs = val;

  void updateFieldStructs(Function(List<FieldStruct>) updateFn) {
    updateFn(_fieldStructs ??= []);
  }

  bool hasFieldStructs() => _fieldStructs != null;

  static FieldGroupStruct fromMap(Map<String, dynamic> data) =>
      FieldGroupStruct(
        idRefFieldGroupRecord: data['idRefFieldGroupRecord'] as String?,
        nameFieldGroup: data['nameFieldGroup'] as String?,
        fieldStructs: getStructList(
          data['fieldStructs'],
          FieldStruct.fromMap,
        ),
      );

  static FieldGroupStruct? maybeFromMap(dynamic data) => data is Map
      ? FieldGroupStruct.fromMap(data.cast<String, dynamic>())
      : null;

  Map<String, dynamic> toMap() => {
        'idRefFieldGroupRecord': _idRefFieldGroupRecord,
        'nameFieldGroup': _nameFieldGroup,
        'fieldStructs': _fieldStructs?.map((e) => e.toMap()).toList(),
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
        'fieldStructs': serializeParam(
          _fieldStructs,
          ParamType.DataStruct,
          isList: true,
        ),
      }.withoutNulls;

  static FieldGroupStruct fromSerializableMap(Map<String, dynamic> data) =>
      FieldGroupStruct(
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
        fieldStructs: deserializeStructParam<FieldStruct>(
          data['fieldStructs'],
          ParamType.DataStruct,
          true,
          structBuilder: FieldStruct.fromSerializableMap,
        ),
      );

  @override
  String toString() => 'FieldGroupStruct(${toMap()})';

  @override
  bool operator ==(Object other) {
    const listEquality = ListEquality();
    return other is FieldGroupStruct &&
        idRefFieldGroupRecord == other.idRefFieldGroupRecord &&
        nameFieldGroup == other.nameFieldGroup &&
        listEquality.equals(fieldStructs, other.fieldStructs);
  }

  @override
  int get hashCode => const ListEquality()
      .hash([idRefFieldGroupRecord, nameFieldGroup, fieldStructs]);
}

FieldGroupStruct createFieldGroupStruct({
  String? idRefFieldGroupRecord,
  String? nameFieldGroup,
  Map<String, dynamic> fieldValues = const {},
  bool clearUnsetFields = true,
  bool create = false,
  bool delete = false,
}) =>
    FieldGroupStruct(
      idRefFieldGroupRecord: idRefFieldGroupRecord,
      nameFieldGroup: nameFieldGroup,
      firestoreUtilData: FirestoreUtilData(
        clearUnsetFields: clearUnsetFields,
        create: create,
        delete: delete,
        fieldValues: fieldValues,
      ),
    );

FieldGroupStruct? updateFieldGroupStruct(
  FieldGroupStruct? fieldGroup, {
  bool clearUnsetFields = true,
  bool create = false,
}) =>
    fieldGroup
      ?..firestoreUtilData = FirestoreUtilData(
        clearUnsetFields: clearUnsetFields,
        create: create,
      );

void addFieldGroupStructData(
  Map<String, dynamic> firestoreData,
  FieldGroupStruct? fieldGroup,
  String fieldName, [
  bool forFieldValue = false,
]) {
  firestoreData.remove(fieldName);
  if (fieldGroup == null) {
    return;
  }
  if (fieldGroup.firestoreUtilData.delete) {
    firestoreData[fieldName] = FieldValue.delete();
    return;
  }
  final clearFields =
      !forFieldValue && fieldGroup.firestoreUtilData.clearUnsetFields;
  if (clearFields) {
    firestoreData[fieldName] = <String, dynamic>{};
  }
  final fieldGroupData = getFieldGroupFirestoreData(fieldGroup, forFieldValue);
  final nestedData = fieldGroupData.map((k, v) => MapEntry('$fieldName.$k', v));

  final mergeFields = fieldGroup.firestoreUtilData.create || clearFields;
  firestoreData
      .addAll(mergeFields ? mergeNestedFields(nestedData) : nestedData);
}

Map<String, dynamic> getFieldGroupFirestoreData(
  FieldGroupStruct? fieldGroup, [
  bool forFieldValue = false,
]) {
  if (fieldGroup == null) {
    return {};
  }
  final firestoreData = mapToFirestore(fieldGroup.toMap());

  // Add any Firestore field values
  fieldGroup.firestoreUtilData.fieldValues
      .forEach((k, v) => firestoreData[k] = v);

  return forFieldValue ? mergeNestedFields(firestoreData) : firestoreData;
}

List<Map<String, dynamic>> getFieldGroupListFirestoreData(
  List<FieldGroupStruct>? fieldGroups,
) =>
    fieldGroups?.map((e) => getFieldGroupFirestoreData(e, true)).toList() ?? [];
