import 'dart:async';

import 'package:collection/collection.dart';

import '/backend/schema/util/firestore_util.dart';

import 'index.dart';
import '/flutter_flow/flutter_flow_util.dart';

class OrganizationActivityRecord extends FirestoreRecord {
  OrganizationActivityRecord._(
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
          ? parent.collection('organization_activity')
          : FirebaseFirestore.instance.collectionGroup('organization_activity');

  static DocumentReference createDoc(DocumentReference parent, {String? id}) =>
      parent.collection('organization_activity').doc(id);

  static Stream<OrganizationActivityRecord> getDocument(
          DocumentReference ref) =>
      ref.snapshots().map((s) => OrganizationActivityRecord.fromSnapshot(s));

  static Future<OrganizationActivityRecord> getDocumentOnce(
          DocumentReference ref) =>
      ref.get().then((s) => OrganizationActivityRecord.fromSnapshot(s));

  static OrganizationActivityRecord fromSnapshot(DocumentSnapshot snapshot) =>
      OrganizationActivityRecord._(
        snapshot.reference,
        mapFromFirestore(snapshot.data() as Map<String, dynamic>),
      );

  static OrganizationActivityRecord getDocumentFromData(
    Map<String, dynamic> data,
    DocumentReference reference,
  ) =>
      OrganizationActivityRecord._(reference, mapFromFirestore(data));

  @override
  String toString() =>
      'OrganizationActivityRecord(reference: ${reference.path}, data: $snapshotData)';

  @override
  int get hashCode => reference.path.hashCode;

  @override
  bool operator ==(other) =>
      other is OrganizationActivityRecord &&
      reference.path.hashCode == other.reference.path.hashCode;
}

Map<String, dynamic> createOrganizationActivityRecordData({
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

class OrganizationActivityRecordDocumentEquality
    implements Equality<OrganizationActivityRecord> {
  const OrganizationActivityRecordDocumentEquality();

  @override
  bool equals(OrganizationActivityRecord? e1, OrganizationActivityRecord? e2) {
    return e1?.dataRecord == e2?.dataRecord;
  }

  @override
  int hash(OrganizationActivityRecord? e) =>
      const ListEquality().hash([e?.dataRecord]);

  @override
  bool isValidKey(Object? o) => o is OrganizationActivityRecord;
}
