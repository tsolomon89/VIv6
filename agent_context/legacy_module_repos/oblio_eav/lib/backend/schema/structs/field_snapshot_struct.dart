// ignore_for_file: unnecessary_getters_setters

import 'package:cloud_firestore/cloud_firestore.dart';

import '/backend/schema/util/firestore_util.dart';

import 'index.dart';
import '/flutter_flow/flutter_flow_util.dart';

class FieldSnapshotStruct extends FFFirebaseStruct {
  FieldSnapshotStruct({
    String? idRefFieldRecord,
    String? nameField,
    String? inputType,
    double? displayPosition,
    bool? isSelectMany,
    bool? isSystem,
    List<PropertySnapshotStruct>? propertySnapshotStructs,
    FirestoreUtilData firestoreUtilData = const FirestoreUtilData(),
  })  : _idRefFieldRecord = idRefFieldRecord,
        _nameField = nameField,
        _inputType = inputType,
        _displayPosition = displayPosition,
        _isSelectMany = isSelectMany,
        _isSystem = isSystem,
        _propertySnapshotStructs = propertySnapshotStructs,
        super(firestoreUtilData);

  // "idRefFieldRecord" field.
  String? _idRefFieldRecord;
  String get idRefFieldRecord => _idRefFieldRecord ?? '';
  set idRefFieldRecord(String? val) => _idRefFieldRecord = val;

  bool hasIdRefFieldRecord() => _idRefFieldRecord != null;

  // "nameField" field.
  String? _nameField;
  String get nameField => _nameField ?? '';
  set nameField(String? val) => _nameField = val;

  bool hasNameField() => _nameField != null;

  // "inputType" field.
  String? _inputType;
  String get inputType => _inputType ?? '';
  set inputType(String? val) => _inputType = val;

  bool hasInputType() => _inputType != null;

  // "displayPosition" field.
  double? _displayPosition;
  double get displayPosition => _displayPosition ?? 0.0;
  set displayPosition(double? val) => _displayPosition = val;

  void incrementDisplayPosition(double amount) =>
      displayPosition = displayPosition + amount;

  bool hasDisplayPosition() => _displayPosition != null;

  // "isSelectMany" field.
  bool? _isSelectMany;
  bool get isSelectMany => _isSelectMany ?? false;
  set isSelectMany(bool? val) => _isSelectMany = val;

  bool hasIsSelectMany() => _isSelectMany != null;

  // "isSystem" field.
  bool? _isSystem;
  bool get isSystem => _isSystem ?? false;
  set isSystem(bool? val) => _isSystem = val;

  bool hasIsSystem() => _isSystem != null;

  // "propertySnapshotStructs" field.
  List<PropertySnapshotStruct>? _propertySnapshotStructs;
  List<PropertySnapshotStruct> get propertySnapshotStructs =>
      _propertySnapshotStructs ?? const [];
  set propertySnapshotStructs(List<PropertySnapshotStruct>? val) =>
      _propertySnapshotStructs = val;

  void updatePropertySnapshotStructs(
      Function(List<PropertySnapshotStruct>) updateFn) {
    updateFn(_propertySnapshotStructs ??= []);
  }

  bool hasPropertySnapshotStructs() => _propertySnapshotStructs != null;

  static FieldSnapshotStruct fromMap(Map<String, dynamic> data) =>
      FieldSnapshotStruct(
        idRefFieldRecord: data['idRefFieldRecord'] as String?,
        nameField: data['nameField'] as String?,
        inputType: data['inputType'] as String?,
        displayPosition: castToType<double>(data['displayPosition']),
        isSelectMany: data['isSelectMany'] as bool?,
        isSystem: data['isSystem'] as bool?,
        propertySnapshotStructs: getStructList(
          data['propertySnapshotStructs'],
          PropertySnapshotStruct.fromMap,
        ),
      );

  static FieldSnapshotStruct? maybeFromMap(dynamic data) => data is Map
      ? FieldSnapshotStruct.fromMap(data.cast<String, dynamic>())
      : null;

  Map<String, dynamic> toMap() => {
        'idRefFieldRecord': _idRefFieldRecord,
        'nameField': _nameField,
        'inputType': _inputType,
        'displayPosition': _displayPosition,
        'isSelectMany': _isSelectMany,
        'isSystem': _isSystem,
        'propertySnapshotStructs':
            _propertySnapshotStructs?.map((e) => e.toMap()).toList(),
      }.withoutNulls;

  @override
  Map<String, dynamic> toSerializableMap() => {
        'idRefFieldRecord': serializeParam(
          _idRefFieldRecord,
          ParamType.String,
        ),
        'nameField': serializeParam(
          _nameField,
          ParamType.String,
        ),
        'inputType': serializeParam(
          _inputType,
          ParamType.String,
        ),
        'displayPosition': serializeParam(
          _displayPosition,
          ParamType.double,
        ),
        'isSelectMany': serializeParam(
          _isSelectMany,
          ParamType.bool,
        ),
        'isSystem': serializeParam(
          _isSystem,
          ParamType.bool,
        ),
        'propertySnapshotStructs': serializeParam(
          _propertySnapshotStructs,
          ParamType.DataStruct,
          isList: true,
        ),
      }.withoutNulls;

