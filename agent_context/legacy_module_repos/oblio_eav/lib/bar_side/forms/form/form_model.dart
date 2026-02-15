import '/backend/backend.dart';
import '/backend/schema/structs/index.dart';
import '/bar_side/components/misc/form_controller/form_controller_widget.dart';
import '/bar_side/forms/field_group_list/field_group_list/field_group_list_widget.dart';
import '/flutter_flow/flutter_flow_util.dart';
import 'form_widget.dart' show FormWidget;
import 'package:flutter/material.dart';

class FormModel extends FlutterFlowModel<FormWidget> {
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

  final formKey = GlobalKey<FormState>();
  // Model for formController component.
  late FormControllerModel formControllerModel;
  // Model for fieldGroupList component.
  late FieldGroupListModel fieldGroupListModel;

  @override
  void initState(BuildContext context) {
    formControllerModel = createModel(context, () => FormControllerModel());
    fieldGroupListModel = createModel(context, () => FieldGroupListModel());
  }

  @override
  void dispose() {
    formControllerModel.dispose();
    fieldGroupListModel.dispose();
  }
}
