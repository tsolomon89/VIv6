import '/bar_nav/bar_nav/bar_nav_widget.dart';
import '/bar_side/bar_side/bar_side_widget.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/pages/components/app_background/app_background_widget.dart';
import '/pages/components/record_read_container/record_read_container_widget.dart';
import 'record_read_view_widget.dart' show RecordReadViewWidget;
import 'package:flutter/material.dart';

class RecordReadViewModel extends FlutterFlowModel<RecordReadViewWidget> {
  ///  Local state fields for this page.

  bool isExpanded = false;

  ///  State fields for stateful widgets in this page.

  // Model for appBackground component.
  late AppBackgroundModel appBackgroundModel;
  // Model for barNav component.
  late BarNavModel barNavModel;
  // Model for recordReadContainer component.
  late RecordReadContainerModel recordReadContainerModel;
  // Model for barSide component.
  late BarSideModel barSideModel;
  // State field(s) for TextField widget.
  FocusNode? textFieldFocusNode;
  TextEditingController? textController;
  String? Function(BuildContext, String?)? textControllerValidator;

  @override
  void initState(BuildContext context) {
    appBackgroundModel = createModel(context, () => AppBackgroundModel());
    barNavModel = createModel(context, () => BarNavModel());
    recordReadContainerModel =
        createModel(context, () => RecordReadContainerModel());
    barSideModel = createModel(context, () => BarSideModel());
  }

  @override
  void dispose() {
    appBackgroundModel.dispose();
    barNavModel.dispose();
    recordReadContainerModel.dispose();
    barSideModel.dispose();
    textFieldFocusNode?.dispose();
    textController?.dispose();
  }
}
