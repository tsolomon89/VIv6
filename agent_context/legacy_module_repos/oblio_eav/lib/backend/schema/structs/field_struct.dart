// ignore_for_file: unnecessary_getters_setters

import 'package:cloud_firestore/cloud_firestore.dart';

import '/backend/schema/util/firestore_util.dart';

import 'index.dart';
import '/flutter_flow/flutter_flow_util.dart';

class FieldStruct extends FFFirebaseStruct {
  FieldStruct({
    String? idRefFieldRecord,
    String? nameField,
    String? inputType,
    double? displayPosition,
    bool? isSelectMany,
    bool? isSystem,
    List<PropertyStruct>? propertyStructs,
    FirestoreUtilData firestoreUtilData = const FirestoreUtilData(),
  })  : _idRefFieldRecord = idRefFieldRecord,
        _nameField = nameField,
        _inputType = inputType,
        _displayPosition = displayPosition,
        _isSelectMany = isSelectMany,
        _isSystem = isSystem,
        _propertyStructs = propertyStructs,
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

  // "propertyStructs" field.
  List<PropertyStruct>? _propertyStructs;
  List<PropertyStruct> get propertyStructs => _propertyStructs ?? const [];
  set propertyStructs(List<PropertyStruct>? val) => _propertyStructs = val;

  void updatePropertyStructs(Function(List<PropertyStruct>) updateFn) {
    updateFn(_propertyStructs ??= []);
  }

  bool hasPropertyStructs() => _propertyStructs != null;

  static FieldStruct fromMap(Map<String, dynamic> data) => FieldStruct(
        idRefFieldRecord: data['idRefFieldRecord'] as String?,
        nameField: data['nameField'] as String?,
        inputType: data['inputType'] as String?,
        displayPosition: castToType<double>(data['displayPosition']),
        isSelectMany: data['isSelectMany'] as bool?,
        isSystem: data['isSystem'] as bool?,
        propertyStructs: getStructList(
          data['propertyStructs'],
          PropertyStruct.fromMap,
        ),
      );

  static FieldStruct? maybeFromMap(dynamic data) =>
      data is Map ? FieldStruct.fromMap(data.cast<String, dynamic>()) : null;

  Map<String, dynamic> toMap() => {
        'idRefFieldRecord': _idRefFieldRecord,
        'nameField': _nameField,
        'inputType': _inputType,
        'displayPosition': _displayPosition,
        'isSelectMany': _isSelectMany,
        'isSystem': _isSystem,
        'propertyStructs': _propertyStructs?.map((e) => e.toMap()).toList(),
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
        'propertyStructs': serializeParam(
          _propertyStructs,
          ParamType.DataStruct,
          isList: true,
        ),
      }.withoutNulls;

  static FieldStruct fromSerializableMap(Map<String, dynamic> data) =>
      FieldStruct(
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
        propertyStructs: deserializeStructParam<PropertyStruct>(
          data['propertyStructs'],
          ParamType.DataStruct,
          true,
          structBuilder: PropertyStruct.fromSerializableMap,
        ),
      );

  @override
  String toString() => 'FieldStruct(${toMap()})';

  @override
  bool operator ==(Object other) {
    const listEquality = ListEquality();
    return other is FieldStruct &&
        idRefFieldRecord == other.idRefFieldRecord &&
        nameField == other.nameField &&
        inputType == other.inputType &&
        displayPosition == other.displayPosition &&
        isSelectMany == other.isSelectMany &&
        isSystem == other.isSystem &&
        listEquality.equals(propertyStructs, other.propertyStructs);
  }

  @override
  int get hashCode => const ListEquality().hash([
        idRefFieldRecord,
        nameField,
        inputType,
        displayPosition,
        isSelectMany,
        isSystem,
        propertyStructs
      ]);
}

FieldStruct createFieldStruct({
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
    FieldStruct(
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

FieldStruct? updateFieldStruct(
  FieldStruct? field, {
  bool clearUnsetFields = true,
  bool create = false,
}) =>
    field
      ?..firestoreUtilData = FirestoreUtilData(
        clearUnsetFields: clearUnsetFields,
        create: create,
      );

void addFieldStructData(
  Map<String, dynamic> firestoreData,
  FieldStruct? field,
  String fieldName, [
  bool forFieldValue = false,
]) {
  firestoreData.remove(fieldName);
  if (field == null) {
    return;
  }
  if (field.firestoreUtilData.delete) {
    firestoreData[fieldName] = FieldValue.delete();
    return;
  }
  final clearFields =
      !forFieldValue && field.firestoreUtilData.clearUnsetFields;
  if (clearFields) {
    firestoreData[fieldName] = <String, dynamic>{};
  }
  final fieldData = getFieldFirestoreData(field, forFieldValue);
  final nestedData = fieldData.map((k, v) => MapEntry('$fieldName.$k', v));

  final mergeFields = field.firestoreUtilData.create || clearFields;
  firestoreData
      .addAll(mergeFields ? mergeNestedFields(nestedData) : nestedData);
}

Map<String, dynamic> getFieldFirestoreData(
  FieldStruct? field, [
  bool forFieldValue = false,
]) {
  if (field == null) {
    return {};
  }
  final firestoreData = mapToFirestore(field.toMap());

  // Add any Firestore field values
  field.firestoreUtilData.fieldValues.forEach((k, v) => firestoreData[k] = v);

  return forFieldValue ? mergeNestedFields(firestoreData) : firestoreData;
}

List<Map<String, dynamic>> getFieldListFirestoreData(
  List<FieldStruct>? fields,
) =>
    fields?.map((e) => getFieldFirestoreData(e, true)).toList() ?? [];