  static FieldSnapshotStruct fromSerializableMap(Map<String, dynamic> data) =>
      FieldSnapshotStruct(
        idRefFieldRecord: deserializeParam(
          data['idRefFieldRecord'],
          ParamType.String,
          false,
        ),
        nameField: deserializeParam(
          data['nameField'],
          ParamType.String,
          false,
        ),
        inputType: deserializeParam(
          data['inputType'],
          ParamType.String,
          false,
        ),
        displayPosition: deserializeParam(
          data['displayPosition'],
          ParamType.double,
          false,
        ),
        isSelectMany: deserializeParam(
          data['isSelectMany'],
          ParamType.bool,
          false,
        ),
        isSystem: deserializeParam(
          data['isSystem'],
          ParamType.bool,
          false,
        ),
        propertySnapshotStructs: deserializeStructParam<PropertySnapshotStruct>(
          data['propertySnapshotStructs'],
          ParamType.DataStruct,
          true,
          structBuilder: PropertySnapshotStruct.fromSerializableMap,
        ),
      );

  @override
  String toString() => 'FieldSnapshotStruct(${toMap()})';

  @override
  bool operator ==(Object other) {
    const listEquality = ListEquality();
    return other is FieldSnapshotStruct &&
        idRefFieldRecord == other.idRefFieldRecord &&
        nameField == other.nameField &&
        inputType == other.inputType &&
        displayPosition == other.displayPosition &&
        isSelectMany == other.isSelectMany &&
        isSystem == other.isSystem &&
        listEquality.equals(
            propertySnapshotStructs, other.propertySnapshotStructs);
  }

  @override
  int get hashCode => const ListEquality().hash([
        idRefFieldRecord,
        nameField,
        inputType,
        displayPosition,
        isSelectMany,
        isSystem,
        propertySnapshotStructs
      ]);
}

FieldSnapshotStruct createFieldSnapshotStruct({
  String? idRefFieldRecord,
  String? nameField,
  String? inputType,
  double? displayPosition,
  bool? isSelectMany,
  bool? isSystem,
  Map<String, dynamic> fieldValues = const {},
  bool clearUnsetFields = true,
  bool create = false,
  bool delete = false,
}) =>
    FieldSnapshotStruct(
      idRefFieldRecord: idRefFieldRecord,
      nameField: nameField,
      inputType: inputType,
      displayPosition: displayPosition,
      isSelectMany: isSelectMany,
      isSystem: isSystem,
      firestoreUtilData: FirestoreUtilData(
        clearUnsetFields: clearUnsetFields,
        create: create,
        delete: delete,
        fieldValues: fieldValues,
      ),
    );

FieldSnapshotStruct? updateFieldSnapshotStruct(
  FieldSnapshotStruct? fieldSnapshot, {
  bool clearUnsetFields = true,
  bool create = false,
}) =>
    fieldSnapshot
      ?..firestoreUtilData = FirestoreUtilData(
        clearUnsetFields: clearUnsetFields,
        create: create,
      );

void addFieldSnapshotStructData(
  Map<String, dynamic> firestoreData,
  FieldSnapshotStruct? fieldSnapshot,
  String fieldName, [
  bool forFieldValue = false,
]) {
  firestoreData.remove(fieldName);
  if (fieldSnapshot == null) {
    return;
  }
  if (fieldSnapshot.firestoreUtilData.delete) {
    firestoreData[fieldName] = FieldValue.delete();
    return;
  }
  final clearFields =
      !forFieldValue && fieldSnapshot.firestoreUtilData.clearUnsetFields;
  if (clearFields) {
    firestoreData[fieldName] = <String, dynamic>{};
  }
  final fieldSnapshotData =
      getFieldSnapshotFirestoreData(fieldSnapshot, forFieldValue);
  final nestedData =
      fieldSnapshotData.map((k, v) => MapEntry('$fieldName.$k', v));

  final mergeFields = fieldSnapshot.firestoreUtilData.create || clearFields;
  firestoreData
      .addAll(mergeFields ? mergeNestedFields(nestedData) : nestedData);
}

Map<String, dynamic> getFieldSnapshotFirestoreData(
  FieldSnapshotStruct? fieldSnapshot, [
  bool forFieldValue = false,
]) {
  if (fieldSnapshot == null) {
    return {};
  }
  final firestoreData = mapToFirestore(fieldSnapshot.toMap());

  // Add any Firestore field values
  fieldSnapshot.firestoreUtilData.fieldValues
      .forEach((k, v) => firestoreData[k] = v);

  return forFieldValue ? mergeNestedFields(firestoreData) : firestoreData;
}

List<Map<String, dynamic>> getFieldSnapshotListFirestoreData(
  List<FieldSnapshotStruct>? fieldSnapshots,
) =>
    fieldSnapshots
        ?.map((e) => getFieldSnapshotFirestoreData(e, true))
        .toList() ??
    [];
