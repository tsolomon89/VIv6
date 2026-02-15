import '/flutter_flow/flutter_flow_util.dart';
import '/misc/form_old/form_old_widget.dart';
import 'bar_side_form_widget.dart' show BarSideFormWidget;
import 'package:flutter/material.dart';

class BarSideFormModel extends FlutterFlowModel<BarSideFormWidget> {
  ///  Local state fields for this component.

  String? departmentSelected;

  ///  State fields for stateful widgets in this component.

  // Model for formOld component.
  late FormOldModel formOldModel;

  @override
  void initState(BuildContext context) {
    formOldModel = createModel(context, () => FormOldModel());
  }

  @override
  void dispose() {
    formOldModel.dispose();
  }
}
