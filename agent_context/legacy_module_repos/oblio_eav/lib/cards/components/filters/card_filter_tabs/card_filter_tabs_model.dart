import '/cards/components/filters/list_tile_group/tile_group/list_tiles/list_tiles/list_tiles_widget.dart';
import '/flutter_flow/flutter_flow_util.dart';
import 'card_filter_tabs_widget.dart' show CardFilterTabsWidget;
import 'package:flutter/material.dart';

class CardFilterTabsModel extends FlutterFlowModel<CardFilterTabsWidget> {
  ///  State fields for stateful widgets in this component.

  // State field(s) for TabBar widget.
  TabController? tabBarController;
  int get tabBarCurrentIndex =>
      tabBarController != null ? tabBarController!.index : 0;
  int get tabBarPreviousIndex =>
      tabBarController != null ? tabBarController!.previousIndex : 0;

  // Model for listTiles component.
  late ListTilesModel listTilesModel1;
  // Model for listTiles component.
  late ListTilesModel listTilesModel2;

  @override
  void initState(BuildContext context) {
    listTilesModel1 = createModel(context, () => ListTilesModel());
    listTilesModel2 = createModel(context, () => ListTilesModel());
  }

  @override
  void dispose() {
    tabBarController?.dispose();
    listTilesModel1.dispose();
    listTilesModel2.dispose();
  }
}
