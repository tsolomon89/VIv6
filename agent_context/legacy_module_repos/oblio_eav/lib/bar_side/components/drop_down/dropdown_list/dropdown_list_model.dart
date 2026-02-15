import '/backend/backend.dart';
import '/backend/schema/structs/index.dart';
import '/flutter_flow/flutter_flow_util.dart';
import 'dropdown_list_widget.dart' show DropdownListWidget;
import 'package:flutter/material.dart';

class DropdownListModel extends FlutterFlowModel<DropdownListWidget> {
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

  @override
  void initState(BuildContext context) {}

  @override
  void dispose() {}
}
