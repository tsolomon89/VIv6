import '/cards/components/filters/list_tile_group/tile_group/list_tiles/tiles/components/scores/score_chip/score_chip_widget.dart';
import '/flutter_flow/flutter_flow_util.dart';
import 'score_opp_row_widget.dart' show ScoreOppRowWidget;
import 'package:flutter/material.dart';

class ScoreOppRowModel extends FlutterFlowModel<ScoreOppRowWidget> {
  ///  State fields for stateful widgets in this component.

  // Model for scoreChip component.
  late ScoreChipModel scoreChipModel1;
  // Model for scoreChip component.
  late ScoreChipModel scoreChipModel2;
  // Model for scoreChip component.
  late ScoreChipModel scoreChipModel3;
  // Model for scoreChip component.
  late ScoreChipModel scoreChipModel4;

  @override
  void initState(BuildContext context) {
    scoreChipModel1 = createModel(context, () => ScoreChipModel());
    scoreChipModel2 = createModel(context, () => ScoreChipModel());
    scoreChipModel3 = createModel(context, () => ScoreChipModel());
    scoreChipModel4 = createModel(context, () => ScoreChipModel());
  }

  @override
  void dispose() {
    scoreChipModel1.dispose();
    scoreChipModel2.dispose();
    scoreChipModel3.dispose();
    scoreChipModel4.dispose();
  }
}
