import 'dart:async';

import 'package:collection/collection.dart';

import '/backend/schema/util/firestore_util.dart';

import 'index.dart';
import '/flutter_flow/flutter_flow_util.dart';

class OrganizationRecord extends FirestoreRecord {
  OrganizationRecord._(
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
      FirebaseFirestore.instance.collection('organization');

  static Stream<OrganizationRecord> getDocument(DocumentReference ref) =>
      ref.snapshots().map((s) => OrganizationRecord.fromSnapshot(s));

  static Future<OrganizationRecord> getDocumentOnce(DocumentReference ref) =>
      ref.get().then((s) => OrganizationRecord.fromSnapshot(s));

  static OrganizationRecord fromSnapshot(DocumentSnapshot snapshot) =>
      OrganizationRecord._(
        snapshot.reference,
        mapFromFirestore(snapshot.data() as Map<String, dynamic>),
      );

  static OrganizationRecord getDocumentFromData(
    Map<String, dynamic> data,
    DocumentReference reference,
  ) =>
      OrganizationRecord._(reference, mapFromFirestore(data));

  @override
  String toString() =>
      'OrganizationRecord(reference: ${reference.path}, data: $snapshotData)';

  @override
  int get hashCode => reference.path.hashCode;

  @override
  bool operator ==(other) =>
      other is OrganizationRecord &&
      reference.path.hashCode == other.reference.path.hashCode;
}

Map<String, dynamic> createOrganizationRecordData({
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

class OrganizationRecordDocumentEquality
    implements Equality<OrganizationRecord> {
  const OrganizationRecordDocumentEquality();

  @override
  bool equals(OrganizationRecord? e1, OrganizationRecord? e2) {
    return e1?.dataRecord == e2?.dataRecord;
  }

  @override
  int hash(OrganizationRecord? e) => const ListEquality().hash([e?.dataRecord]);

  @override
  bool isValidKey(Object? o) => o is OrganizationRecord;
}
