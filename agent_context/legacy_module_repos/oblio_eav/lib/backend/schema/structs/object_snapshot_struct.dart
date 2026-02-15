// ignore_for_file: unnecessary_getters_setters

import 'package:cloud_firestore/cloud_firestore.dart';

import '/backend/schema/util/firestore_util.dart';

import 'index.dart';
import '/flutter_flow/flutter_flow_util.dart';

class ObjectSnapshotStruct extends FFFirebaseStruct {
  ObjectSnapshotStruct({
    String? idRefObjectRecord,
    String? typeObject,
    List<FieldGroupSnapshotStruct>? fieldGroupSnapshotStructs,
    FirestoreUtilData firestoreUtilData = const FirestoreUtilData(),
  })  : _idRefObjectRecord = idRefObjectRecord,
        _typeObject = typeObject,
        _fieldGroupSnapshotStructs = fieldGroupSnapshotStructs,
        super(firestoreUtilData);

  // "idRefObjectRecord" field.
  String? _idRefObjectRecord;
  String get idRefObjectRecord => _idRefObjectRecord ?? '';
  set idRefObjectRecord(String? val) => _idRefObjectRecord = val;

  bool hasIdRefObjectRecord() => _idRefObjectRecord != null;

  // "typeObject" field.
  String? _typeObject;
  String get typeObject => _typeObject ?? '';
  set typeObject(String? val) => _typeObject = val;

  bool hasTypeObject() => _typeObject != null;

  // "fieldGroupSnapshotStructs" field.
  List<FieldGroupSnapshotStruct>? _fieldGroupSnapshotStructs;
  List<FieldGroupSnapshotStruct> get fieldGroupSnapshotStructs =>
      _fieldGroupSnapshotStructs ?? const [];
  set fieldGroupSnapshotStructs(List<FieldGroupSnapshotStruct>? val) =>
      _fieldGroupSnapshotStructs = val;

  void updateFieldGroupSnapshotStructs(
      Function(List<FieldGroupSnapshotStruct>) updateFn) {
    updateFn(_fieldGroupSnapshotStructs ??= []);
  }

  bool hasFieldGroupSnapshotStructs() => _fieldGroupSnapshotStructs != null;

  static ObjectSnapshotStruct fromMap(Map<String, dynamic> data) =>
      ObjectSnapshotStruct(
        idRefObjectRecord: data['idRefObjectRecord'] as String?,
        typeObject: data['typeObject'] as String?,
        fieldGroupSnapshotStructs: getStructList(
          data['fieldGroupSnapshotStructs'],
          FieldGroupSnapshotStruct.fromMap,
        ),
      );

  static ObjectSnapshotStruct? maybeFromMap(dynamic data) => data is Map
      ? ObjectSnapshotStruct.fromMap(data.cast<String, dynamic>())
      : null;

  Map<String, dynamic> toMap() => {
        'idRefObjectRecord': _idRefObjectRecord,
        'typeObject': _typeObject,
        'fieldGroupSnapshotStructs':
            _fieldGroupSnapshotStructs?.map((e) => e.toMap()).toList(),
      }.withoutNulls;

  @override
  Map<String, dynamic> toSerializableMap() => {
        'idRefObjectRecord': serializeParam(
          _idRefObjectRecord,
          ParamType.String,
        ),
        'typeObject': serializeParam(
          _typeObject,
          ParamType.String,
        ),
        'fieldGroupSnapshotStructs': serializeParam(
          _fieldGroupSnapshotStructs,
          ParamType.DataStruct,
          isList: true,
        ),
      }.withoutNulls;

  static ObjectSnapshotStruct fromSerializableMap(Map<String, dynamic> data) =>
      ObjectSnapshotStruct(
        idRefObjectRecord: deserializeParam(
          data['idRefObjectRecord'],
          ParamType.String,
          false,
        ),
        typeObject: deserializeParam(
          data['typeObject'],
          ParamType.String,
          false,
        ),
        fieldGroupSnapshotStructs:
            deserializeStructParam<FieldGroupSnapshotStruct>(
          data['fieldGroupSnapshotStructs'],
          ParamType.DataStruct,
          true,
          structBuilder: FieldGroupSnapshotStruct.fromSerializableMap,
        ),
      );

  @override
  String toString() => 'ObjectSnapshotStruct(${toMap()})';

  @override
  bool operator ==(Object other) {
    const listEquality = ListEquality();
    return other is ObjectSnapshotStruct &&
        idRefObjectRecord == other.idRefObjectRecord &&
        typeObject == other.typeObject &&
        listEquality.equals(
            fieldGroupSnapshotStructs, other.fieldGroupSnapshotStructs);
  }

  @override
  int get hashCode => const ListEquality()
      .hash([idRefObjectRecord, typeObject, fieldGroupSnapshotStructs]);
}

ObjectSnapshotStruct createObjectSnapshotStruct({
  String? idRefObjectRecord,
  String? typeObject,
  Map<String, dynamic> fieldValues = const {},
  bool clearUnsetFields = true,
  bool create = false,
  bool delete = false,
}) =>
    ObjectSnapshotStruct(
      idRefObjectRecord: idRefObjectRecord,
      typeObject: typeObject,
      firestoreUtilData: FirestoreUtilData(
        clearUnsetFields: clearUnsetFields,
        create: create,
        delete: delete,
        fieldValues: fieldValues,
      ),
    );

ObjectSnapshotStruct? updateObjectSnapshotStruct(
  ObjectSnapshotStruct? objectSnapshot, {
  bool clearUnsetFields = true,
  bool create = false,
}) =>
    objectSnapshot
      ?..firestoreUtilData = FirestoreUtilData(
        clearUnsetFields: clearUnsetFields,
        create: create,
      );

void addObjectSnapshotStructData(
  Map<String, dynamic> firestoreData,
  ObjectSnapshotStruct? objectSnapshot,
  String fieldName, [
  bool forFieldValue = false,
]) {
  firestoreData.remove(fieldName);
  if (objectSnapshot == null) {
    return;
  }
  if (objectSnapshot.firestoreUtilData.delete) {
    firestoreData[fieldName] = FieldValue.delete();
    return;
  }
  final clearFields =
      !forFieldValue && objectSnapshot.firestoreUtilData.clearUnsetFields;
  if (clearFields) {
    firestoreData[fieldName] = <String, dynamic>{};
  }
  final objectSnapshotData =
      getObjectSnapshotFirestoreData(objectSnapshot, forFieldValue);
  final nestedData =
      objectSnapshotData.map((k, v) => MapEntry('$fieldName.$k', v));

  final mergeFields = objectSnapshot.firestoreUtilData.create || clearFields;
  firestoreData
      .addAll(mergeFields ? mergeNestedFields(nestedData) : nestedData);
}

Map<String, dynamic> getObjectSnapshotFirestoreData(
  ObjectSnapshotStruct? objectSnapshot, [
  bool forFieldValue = false,
]) {
  if (objectSnapshot == null) {
    return {};
  }
  final firestoreData = mapToFirestore(objectSnapshot.toMap());

  // Add any Firestore field values
  objectSnapshot.firestoreUtilData.fieldValues
      .forEach((k, v) => firestoreData[k] = v);

  return forFieldValue ? mergeNestedFields(firestoreData) : firestoreData;
}

List<Map<String, dynamic>> getObjectSnapshotListFirestoreData(
  List<ObjectSnapshotStruct>? objectSnapshots,
) =>
    objectSnapshots
        ?.map((e) => getObjectSnapshotFirestoreData(e, true))
        .toList() ??
    [];
