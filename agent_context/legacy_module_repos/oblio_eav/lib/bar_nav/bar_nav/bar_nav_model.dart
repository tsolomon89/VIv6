import '/bar_nav/bar_nav_item/bar_nav_item_widget.dart';
import '/flutter_flow/flutter_flow_util.dart';
import 'bar_nav_widget.dart' show BarNavWidget;
import 'package:flutter/material.dart';

class BarNavModel extends FlutterFlowModel<BarNavWidget> {
  ///  Local state fields for this component.

  bool isExpanded = true;

  ///  State fields for stateful widgets in this component.

  // Model for barNavItem component.
  late BarNavItemModel barNavItemModel1;
  // Model for barNavItem component.
  late BarNavItemModel barNavItemModel2;
  // Model for barNavItem component.
  late BarNavItemModel barNavItemModel3;
  // Model for barNavItem component.
  late BarNavItemModel barNavItemModel4;
  // Model for barNavItem component.
  late BarNavItemModel barNavItemModel5;
  // Model for barNavItem component.
  late BarNavItemModel barNavItemModel6;
  // Model for barNavItem component.
  late BarNavItemModel barNavItemModel7;
  // Model for barNavItem component.
  late BarNavItemModel barNavItemModel8;

  @override
  void initState(BuildContext context) {
    barNavItemModel1 = createModel(context, () => BarNavItemModel());
    barNavItemModel2 = createModel(context, () => BarNavItemModel());
    barNavItemModel3 = createModel(context, () => BarNavItemModel());
    barNavItemModel4 = createModel(context, () => BarNavItemModel());
    barNavItemModel5 = createModel(context, () => BarNavItemModel());
    barNavItemModel6 = createModel(context, () => BarNavItemModel());
    barNavItemModel7 = createModel(context, () => BarNavItemModel());
    barNavItemModel8 = createModel(context, () => BarNavItemModel());
  }

  @override
  void dispose() {
    barNavItemModel1.dispose();
    barNavItemModel2.dispose();
    barNavItemModel3.dispose();
    barNavItemModel4.dispose();
    barNavItemModel5.dispose();
    barNavItemModel6.dispose();
    barNavItemModel7.dispose();
    barNavItemModel8.dispose();
  }
}
