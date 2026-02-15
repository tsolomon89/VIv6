import '/backend/backend.dart';
import '/backend/schema/structs/index.dart';
import '/bar_side/forms/field_group_list/field_group/field_group_item/field_group_item_widget.dart';
import '/flutter_flow/flutter_flow_util.dart';
import 'field_group_list_widget.dart' show FieldGroupListWidget;
import 'package:flutter/material.dart';

class FieldGroupListModel extends FlutterFlowModel<FieldGroupListWidget> {
  ///  Local state fields for this component.

  List<PropertyStruct> selectedPropertyList = [];
  void addToSelectedPropertyList(PropertyStruct item) =>
      selectedPropertyList.add(item);
  void removeFromSelectedPropertyList(PropertyStruct item) =>
      selectedPropertyList.remove(item);
  void removeAtIndexFromSelectedPropertyList(int index) =>
      selectedPropertyList.removeAt(index);
  void insertAtIndexInSelectedPropertyList(int index, PropertyStruct item) =>
      selectedPropertyList.insert(index, item);
  void updateSelectedPropertyListAtIndex(
          int index, Function(PropertyStruct) updateFn) =>
      selectedPropertyList[index] = updateFn(selectedPropertyList[index]);

  List<FieldStruct> fieldStructList = [];
  void addToFieldStructList(FieldStruct item) => fieldStructList.add(item);
  void removeFromFieldStructList(FieldStruct item) =>
      fieldStructList.remove(item);
  void removeAtIndexFromFieldStructList(int index) =>
      fieldStructList.removeAt(index);
  void insertAtIndexInFieldStructList(int index, FieldStruct item) =>
      fieldStructList.insert(index, item);
  void updateFieldStructListAtIndex(
          int index, Function(FieldStruct) updateFn) =>
      fieldStructList[index] = updateFn(fieldStructList[index]);

  ///  State fields for stateful widgets in this component.

  // Models for fieldGroupItem dynamic component.
  late FlutterFlowDynamicModels<FieldGroupItemModel> fieldGroupItemModels;

  @override
  void initState(BuildContext context) {
    fieldGroupItemModels =
        FlutterFlowDynamicModels(() => FieldGroupItemModel());
  }

  @override
  void dispose() {
    fieldGroupItemModels.dispose();
  }
}
