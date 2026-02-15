import 'dart:async';

import 'package:collection/collection.dart';

import '/backend/schema/util/firestore_util.dart';

import 'index.dart';
import '/flutter_flow/flutter_flow_util.dart';

class FieldGroupRecord extends FirestoreRecord {
  FieldGroupRecord._(
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
          ? parent.collection('field_group')
          : FirebaseFirestore.instance.collectionGroup('field_group');

  static DocumentReference createDoc(DocumentReference parent, {String? id}) =>
      parent.collection('field_group').doc(id);

  static Stream<FieldGroupRecord> getDocument(DocumentReference ref) =>
      ref.snapshots().map((s) => FieldGroupRecord.fromSnapshot(s));

  static Future<FieldGroupRecord> getDocumentOnce(DocumentReference ref) =>
      ref.get().then((s) => FieldGroupRecord.fromSnapshot(s));

  static FieldGroupRecord fromSnapshot(DocumentSnapshot snapshot) =>
      FieldGroupRecord._(
        snapshot.reference,
        mapFromFirestore(snapshot.data() as Map<String, dynamic>),
      );

  static FieldGroupRecord getDocumentFromData(
    Map<String, dynamic> data,
    DocumentReference reference,
  ) =>
      FieldGroupRecord._(reference, mapFromFirestore(data));

  @override
  String toString() =>
      'FieldGroupRecord(reference: ${reference.path}, data: $snapshotData)';

  @override
  int get hashCode => reference.path.hashCode;

  @override
  bool operator ==(other) =>
      other is FieldGroupRecord &&
      reference.path.hashCode == other.reference.path.hashCode;
}

Map<String, dynamic> createFieldGroupRecordData({
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

class FieldGroupRecordDocumentEquality implements Equality<FieldGroupRecord> {
  const FieldGroupRecordDocumentEquality();

  @override
  bool equals(FieldGroupRecord? e1, FieldGroupRecord? e2) {
    return e1?.dataRecord == e2?.dataRecord;
  }

  @override
  int hash(FieldGroupRecord? e) => const ListEquality().hash([e?.dataRecord]);

  @override
  bool isValidKey(Object? o) => o is FieldGroupRecord;
}
