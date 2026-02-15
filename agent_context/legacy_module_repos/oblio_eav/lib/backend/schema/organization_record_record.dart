import 'dart:async';

import 'package:collection/collection.dart';

import '/backend/schema/util/firestore_util.dart';

import 'index.dart';
import '/flutter_flow/flutter_flow_util.dart';

class OrganizationRecordRecord extends FirestoreRecord {
  OrganizationRecordRecord._(
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
          ? parent.collection('organization_record')
          : FirebaseFirestore.instance.collectionGroup('organization_record');

  static DocumentReference createDoc(DocumentReference parent, {String? id}) =>
      parent.collection('organization_record').doc(id);

  static Stream<OrganizationRecordRecord> getDocument(DocumentReference ref) =>
      ref.snapshots().map((s) => OrganizationRecordRecord.fromSnapshot(s));

  static Future<OrganizationRecordRecord> getDocumentOnce(
          DocumentReference ref) =>
      ref.get().then((s) => OrganizationRecordRecord.fromSnapshot(s));

  static OrganizationRecordRecord fromSnapshot(DocumentSnapshot snapshot) =>
      OrganizationRecordRecord._(
        snapshot.reference,
        mapFromFirestore(snapshot.data() as Map<String, dynamic>),
      );

  static OrganizationRecordRecord getDocumentFromData(
    Map<String, dynamic> data,
    DocumentReference reference,
  ) =>
      OrganizationRecordRecord._(reference, mapFromFirestore(data));

  @override
  String toString() =>
      'OrganizationRecordRecord(reference: ${reference.path}, data: $snapshotData)';

  @override
  int get hashCode => reference.path.hashCode;

  @override
  bool operator ==(other) =>
      other is OrganizationRecordRecord &&
      reference.path.hashCode == other.reference.path.hashCode;
}

Map<String, dynamic> createOrganizationRecordRecordData({
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

class OrganizationRecordRecordDocumentEquality
    implements Equality<OrganizationRecordRecord> {
  const OrganizationRecordRecordDocumentEquality();

  @override
  bool equals(OrganizationRecordRecord? e1, OrganizationRecordRecord? e2) {
    return e1?.dataRecord == e2?.dataRecord;
  }

  @override
  int hash(OrganizationRecordRecord? e) =>
      const ListEquality().hash([e?.dataRecord]);

  @override
  bool isValidKey(Object? o) => o is OrganizationRecordRecord;
}
