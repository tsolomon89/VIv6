import '/cards/components/button_title_expand/button_title_expand_widget.dart';
import '/cards/components/filters/list_tile_group/tile_group/list_tiles/tiles/components/icon_dynamic/icon_dynamic_widget.dart';
import '/cards/components/filters/list_tile_group/tile_group/list_tiles/tiles/components/scores/score_health_row/score_health_row_widget.dart';
import '/cards/components/filters/list_tile_group/tile_group/list_tiles/tiles/components/scores/score_opp_row/score_opp_row_widget.dart';
import '/flutter_flow/flutter_flow_util.dart';
import 'tile_dynamic_widget.dart' show TileDynamicWidget;
import 'package:flutter/material.dart';

class TileDynamicModel extends FlutterFlowModel<TileDynamicWidget> {
  ///  Local state fields for this component.

  bool isExpanded = false;

  ///  State fields for stateful widgets in this component.

  // Model for iconDynamic component.
  late IconDynamicModel iconDynamicModel;
  // Model for buttonTitleExpand component.
  late ButtonTitleExpandModel buttonTitleExpandModel;
  // Model for scoreHealthRow component.
  late ScoreHealthRowModel scoreHealthRowModel;
  // Model for scoreOppRow component.
  late ScoreOppRowModel scoreOppRowModel;

  @override
  void initState(BuildContext context) {
    iconDynamicModel = createModel(context, () => IconDynamicModel());
    buttonTitleExpandModel =
        createModel(context, () => ButtonTitleExpandModel());
    scoreHealthRowModel = createModel(context, () => ScoreHealthRowModel());
    scoreOppRowModel = createModel(context, () => ScoreOppRowModel());
  }

  @override
  void dispose() {
    iconDynamicModel.dispose();
    buttonTitleExpandModel.dispose();
    scoreHealthRowModel.dispose();
    scoreOppRowModel.dispose();
  }
}
