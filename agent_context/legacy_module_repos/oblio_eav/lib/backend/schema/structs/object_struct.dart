// ignore_for_file: unnecessary_getters_setters

import 'package:cloud_firestore/cloud_firestore.dart';

import '/backend/schema/util/firestore_util.dart';

import 'index.dart';
import '/flutter_flow/flutter_flow_util.dart';

class ObjectStruct extends FFFirebaseStruct {
  ObjectStruct({
    String? idRefObjectRecord,
    String? typeObject,
    List<FieldGroupStruct>? fieldGroupStructs,
    FirestoreUtilData firestoreUtilData = const FirestoreUtilData(),
  })  : _idRefObjectRecord = idRefObjectRecord,
        _typeObject = typeObject,
        _fieldGroupStructs = fieldGroupStructs,
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

  // "fieldGroupStructs" field.
  List<FieldGroupStruct>? _fieldGroupStructs;
  List<FieldGroupStruct> get fieldGroupStructs =>
      _fieldGroupStructs ?? const [];
  set fieldGroupStructs(List<FieldGroupStruct>? val) =>
      _fieldGroupStructs = val;

  void updateFieldGroupStructs(Function(List<FieldGroupStruct>) updateFn) {
    updateFn(_fieldGroupStructs ??= []);
  }

  bool hasFieldGroupStructs() => _fieldGroupStructs != null;

  static ObjectStruct fromMap(Map<String, dynamic> data) => ObjectStruct(
        idRefObjectRecord: data['idRefObjectRecord'] as String?,
        typeObject: data['typeObject'] as String?,
        fieldGroupStructs: getStructList(
          data['fieldGroupStructs'],
          FieldGroupStruct.fromMap,
        ),
      );

  static ObjectStruct? maybeFromMap(dynamic data) =>
      data is Map ? ObjectStruct.fromMap(data.cast<String, dynamic>()) : null;

  Map<String, dynamic> toMap() => {
        'idRefObjectRecord': _idRefObjectRecord,
        'typeObject': _typeObject,
        'fieldGroupStructs': _fieldGroupStructs?.map((e) => e.toMap()).toList(),
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
        'fieldGroupStructs': serializeParam(
          _fieldGroupStructs,
          ParamType.DataStruct,
          isList: true,
        ),
      }.withoutNulls;

  static ObjectStruct fromSerializableMap(Map<String, dynamic> data) =>
      ObjectStruct(
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
        fieldGroupStructs: deserializeStructParam<FieldGroupStruct>(
          data['fieldGroupStructs'],
          ParamType.DataStruct,
          true,
          structBuilder: FieldGroupStruct.fromSerializableMap,
        ),
      );

  @override
  String toString() => 'ObjectStruct(${toMap()})';

  @override
  bool operator ==(Object other) {
    const listEquality = ListEquality();
    return other is ObjectStruct &&
        idRefObjectRecord == other.idRefObjectRecord &&
        typeObject == other.typeObject &&
        listEquality.equals(fieldGroupStructs, other.fieldGroupStructs);
  }

  @override
  int get hashCode => const ListEquality()
      .hash([idRefObjectRecord, typeObject, fieldGroupStructs]);
}

ObjectStruct createObjectStruct({
  String? idRefObjectRecord,
  String? typeObject,
  Map<String, dynamic> fieldValues = const {},
  bool clearUnsetFields = true,
  bool create = false,
  bool delete = false,
}) =>
    ObjectStruct(
      idRefObjectRecord: idRefObjectRecord,
      typeObject: typeObject,
      firestoreUtilData: FirestoreUtilData(
        clearUnsetFields: clearUnsetFields,
        create: create,
        delete: delete,
        fieldValues: fieldValues,
      ),
    );

ObjectStruct? updateObjectStruct(
  ObjectStruct? object, {
  bool clearUnsetFields = true,
  bool create = false,
}) =>
    object
      ?..firestoreUtilData = FirestoreUtilData(
        clearUnsetFields: clearUnsetFields,
        create: create,
      );

void addObjectStructData(
  Map<String, dynamic> firestoreData,
  ObjectStruct? object,
  String fieldName, [
  bool forFieldValue = false,
]) {
  firestoreData.remove(fieldName);
  if (object == null) {
    return;
  }
  if (object.firestoreUtilData.delete) {
    firestoreData[fieldName] = FieldValue.delete();
    return;
  }
  final clearFields =
      !forFieldValue && object.firestoreUtilData.clearUnsetFields;
  if (clearFields) {
    firestoreData[fieldName] = <String, dynamic>{};
  }
  final objectData = getObjectFirestoreData(object, forFieldValue);
  final nestedData = objectData.map((k, v) => MapEntry('$fieldName.$k', v));

  final mergeFields = object.firestoreUtilData.create || clearFields;
  firestoreData
      .addAll(mergeFields ? mergeNestedFields(nestedData) : nestedData);
}

Map<String, dynamic> getObjectFirestoreData(
  ObjectStruct? object, [
  bool forFieldValue = false,
]) {
  if (object == null) {
    return {};
  }
  final firestoreData = mapToFirestore(object.toMap());

  // Add any Firestore field values
  object.firestoreUtilData.fieldValues.forEach((k, v) => firestoreData[k] = v);

  return forFieldValue ? mergeNestedFields(firestoreData) : firestoreData;
}

List<Map<String, dynamic>> getObjectListFirestoreData(
  List<ObjectStruct>? objects,
) =>
    objects?.map((e) => getObjectFirestoreData(e, true)).toList() ?? [];
