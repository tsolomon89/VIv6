import '/cards/components/button_card_expand/button_card_expand_widget.dart';
import '/cards/components/card_title/card_title_widget.dart';
import '/cards/components/charts/score_opp_goals/score_opp_goals_widget.dart';
import '/cards/components/filters/card_list_filter_chips/card_list_filter_chips_widget.dart';
import '/flutter_flow/flutter_flow_util.dart';
import 'card_expandable_pipelines_widget.dart'
    show CardExpandablePipelinesWidget;
import 'package:flutter/material.dart';

class CardExpandablePipelinesModel
    extends FlutterFlowModel<CardExpandablePipelinesWidget> {
  ///  Local state fields for this component.

  bool isExpanded = false;

  ///  State fields for stateful widgets in this component.

  // Model for cardTitle component.
  late CardTitleModel cardTitleModel;
  // Model for scoreOppGoals component.
  late ScoreOppGoalsModel scoreOppGoalsModel;
  // Model for cardListFilterChips component.
  late CardListFilterChipsModel cardListFilterChipsModel;
  // Model for buttonCardExpand component.
  late ButtonCardExpandModel buttonCardExpandModel;

  @override
  void initState(BuildContext context) {
    cardTitleModel = createModel(context, () => CardTitleModel());
    scoreOppGoalsModel = createModel(context, () => ScoreOppGoalsModel());
    cardListFilterChipsModel =
        createModel(context, () => CardListFilterChipsModel());
    buttonCardExpandModel = createModel(context, () => ButtonCardExpandModel());
  }

  @override
  void dispose() {
    cardTitleModel.dispose();
    scoreOppGoalsModel.dispose();
    cardListFilterChipsModel.dispose();
    buttonCardExpandModel.dispose();
  }
}
