import '/backend/backend.dart';
import '/backend/schema/structs/index.dart';
import '/flutter_flow/flutter_flow_util.dart';
import 'dropdown_item_widget.dart' show DropdownItemWidget;
import 'package:expandable/expandable.dart';
import 'package:flutter/material.dart';

class DropdownItemModel extends FlutterFlowModel<DropdownItemWidget> {
  ///  Local state fields for this component.

  bool isExpanded = false;

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

  // State field(s) for Expandable widget.
  late ExpandableController expandableExpandableController;

  @override
  void initState(BuildContext context) {}

  @override
  void dispose() {
    expandableExpandableController.dispose();
  }
}
