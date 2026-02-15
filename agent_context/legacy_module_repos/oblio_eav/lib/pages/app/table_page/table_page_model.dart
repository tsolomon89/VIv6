import '/bar_nav/bar_nav/bar_nav_widget.dart';
import '/bar_side/bar_side/bar_side_widget.dart';
import '/flutter_flow/flutter_flow_util.dart';
import 'table_page_widget.dart' show TablePageWidget;
import 'package:flutter/material.dart';

class TablePageModel extends FlutterFlowModel<TablePageWidget> {
  ///  Local state fields for this page.

  bool isExpanded = false;

  ///  State fields for stateful widgets in this page.

  // Model for barNav component.
  late BarNavModel barNavModel;
  // Model for barSide component.
  late BarSideModel barSideModel;

  @override
  void initState(BuildContext context) {
    barNavModel = createModel(context, () => BarNavModel());
    barSideModel = createModel(context, () => BarSideModel());
  }

  @override
  void dispose() {
    barNavModel.dispose();
    barSideModel.dispose();
  }
}
