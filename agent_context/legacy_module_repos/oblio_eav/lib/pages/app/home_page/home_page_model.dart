import '/bar_nav/bar_nav/bar_nav_widget.dart';
import '/bar_side/bar_side/bar_side_widget.dart';
import '/cards/card_dynamic/card_dynamic_widget.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/pages/components/app_background/app_background_widget.dart';
import 'home_page_widget.dart' show HomePageWidget;
import 'package:flutter/material.dart';

class HomePageModel extends FlutterFlowModel<HomePageWidget> {
  ///  Local state fields for this page.

  bool isExpanded = false;

  ///  State fields for stateful widgets in this page.

  // Model for appBackground component.
  late AppBackgroundModel appBackgroundModel;
  // Model for barNav component.
  late BarNavModel barNavModel;
  // Model for cardDynamic component.
  late CardDynamicModel cardDynamicModel1;
  // Model for cardDynamic component.
  late CardDynamicModel cardDynamicModel2;
  // Model for cardDynamic component.
  late CardDynamicModel cardDynamicModel3;
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
    cardDynamicModel1 = createModel(context, () => CardDynamicModel());
    cardDynamicModel2 = createModel(context, () => CardDynamicModel());
    cardDynamicModel3 = createModel(context, () => CardDynamicModel());
    barSideModel = createModel(context, () => BarSideModel());
  }

  @override
  void dispose() {
    appBackgroundModel.dispose();
    barNavModel.dispose();
    cardDynamicModel1.dispose();
    cardDynamicModel2.dispose();
    cardDynamicModel3.dispose();
    barSideModel.dispose();
    textFieldFocusNode?.dispose();
    textController?.dispose();
  }
}
