import '/backend/backend.dart';
import '/backend/schema/structs/index.dart';
import '/flutter_flow/flutter_flow_util.dart';
import 'field_string_widget.dart' show FieldStringWidget;
import 'package:flutter/material.dart';

class FieldStringModel extends FlutterFlowModel<FieldStringWidget> {
  ///  Local state fields for this component.

  String? valueEntered = '';

  String fieldName = '';

  List<PropertyStruct> dataEntered = [];
  void addToDataEntered(PropertyStruct item) => dataEntered.add(item);
  void removeFromDataEntered(PropertyStruct item) => dataEntered.remove(item);
  void removeAtIndexFromDataEntered(int index) => dataEntered.removeAt(index);
  void insertAtIndexInDataEntered(int index, PropertyStruct item) =>
      dataEntered.insert(index, item);
  void updateDataEnteredAtIndex(int index, Function(PropertyStruct) updateFn) =>
      dataEntered[index] = updateFn(dataEntered[index]);

  ///  State fields for stateful widgets in this component.

  // State field(s) for listTextField widget.
  FocusNode? listTextFieldFocusNode;
  TextEditingController? listTextFieldTextController;
  String? Function(BuildContext, String?)? listTextFieldTextControllerValidator;

  @override
  void initState(BuildContext context) {}

  @override
  void dispose() {
    listTextFieldFocusNode?.dispose();
    listTextFieldTextController?.dispose();
  }
}
