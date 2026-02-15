import 'dart:async';

import 'package:collection/collection.dart';

import '/backend/schema/util/firestore_util.dart';

import 'index.dart';
import '/flutter_flow/flutter_flow_util.dart';

class OblioRecord extends FirestoreRecord {
  OblioRecord._(
    DocumentReference reference,
    Map<String, dynamic> data,
  ) : super(reference, data) {
    _initializeFields();
  }

  // "data_record" field.
  RecordStruct? _dataRecord;
  RecordStruct get dataRecord => _dataRecord ?? RecordStruct();
  bool hasDataRecord() => _dataRecord != null;

  void _initializeFields() {
    _dataRecord = snapshotData['data_record'] is RecordStruct
        ? snapshotData['data_record']
        : RecordStruct.maybeFromMap(snapshotData['data_record']);
  }

  static CollectionReference get collection =>
      FirebaseFirestore.instance.collection('oblio');

  static Stream<OblioRecord> getDocument(DocumentReference ref) =>
      ref.snapshots().map((s) => OblioRecord.fromSnapshot(s));

  static Future<OblioRecord> getDocumentOnce(DocumentReference ref) =>
      ref.get().then((s) => OblioRecord.fromSnapshot(s));

  static OblioRecord fromSnapshot(DocumentSnapshot snapshot) => OblioRecord._(
        snapshot.reference,
        mapFromFirestore(snapshot.data() as Map<String, dynamic>),
      );

  static OblioRecord getDocumentFromData(
    Map<String, dynamic> data,
    DocumentReference reference,
  ) =>
      OblioRecord._(reference, mapFromFirestore(data));

  @override
  String toString() =>
      'OblioRecord(reference: ${reference.path}, data: $snapshotData)';

  @override
  int get hashCode => reference.path.hashCode;

  @override
  bool operator ==(other) =>
      other is OblioRecord &&
      reference.path.hashCode == other.reference.path.hashCode;
}

Map<String, dynamic> createOblioRecordData({
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

class OblioRecordDocumentEquality implements Equality<OblioRecord> {
  const OblioRecordDocumentEquality();

  @override
  bool equals(OblioRecord? e1, OblioRecord? e2) {
    return e1?.dataRecord == e2?.dataRecord;
  }

  @override
  int hash(OblioRecord? e) => const ListEquality().hash([e?.dataRecord]);

  @override
  bool isValidKey(Object? o) => o is OblioRecord;
}
