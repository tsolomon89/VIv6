import '/cards/components/filters/list_tile_group/tile_group/list_tiles/tiles/components/expanded_tile_list/expanded_tile_list_widget.dart';
import '/cards/components/filters/list_tile_group/tile_group/list_tiles/tiles/components/scores/score_health_row/score_health_row_widget.dart';
import '/flutter_flow/flutter_flow_util.dart';
import 'tile_dynamic_expandable_widget.dart' show TileDynamicExpandableWidget;
import 'package:expandable/expandable.dart';
import 'package:flutter/material.dart';

class TileDynamicExpandableModel
    extends FlutterFlowModel<TileDynamicExpandableWidget> {
  ///  State fields for stateful widgets in this component.

  // State field(s) for Expandable widget.
  late ExpandableController expandableExpandableController;

  // Model for scoreHealthRow component.
  late ScoreHealthRowModel scoreHealthRowModel;
  // Model for expandedTileList component.
  late ExpandedTileListModel expandedTileListModel;

  @override
  void initState(BuildContext context) {
    scoreHealthRowModel = createModel(context, () => ScoreHealthRowModel());
    expandedTileListModel = createModel(context, () => ExpandedTileListModel());
  }

  @override
  void dispose() {
    expandableExpandableController.dispose();
    scoreHealthRowModel.dispose();
    expandedTileListModel.dispose();
  }
}
