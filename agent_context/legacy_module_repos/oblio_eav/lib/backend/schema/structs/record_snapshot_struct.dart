// ignore_for_file: unnecessary_getters_setters

import 'package:cloud_firestore/cloud_firestore.dart';

import '/backend/schema/util/firestore_util.dart';

import 'index.dart';
import '/flutter_flow/flutter_flow_util.dart';

class RecordSnapshotStruct extends FFFirebaseStruct {
  RecordSnapshotStruct({
    String? idRefRecord,
    ObjectSnapshotStruct? objectSnapshotStruct,
    FirestoreUtilData firestoreUtilData = const FirestoreUtilData(),
  })  : _idRefRecord = idRefRecord,
        _objectSnapshotStruct = objectSnapshotStruct,
        super(firestoreUtilData);

  // "idRefRecord" field.
  String? _idRefRecord;
  String get idRefRecord => _idRefRecord ?? '';
  set idRefRecord(String? val) => _idRefRecord = val;

  bool hasIdRefRecord() => _idRefRecord != null;

  // "objectSnapshotStruct" field.
  ObjectSnapshotStruct? _objectSnapshotStruct;
  ObjectSnapshotStruct get objectSnapshotStruct =>
      _objectSnapshotStruct ?? ObjectSnapshotStruct();
  set objectSnapshotStruct(ObjectSnapshotStruct? val) =>
      _objectSnapshotStruct = val;

  void updateObjectSnapshotStruct(Function(ObjectSnapshotStruct) updateFn) {
    updateFn(_objectSnapshotStruct ??= ObjectSnapshotStruct());
  }

  bool hasObjectSnapshotStruct() => _objectSnapshotStruct != null;

  static RecordSnapshotStruct fromMap(Map<String, dynamic> data) =>
      RecordSnapshotStruct(
        idRefRecord: data['idRefRecord'] as String?,
        objectSnapshotStruct: data['objectSnapshotStruct']
                is ObjectSnapshotStruct
            ? data['objectSnapshotStruct']
            : ObjectSnapshotStruct.maybeFromMap(data['objectSnapshotStruct']),
      );

  static RecordSnapshotStruct? maybeFromMap(dynamic data) => data is Map
      ? RecordSnapshotStruct.fromMap(data.cast<String, dynamic>())
      : null;

  Map<String, dynamic> toMap() => {
        'idRefRecord': _idRefRecord,
        'objectSnapshotStruct': _objectSnapshotStruct?.toMap(),
      }.withoutNulls;

  @override
  Map<String, dynamic> toSerializableMap() => {
        'idRefRecord': serializeParam(
          _idRefRecord,
          ParamType.String,
        ),
        'objectSnapshotStruct': serializeParam(
          _objectSnapshotStruct,
          ParamType.DataStruct,
        ),
      }.withoutNulls;

  static RecordSnapshotStruct fromSerializableMap(Map<String, dynamic> data) =>
      RecordSnapshotStruct(
        idRefRecord: deserializeParam(
          data['idRefRecord'],
          ParamType.String,
          false,
        ),
        objectSnapshotStruct: deserializeStructParam(
          data['objectSnapshotStruct'],
          ParamType.DataStruct,
          false,
          structBuilder: ObjectSnapshotStruct.fromSerializableMap,
        ),
      );

  @override
  String toString() => 'RecordSnapshotStruct(${toMap()})';

  @override
  bool operator ==(Object other) {
    return other is RecordSnapshotStruct &&
        idRefRecord == other.idRefRecord &&
        objectSnapshotStruct == other.objectSnapshotStruct;
  }

  @override
  int get hashCode =>
      const ListEquality().hash([idRefRecord, objectSnapshotStruct]);
}

RecordSnapshotStruct createRecordSnapshotStruct({
  String? idRefRecord,
  ObjectSnapshotStruct? objectSnapshotStruct,
  Map<String, dynamic> fieldValues = const {},
  bool clearUnsetFields = true,
  bool create = false,
  bool delete = false,
}) =>
    RecordSnapshotStruct(
      idRefRecord: idRefRecord,
      objectSnapshotStruct: objectSnapshotStruct ??
          (clearUnsetFields ? ObjectSnapshotStruct() : null),
      firestoreUtilData: FirestoreUtilData(
        clearUnsetFields: clearUnsetFields,
        create: create,
        delete: delete,
        fieldValues: fieldValues,
      ),
    );

RecordSnapshotStruct? updateRecordSnapshotStruct(
  RecordSnapshotStruct? recordSnapshot, {
  bool clearUnsetFields = true,
  bool create = false,
}) =>
    recordSnapshot
      ?..firestoreUtilData = FirestoreUtilData(
        clearUnsetFields: clearUnsetFields,
        create: create,
      );

void addRecordSnapshotStructData(
  Map<String, dynamic> firestoreData,
  RecordSnapshotStruct? recordSnapshot,
  String fieldName, [
  bool forFieldValue = false,
]) {
  firestoreData.remove(fieldName);
  if (recordSnapshot == null) {
    return;
  }
  if (recordSnapshot.firestoreUtilData.delete) {
    firestoreData[fieldName] = FieldValue.delete();
    return;
  }
  final clearFields =
      !forFieldValue && recordSnapshot.firestoreUtilData.clearUnsetFields;
  if (clearFields) {
    firestoreData[fieldName] = <String, dynamic>{};
  }
  final recordSnapshotData =
      getRecordSnapshotFirestoreData(recordSnapshot, forFieldValue);
  final nestedData =
      recordSnapshotData.map((k, v) => MapEntry('$fieldName.$k', v));

  final mergeFields = recordSnapshot.firestoreUtilData.create || clearFields;
  firestoreData
      .addAll(mergeFields ? mergeNestedFields(nestedData) : nestedData);
}

Map<String, dynamic> getRecordSnapshotFirestoreData(
  RecordSnapshotStruct? recordSnapshot, [
  bool forFieldValue = false,
]) {
  if (recordSnapshot == null) {
    return {};
  }
  final firestoreData = mapToFirestore(recordSnapshot.toMap());

  // Handle nested data for "objectSnapshotStruct" field.
  addObjectSnapshotStructData(
    firestoreData,
    recordSnapshot.hasObjectSnapshotStruct()
        ? recordSnapshot.objectSnapshotStruct
        : null,
    'objectSnapshotStruct',
    forFieldValue,
  );

  // Add any Firestore field values
  recordSnapshot.firestoreUtilData.fieldValues
      .forEach((k, v) => firestoreData[k] = v);

  return forFieldValue ? mergeNestedFields(firestoreData) : firestoreData;
}

List<Map<String, dynamic>> getRecordSnapshotListFirestoreData(
  List<RecordSnapshotStruct>? recordSnapshots,
) =>
    recordSnapshots
        ?.map((e) => getRecordSnapshotFirestoreData(e, true))
        .toList() ??
    [];
