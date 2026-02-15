import '/bar_side/forms/field_group_list/field_group/field_list/field/field_types/field_dropdown/field_dropdown_widget.dart';
import '/bar_side/forms/field_group_list/field_group/field_list/field/field_types/field_image/field_image_widget.dart';
import '/bar_side/forms/field_group_list/field_group/field_list/field/field_types/field_radio/field_radio_widget.dart';
import '/bar_side/forms/field_group_list/field_group/field_list/field/field_types/field_string/field_string_widget.dart';
import '/flutter_flow/flutter_flow_util.dart';
import 'field_dynamic_widget.dart' show FieldDynamicWidget;
import 'package:flutter/material.dart';

class FieldDynamicModel extends FlutterFlowModel<FieldDynamicWidget> {
  ///  State fields for stateful widgets in this component.

  // Model for fieldString component.
  late FieldStringModel fieldStringModel;
  // Model for fieldImage component.
  late FieldImageModel fieldImageModel;
  // Model for fieldRadioBox.
  late FieldRadioModel fieldRadioBoxModel;
  // Model for fieldDropdown component.
  late FieldDropdownModel fieldDropdownModel;

  @override
  void initState(BuildContext context) {
    fieldStringModel = createModel(context, () => FieldStringModel());
    fieldImageModel = createModel(context, () => FieldImageModel());
    fieldRadioBoxModel = createModel(context, () => FieldRadioModel());
    fieldDropdownModel = createModel(context, () => FieldDropdownModel());
  }

  @override
  void dispose() {
    fieldStringModel.dispose();
    fieldImageModel.dispose();
    fieldRadioBoxModel.dispose();
    fieldDropdownModel.dispose();
  }
}
