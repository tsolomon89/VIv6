import '/backend/backend.dart';
import '/backend/schema/structs/index.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/form_field_controller.dart';
import 'dropdown_item_default_widget.dart' show DropdownItemDefaultWidget;
import 'package:flutter/material.dart';

class DropdownItemDefaultModel
    extends FlutterFlowModel<DropdownItemDefaultWidget> {
  ///  Local state fields for this component.

  PropertyStruct? selectedValue;
  void updateSelectedValueStruct(Function(PropertyStruct) updateFn) {
    updateFn(selectedValue ??= PropertyStruct());
  }

  List<PropertyStruct> selectedValues = [];
  void addToSelectedValues(PropertyStruct item) => selectedValues.add(item);
  void removeFromSelectedValues(PropertyStruct item) =>
      selectedValues.remove(item);
  void removeAtIndexFromSelectedValues(int index) =>
      selectedValues.removeAt(index);
  void insertAtIndexInSelectedValues(int index, PropertyStruct item) =>
      selectedValues.insert(index, item);
  void updateSelectedValuesAtIndex(
          int index, Function(PropertyStruct) updateFn) =>
      selectedValues[index] = updateFn(selectedValues[index]);

  ///  State fields for stateful widgets in this component.

  // State field(s) for DropDown widget.
  List<String>? dropDownValue;
  FormFieldController<List<String>>? dropDownValueController;

  @override
  void initState(BuildContext context) {}

  @override
  void dispose() {}
}
