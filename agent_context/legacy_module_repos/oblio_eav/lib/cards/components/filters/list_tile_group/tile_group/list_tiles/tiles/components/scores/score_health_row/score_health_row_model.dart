import '/cards/components/filters/list_tile_group/tile_group/list_tiles/tiles/components/scores/score_health_icon/score_health_icon_widget.dart';
import '/flutter_flow/flutter_flow_util.dart';
import 'score_health_row_widget.dart' show ScoreHealthRowWidget;
import 'package:flutter/material.dart';

class ScoreHealthRowModel extends FlutterFlowModel<ScoreHealthRowWidget> {
  ///  State fields for stateful widgets in this component.

  // Model for scoreHealthIcon1.
  late ScoreHealthIconModel scoreHealthIcon1Model;
  // Model for scoreHealthIcon2.
  late ScoreHealthIconModel scoreHealthIcon2Model;
  // Model for scoreHealthIcon3.
  late ScoreHealthIconModel scoreHealthIcon3Model;
  // Model for scoreHealthIcon4.
  late ScoreHealthIconModel scoreHealthIcon4Model;
  // Model for scoreHealthIcon5.
  late ScoreHealthIconModel scoreHealthIcon5Model;

  @override
  void initState(BuildContext context) {
    scoreHealthIcon1Model = createModel(context, () => ScoreHealthIconModel());
    scoreHealthIcon2Model = createModel(context, () => ScoreHealthIconModel());
    scoreHealthIcon3Model = createModel(context, () => ScoreHealthIconModel());
    scoreHealthIcon4Model = createModel(context, () => ScoreHealthIconModel());
    scoreHealthIcon5Model = createModel(context, () => ScoreHealthIconModel());
  }

  @override
  void dispose() {
    scoreHealthIcon1Model.dispose();
    scoreHealthIcon2Model.dispose();
    scoreHealthIcon3Model.dispose();
    scoreHealthIcon4Model.dispose();
    scoreHealthIcon5Model.dispose();
  }
}
