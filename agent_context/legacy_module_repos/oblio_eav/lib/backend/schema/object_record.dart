import 'dart:async';

import 'package:collection/collection.dart';

import '/backend/schema/util/firestore_util.dart';

import 'index.dart';
import '/flutter_flow/flutter_flow_util.dart';

class ObjectRecord extends FirestoreRecord {
  ObjectRecord._(
    DocumentReference reference,
    Map<String, dynamic> data,
  ) : super(reference, data) {
    _initializeFields();
  }

  // "data_record" field.
  RecordStruct? _dataRecord;
  RecordStruct get dataRecord => _dataRecord ?? RecordStruct();
  bool hasDataRecord() => _dataRecord != null;

  DocumentReference get parentReference => reference.parent.parent!;

  void _initializeFields() {
    _dataRecord = snapshotData['data_record'] is RecordStruct
        ? snapshotData['data_record']
        : RecordStruct.maybeFromMap(snapshotData['data_record']);
  }

  static Query<Map<String, dynamic>> collection([DocumentReference? parent]) =>
      parent != null
          ? parent.collection('object')
          : FirebaseFirestore.instance.collectionGroup('object');

  static DocumentReference createDoc(DocumentReference parent, {String? id}) =>
      parent.collection('object').doc(id);

  static Stream<ObjectRecord> getDocument(DocumentReference ref) =>
      ref.snapshots().map((s) => ObjectRecord.fromSnapshot(s));

  static Future<ObjectRecord> getDocumentOnce(DocumentReference ref) =>
      ref.get().then((s) => ObjectRecord.fromSnapshot(s));

  static ObjectRecord fromSnapshot(DocumentSnapshot snapshot) => ObjectRecord._(
        snapshot.reference,
        mapFromFirestore(snapshot.data() as Map<String, dynamic>),
      );

  static ObjectRecord getDocumentFromData(
    Map<String, dynamic> data,
    DocumentReference reference,
  ) =>
      ObjectRecord._(reference, mapFromFirestore(data));

  @override
  String toString() =>
      'ObjectRecord(reference: ${reference.path}, data: $snapshotData)';

  @override
  int get hashCode => reference.path.hashCode;

  @override
  bool operator ==(other) =>
      other is ObjectRecord &&
      reference.path.hashCode == other.reference.path.hashCode;
}

Map<String, dynamic> createObjectRecordData({
  RecordStruct? dataRecord,
}) {
  final firestoreData = mapToFirestore(
    <String, dynamic>{
      'data_record': RecordStruct().toMap(),
    }.withoutNulls,
  );

  // Handle nested data for "data_record" field.
  addRecordStructData(firestoreData, dataRecord, 'data_record');

  return firestoreData;
}

class ObjectRecordDocumentEquality implements Equality<ObjectRecord> {
  const ObjectRecordDocumentEquality();

  @override
  bool equals(ObjectRecord? e1, ObjectRecord? e2) {
    return e1?.dataRecord == e2?.dataRecord;
  }

  @override
  int hash(ObjectRecord? e) => const ListEquality().hash([e?.dataRecord]);

  @override
  bool isValidKey(Object? o) => o is ObjectRecord;
}
