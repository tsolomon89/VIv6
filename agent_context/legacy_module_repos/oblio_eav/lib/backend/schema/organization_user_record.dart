import 'dart:async';

import 'package:collection/collection.dart';

import '/backend/schema/util/firestore_util.dart';

import 'index.dart';
import '/flutter_flow/flutter_flow_util.dart';

class OrganizationUserRecord extends FirestoreRecord {
  OrganizationUserRecord._(
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
          ? parent.collection('organization_user')
          : FirebaseFirestore.instance.collectionGroup('organization_user');

  static DocumentReference createDoc(DocumentReference parent, {String? id}) =>
      parent.collection('organization_user').doc(id);

  static Stream<OrganizationUserRecord> getDocument(DocumentReference ref) =>
      ref.snapshots().map((s) => OrganizationUserRecord.fromSnapshot(s));

  static Future<OrganizationUserRecord> getDocumentOnce(
          DocumentReference ref) =>
      ref.get().then((s) => OrganizationUserRecord.fromSnapshot(s));

  static OrganizationUserRecord fromSnapshot(DocumentSnapshot snapshot) =>
      OrganizationUserRecord._(
        snapshot.reference,
        mapFromFirestore(snapshot.data() as Map<String, dynamic>),
      );

  static OrganizationUserRecord getDocumentFromData(
    Map<String, dynamic> data,
    DocumentReference reference,
  ) =>
      OrganizationUserRecord._(reference, mapFromFirestore(data));

  @override
  String toString() =>
      'OrganizationUserRecord(reference: ${reference.path}, data: $snapshotData)';

  @override
  int get hashCode => reference.path.hashCode;

  @override
  bool operator ==(other) =>
      other is OrganizationUserRecord &&
      reference.path.hashCode == other.reference.path.hashCode;
}

Map<String, dynamic> createOrganizationUserRecordData({
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

class OrganizationUserRecordDocumentEquality
    implements Equality<OrganizationUserRecord> {
  const OrganizationUserRecordDocumentEquality();

  @override
  bool equals(OrganizationUserRecord? e1, OrganizationUserRecord? e2) {
    return e1?.dataRecord == e2?.dataRecord;
  }

  @override
  int hash(OrganizationUserRecord? e) =>
      const ListEquality().hash([e?.dataRecord]);

  @override
  bool isValidKey(Object? o) => o is OrganizationUserRecord;
}
