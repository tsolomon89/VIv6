import '/backend/backend.dart';
import '/backend/schema/structs/index.dart';
import '/bar_side/forms/field_group_list/field_group/field_list/field/field_dynamic/field_dynamic_widget.dart';
import '/flutter_flow/flutter_flow_util.dart';
import 'field_list_widget.dart' show FieldListWidget;
import 'package:flutter/material.dart';

class FieldListModel extends FlutterFlowModel<FieldListWidget> {
  ///  Local state fields for this component.

  List<PropertyStruct> selectedProperities = [];
  void addToSelectedProperities(PropertyStruct item) =>
      selectedProperities.add(item);
  void removeFromSelectedProperities(PropertyStruct item) =>
      selectedProperities.remove(item);
  void removeAtIndexFromSelectedProperities(int index) =>
      selectedProperities.removeAt(index);
  void insertAtIndexInSelectedProperities(int index, PropertyStruct item) =>
      selectedProperities.insert(index, item);
  void updateSelectedProperitiesAtIndex(
          int index, Function(PropertyStruct) updateFn) =>
      selectedProperities[index] = updateFn(selectedProperities[index]);

  bool actionQueired = false;

  bool filterQueried = false;

  ///  State fields for stateful widgets in this component.

  // Models for fieldDynamic dynamic component.
  late FlutterFlowDynamicModels<FieldDynamicModel> fieldDynamicModels;

  @override
  void initState(BuildContext context) {
    fieldDynamicModels = FlutterFlowDynamicModels(() => FieldDynamicModel());
  }

  @override
  void dispose() {
    fieldDynamicModels.dispose();
  }
}
