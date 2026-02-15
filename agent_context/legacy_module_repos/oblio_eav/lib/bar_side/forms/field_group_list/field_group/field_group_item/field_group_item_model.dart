import '/backend/backend.dart';
import '/backend/schema/structs/index.dart';
import '/bar_side/components/misc/bar_side_form_label/bar_side_form_label_widget.dart';
import '/bar_side/components/misc/divider/divider_widget.dart';
import '/bar_side/forms/field_group_list/field_group/field_list/field_list/field_list_widget.dart';
import '/flutter_flow/flutter_flow_util.dart';
import 'field_group_item_widget.dart' show FieldGroupItemWidget;
import 'package:expandable/expandable.dart';
import 'package:flutter/material.dart';

class FieldGroupItemModel extends FlutterFlowModel<FieldGroupItemWidget> {
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

  ///  State fields for stateful widgets in this component.

  // State field(s) for Expandable widget.
  late ExpandableController expandableExpandableController;

  // Model for barSideFormLabel component.
  late BarSideFormLabelModel barSideFormLabelModel;
  // Model for fieldList component.
  late FieldListModel fieldListModel;
  // Model for divider component.
  late DividerModel dividerModel;

  @override
  void initState(BuildContext context) {
    barSideFormLabelModel = createModel(context, () => BarSideFormLabelModel());
    fieldListModel = createModel(context, () => FieldListModel());
    dividerModel = createModel(context, () => DividerModel());
  }

  @override
  void dispose() {
    expandableExpandableController.dispose();
    barSideFormLabelModel.dispose();
    fieldListModel.dispose();
    dividerModel.dispose();
  }
}
