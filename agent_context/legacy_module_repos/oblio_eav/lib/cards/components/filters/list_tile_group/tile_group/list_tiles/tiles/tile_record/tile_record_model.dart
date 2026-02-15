import '/cards/components/filters/list_tile_group/tile_group/list_tiles/tiles/components/scores/score_health_row/score_health_row_widget.dart';
import '/cards/components/filters/list_tile_group/tile_group/list_tiles/tiles/components/scores/score_opp_row/score_opp_row_widget.dart';
import '/flutter_flow/flutter_flow_util.dart';
import 'tile_record_widget.dart' show TileRecordWidget;
import 'package:flutter/material.dart';

class TileRecordModel extends FlutterFlowModel<TileRecordWidget> {
  ///  State fields for stateful widgets in this component.

  // Model for scoreOppRow component.
  late ScoreOppRowModel scoreOppRowModel;
  // Model for scoreHealthRow component.
  late ScoreHealthRowModel scoreHealthRowModel;

  @override
  void initState(BuildContext context) {
    scoreOppRowModel = createModel(context, () => ScoreOppRowModel());
    scoreHealthRowModel = createModel(context, () => ScoreHealthRowModel());
  }

  @override
  void dispose() {
    scoreOppRowModel.dispose();
    scoreHealthRowModel.dispose();
  }
}
