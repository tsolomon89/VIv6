// ignore_for_file: unnecessary_getters_setters

import 'package:cloud_firestore/cloud_firestore.dart';

import '/backend/schema/util/firestore_util.dart';

import 'index.dart';
import '/flutter_flow/flutter_flow_util.dart';

class PropertyStruct extends FFFirebaseStruct {
  PropertyStruct({
    String? valueProperty,
    RecordSnapshotStruct? recordSnapshotStruct,
    FirestoreUtilData firestoreUtilData = const FirestoreUtilData(),
  })  : _valueProperty = valueProperty,
        _recordSnapshotStruct = recordSnapshotStruct,
        super(firestoreUtilData);

  // "valueProperty" field.
  String? _valueProperty;
  String get valueProperty => _valueProperty ?? '';
  set valueProperty(String? val) => _valueProperty = val;

  bool hasValueProperty() => _valueProperty != null;

  // "recordSnapshotStruct" field.
  RecordSnapshotStruct? _recordSnapshotStruct;
  RecordSnapshotStruct get recordSnapshotStruct =>
      _recordSnapshotStruct ?? RecordSnapshotStruct();
  set recordSnapshotStruct(RecordSnapshotStruct? val) =>
      _recordSnapshotStruct = val;

  void updateRecordSnapshotStruct(Function(RecordSnapshotStruct) updateFn) {
    updateFn(_recordSnapshotStruct ??= RecordSnapshotStruct());
  }

  bool hasRecordSnapshotStruct() => _recordSnapshotStruct != null;

  static PropertyStruct fromMap(Map<String, dynamic> data) => PropertyStruct(
        valueProperty: data['valueProperty'] as String?,
        recordSnapshotStruct: data['recordSnapshotStruct']
                is RecordSnapshotStruct
            ? data['recordSnapshotStruct']
            : RecordSnapshotStruct.maybeFromMap(data['recordSnapshotStruct']),
      );

  static PropertyStruct? maybeFromMap(dynamic data) =>
      data is Map ? PropertyStruct.fromMap(data.cast<String, dynamic>()) : null;

  Map<String, dynamic> toMap() => {
        'valueProperty': _valueProperty,
        'recordSnapshotStruct': _recordSnapshotStruct?.toMap(),
      }.withoutNulls;

  @override
  Map<String, dynamic> toSerializableMap() => {
        'valueProperty': serializeParam(
          _valueProperty,
          ParamType.String,
        ),
        'recordSnapshotStruct': serializeParam(
          _recordSnapshotStruct,
          ParamType.DataStruct,
        ),
      }.withoutNulls;

  static PropertyStruct fromSerializableMap(Map<String, dynamic> data) =>
      PropertyStruct(
        valueProperty: deserializeParam(
          data['valueProperty'],
          ParamType.String,
          false,
        ),
        recordSnapshotStruct: deserializeStructParam(
          data['recordSnapshotStruct'],
          ParamType.DataStruct,
          false,
          structBuilder: RecordSnapshotStruct.fromSerializableMap,
        ),
      );

  @override
  String toString() => 'PropertyStruct(${toMap()})';

  @override
  bool operator ==(Object other) {
    return other is PropertyStruct &&
        valueProperty == other.valueProperty &&
        recordSnapshotStruct == other.recordSnapshotStruct;
  }

  @override
  int get hashCode =>
      const ListEquality().hash([valueProperty, recordSnapshotStruct]);
}

PropertyStruct createPropertyStruct({
  String? valueProperty,
  RecordSnapshotStruct? recordSnapshotStruct,
  Map<String, dynamic> fieldValues = const {},
  bool clearUnsetFields = true,
  bool create = false,
  bool delete = false,
}) =>
    PropertyStruct(
      valueProperty: valueProperty,
      recordSnapshotStruct: recordSnapshotStruct ??
          (clearUnsetFields ? RecordSnapshotStruct() : null),
      firestoreUtilData: FirestoreUtilData(
        clearUnsetFields: clearUnsetFields,
        create: create,
        delete: delete,
        fieldValues: fieldValues,
      ),
    );

PropertyStruct? updatePropertyStruct(
  PropertyStruct? property, {
  bool clearUnsetFields = true,
  bool create = false,
}) =>
    property
      ?..firestoreUtilData = FirestoreUtilData(
        clearUnsetFields: clearUnsetFields,
        create: create,
      );

void addPropertyStructData(
  Map<String, dynamic> firestoreData,
  PropertyStruct? property,
  String fieldName, [
  bool forFieldValue = false,
]) {
  firestoreData.remove(fieldName);
  if (property == null) {
    return;
  }
  if (property.firestoreUtilData.delete) {
    firestoreData[fieldName] = FieldValue.delete();
    return;
  }
  final clearFields =
      !forFieldValue && property.firestoreUtilData.clearUnsetFields;
  if (clearFields) {
    firestoreData[fieldName] = <String, dynamic>{};
  }
  final propertyData = getPropertyFirestoreData(property, forFieldValue);
  final nestedData = propertyData.map((k, v) => MapEntry('$fieldName.$k', v));

  final mergeFields = property.firestoreUtilData.create || clearFields;
  firestoreData
      .addAll(mergeFields ? mergeNestedFields(nestedData) : nestedData);
}

Map<String, dynamic> getPropertyFirestoreData(
  PropertyStruct? property, [
  bool forFieldValue = false,
]) {
  if (property == null) {
    return {};
  }
  final firestoreData = mapToFirestore(property.toMap());

  // Handle nested data for "recordSnapshotStruct" field.
  addRecordSnapshotStructData(
    firestoreData,
    property.hasRecordSnapshotStruct() ? property.recordSnapshotStruct : null,
    'recordSnapshotStruct',
    forFieldValue,
  );

  // Add any Firestore field values
  property.firestoreUtilData.fieldValues
      .forEach((k, v) => firestoreData[k] = v);

  return forFieldValue ? mergeNestedFields(firestoreData) : firestoreData;
}

List<Map<String, dynamic>> getPropertyListFirestoreData(
  List<PropertyStruct>? propertys,
) =>
    propertys?.map((e) => getPropertyFirestoreData(e, true)).toList() ?? [];
