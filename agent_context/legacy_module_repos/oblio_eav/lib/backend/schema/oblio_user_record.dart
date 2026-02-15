import 'dart:async';

import 'package:collection/collection.dart';

import '/backend/schema/util/firestore_util.dart';

import 'index.dart';
import '/flutter_flow/flutter_flow_util.dart';

class OblioUserRecord extends FirestoreRecord {
  OblioUserRecord._(
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
          ? parent.collection('oblio_user')
          : FirebaseFirestore.instance.collectionGroup('oblio_user');

  static DocumentReference createDoc(DocumentReference parent, {String? id}) =>
      parent.collection('oblio_user').doc(id);

  static Stream<OblioUserRecord> getDocument(DocumentReference ref) =>
      ref.snapshots().map((s) => OblioUserRecord.fromSnapshot(s));

  static Future<OblioUserRecord> getDocumentOnce(DocumentReference ref) =>
      ref.get().then((s) => OblioUserRecord.fromSnapshot(s));

  static OblioUserRecord fromSnapshot(DocumentSnapshot snapshot) =>
      OblioUserRecord._(
        snapshot.reference,
        mapFromFirestore(snapshot.data() as Map<String, dynamic>),
      );

  static OblioUserRecord getDocumentFromData(
    Map<String, dynamic> data,
    DocumentReference reference,
  ) =>
      OblioUserRecord._(reference, mapFromFirestore(data));

  @override
  String toString() =>
      'OblioUserRecord(reference: ${reference.path}, data: $snapshotData)';

  @override
  int get hashCode => reference.path.hashCode;

  @override
  bool operator ==(other) =>
      other is OblioUserRecord &&
      reference.path.hashCode == other.reference.path.hashCode;
}

Map<String, dynamic> createOblioUserRecordData({
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

class OblioUserRecordDocumentEquality implements Equality<OblioUserRecord> {
  const OblioUserRecordDocumentEquality();

  @override
  bool equals(OblioUserRecord? e1, OblioUserRecord? e2) {
    return e1?.dataRecord == e2?.dataRecord;
  }

  @override
  int hash(OblioUserRecord? e) => const ListEquality().hash([e?.dataRecord]);

  @override
  bool isValidKey(Object? o) => o is OblioUserRecord;
}
