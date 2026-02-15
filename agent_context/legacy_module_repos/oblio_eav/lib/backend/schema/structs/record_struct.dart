// ignore_for_file: unnecessary_getters_setters

import 'package:cloud_firestore/cloud_firestore.dart';

import '/backend/schema/util/firestore_util.dart';

import 'index.dart';
import '/flutter_flow/flutter_flow_util.dart';

class RecordStruct extends FFFirebaseStruct {
  RecordStruct({
    String? idRecord,
    ObjectStruct? objectStruct,
    FirestoreUtilData firestoreUtilData = const FirestoreUtilData(),
  })  : _idRecord = idRecord,
        _objectStruct = objectStruct,
        super(firestoreUtilData);

  // "idRecord" field.
  String? _idRecord;
  String get idRecord => _idRecord ?? '';
  set idRecord(String? val) => _idRecord = val;

  bool hasIdRecord() => _idRecord != null;

  // "objectStruct" field.
  ObjectStruct? _objectStruct;
  ObjectStruct get objectStruct => _objectStruct ?? ObjectStruct();
  set objectStruct(ObjectStruct? val) => _objectStruct = val;

  void updateObjectStruct(Function(ObjectStruct) updateFn) {
    updateFn(_objectStruct ??= ObjectStruct());
  }

  bool hasObjectStruct() => _objectStruct != null;

  static RecordStruct fromMap(Map<String, dynamic> data) => RecordStruct(
        idRecord: data['idRecord'] as String?,
        objectStruct: data['objectStruct'] is ObjectStruct
            ? data['objectStruct']
            : ObjectStruct.maybeFromMap(data['objectStruct']),
      );

  static RecordStruct? maybeFromMap(dynamic data) =>
      data is Map ? RecordStruct.fromMap(data.cast<String, dynamic>()) : null;

  Map<String, dynamic> toMap() => {
        'idRecord': _idRecord,
        'objectStruct': _objectStruct?.toMap(),
      }.withoutNulls;

  @override
  Map<String, dynamic> toSerializableMap() => {
        'idRecord': serializeParam(
          _idRecord,
          ParamType.String,
        ),
        'objectStruct': serializeParam(
          _objectStruct,
          ParamType.DataStruct,
        ),
      }.withoutNulls;

  static RecordStruct fromSerializableMap(Map<String, dynamic> data) =>
      RecordStruct(
        idRecord: deserializeParam(
          data['idRecord'],
          ParamType.String,
          false,
        ),
        objectStruct: deserializeStructParam(
          data['objectStruct'],
          ParamType.DataStruct,
          false,
          structBuilder: ObjectStruct.fromSerializableMap,
        ),
      );

  @override
  String toString() => 'RecordStruct(${toMap()})';

  @override
  bool operator ==(Object other) {
    return other is RecordStruct &&
        idRecord == other.idRecord &&
        objectStruct == other.objectStruct;
  }

  @override
  int get hashCode => const ListEquality().hash([idRecord, objectStruct]);
}

RecordStruct createRecordStruct({
  String? idRecord,
  ObjectStruct? objectStruct,
  Map<String, dynamic> fieldValues = const {},
  bool clearUnsetFields = true,
  bool create = false,
  bool delete = false,
}) =>
    RecordStruct(
      idRecord: idRecord,
      objectStruct: objectStruct ?? (clearUnsetFields ? ObjectStruct() : null),
      firestoreUtilData: FirestoreUtilData(
        clearUnsetFields: clearUnsetFields,
        create: create,
        delete: delete,
        fieldValues: fieldValues,
      ),
    );

RecordStruct? updateRecordStruct(
  RecordStruct? record, {
  bool clearUnsetFields = true,
  bool create = false,
}) =>
    record
      ?..firestoreUtilData = FirestoreUtilData(
        clearUnsetFields: clearUnsetFields,
        create: create,
      );

void addRecordStructData(
  Map<String, dynamic> firestoreData,
  RecordStruct? record,
  String fieldName, [
  bool forFieldValue = false,
]) {
  firestoreData.remove(fieldName);
  if (record == null) {
    return;
  }
  if (record.firestoreUtilData.delete) {
    firestoreData[fieldName] = FieldValue.delete();
    return;
  }
  final clearFields =
      !forFieldValue && record.firestoreUtilData.clearUnsetFields;
  if (clearFields) {
    firestoreData[fieldName] = <String, dynamic>{};
  }
  final recordData = getRecordFirestoreData(record, forFieldValue);
  final nestedData = recordData.map((k, v) => MapEntry('$fieldName.$k', v));

  final mergeFields = record.firestoreUtilData.create || clearFields;
  firestoreData
      .addAll(mergeFields ? mergeNestedFields(nestedData) : nestedData);
}

Map<String, dynamic> getRecordFirestoreData(
  RecordStruct? record, [
  bool forFieldValue = false,
]) {
  if (record == null) {
    return {};
  }
  final firestoreData = mapToFirestore(record.toMap());

  // Handle nested data for "objectStruct" field.
  addObjectStructData(
    firestoreData,
    record.hasObjectStruct() ? record.objectStruct : null,
    'objectStruct',
    forFieldValue,
  );

  // Add any Firestore field values
  record.firestoreUtilData.fieldValues.forEach((k, v) => firestoreData[k] = v);

  return forFieldValue ? mergeNestedFields(firestoreData) : firestoreData;
}

List<Map<String, dynamic>> getRecordListFirestoreData(
  List<RecordStruct>? records,
) =>
    records?.map((e) => getRecordFirestoreData(e, true)).toList() ?? [];
