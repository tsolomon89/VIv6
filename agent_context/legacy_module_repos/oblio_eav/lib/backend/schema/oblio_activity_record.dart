import 'dart:async';

import 'package:collection/collection.dart';

import '/backend/schema/util/firestore_util.dart';

import 'index.dart';
import '/flutter_flow/flutter_flow_util.dart';

class OblioActivityRecord extends FirestoreRecord {
  OblioActivityRecord._(
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
          ? parent.collection('oblio_activity')
          : FirebaseFirestore.instance.collectionGroup('oblio_activity');

  static DocumentReference createDoc(DocumentReference parent, {String? id}) =>
      parent.collection('oblio_activity').doc(id);

  static Stream<OblioActivityRecord> getDocument(DocumentReference ref) =>
      ref.snapshots().map((s) => OblioActivityRecord.fromSnapshot(s));

  static Future<OblioActivityRecord> getDocumentOnce(DocumentReference ref) =>
      ref.get().then((s) => OblioActivityRecord.fromSnapshot(s));

  static OblioActivityRecord fromSnapshot(DocumentSnapshot snapshot) =>
      OblioActivityRecord._(
        snapshot.reference,
        mapFromFirestore(snapshot.data() as Map<String, dynamic>),
      );

  static OblioActivityRecord getDocumentFromData(
    Map<String, dynamic> data,
    DocumentReference reference,
  ) =>
      OblioActivityRecord._(reference, mapFromFirestore(data));

  @override
  String toString() =>
      'OblioActivityRecord(reference: ${reference.path}, data: $snapshotData)';

  @override
  int get hashCode => reference.path.hashCode;

  @override
  bool operator ==(other) =>
      other is OblioActivityRecord &&
      reference.path.hashCode == other.reference.path.hashCode;
}

Map<String, dynamic> createOblioActivityRecordData({
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

class OblioActivityRecordDocumentEquality
    implements Equality<OblioActivityRecord> {
  const OblioActivityRecordDocumentEquality();

  @override
  bool equals(OblioActivityRecord? e1, OblioActivityRecord? e2) {
    return e1?.dataRecord == e2?.dataRecord;
  }

  @override
  int hash(OblioActivityRecord? e) =>
      const ListEquality().hash([e?.dataRecord]);

  @override
  bool isValidKey(Object? o) => o is OblioActivityRecord;
}
