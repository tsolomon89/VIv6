import '/backend/backend.dart';
import '/backend/schema/structs/index.dart';
import '/bar_side/components/drop_down/dropdown_item/dropdown_item_widget.dart';
import '/flutter_flow/flutter_flow_util.dart';
import 'field_dropdown_widget.dart' show FieldDropdownWidget;
import 'package:flutter/material.dart';

class FieldDropdownModel extends FlutterFlowModel<FieldDropdownWidget> {
  ///  Local state fields for this component.

  String? fieldName = '';

  String? selectedValue = '';

  PropertyStruct? selectedPropertyStruct;
  void updateSelectedPropertyStructStruct(Function(PropertyStruct) updateFn) {
    updateFn(selectedPropertyStruct ??= PropertyStruct());
  }

  bool isExpanded = false;

  ///  State fields for stateful widgets in this component.

  // Model for dropdownItem component.
  late DropdownItemModel dropdownItemModel;

  @override
  void initState(BuildContext context) {
    dropdownItemModel = createModel(context, () => DropdownItemModel());
  }

  @override
  void dispose() {
    dropdownItemModel.dispose();
  }
}
