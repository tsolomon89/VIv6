import '/cards/components/button_card_expand/button_card_expand_widget.dart';
import '/cards/components/card_title/card_title_widget.dart';
import '/cards/components/charts/score_opp_goals/score_opp_goals_widget.dart';
import '/cards/components/filters/card_list_filter_chips/card_list_filter_chips_widget.dart';
import '/cards/components/filters/list_tile_group/list_tile_group/list_tile_group_widget.dart';
import '/cards/components/filters/list_tile_group/tile_group/list_tiles/tiles/tile_dynamic/tile_dynamic_widget.dart';
import '/flutter_flow/flutter_flow_util.dart';
import 'card_dynamic_widget.dart' show CardDynamicWidget;
import 'package:flutter/material.dart';

class CardDynamicModel extends FlutterFlowModel<CardDynamicWidget> {
  ///  Local state fields for this component.

  bool isExpanded = false;

  String cardTitle = 'CARD TITLE';

  ///  State fields for stateful widgets in this component.

  // Model for cardTitle component.
  late CardTitleModel cardTitleModel;
  // Model for listTileGroup component.
  late ListTileGroupModel listTileGroupModel;
  // Model for scoreOppGoals component.
  late ScoreOppGoalsModel scoreOppGoalsModel;
  // Model for tileDynamic component.
  late TileDynamicModel tileDynamicModel;
  // Model for cardListFilterChips component.
  late CardListFilterChipsModel cardListFilterChipsModel;
  // Model for buttonCardExpand component.
  late ButtonCardExpandModel buttonCardExpandModel;

  @override
  void initState(BuildContext context) {
    cardTitleModel = createModel(context, () => CardTitleModel());
    listTileGroupModel = createModel(context, () => ListTileGroupModel());
    scoreOppGoalsModel = createModel(context, () => ScoreOppGoalsModel());
    tileDynamicModel = createModel(context, () => TileDynamicModel());
    cardListFilterChipsModel =
        createModel(context, () => CardListFilterChipsModel());
    buttonCardExpandModel = createModel(context, () => ButtonCardExpandModel());
  }

  @override
  void dispose() {
    cardTitleModel.dispose();
    listTileGroupModel.dispose();
    scoreOppGoalsModel.dispose();
    tileDynamicModel.dispose();
    cardListFilterChipsModel.dispose();
    buttonCardExpandModel.dispose();
  }
}
