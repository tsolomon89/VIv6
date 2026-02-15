import '/cards/components/button_card_expand/button_card_expand_widget.dart';
import '/cards/components/card_title/card_title_widget.dart';
import '/cards/components/filter_chips/filter_chips_widget.dart';
import '/cards/components/filters/list_tile_group/tile_group/list_tiles/tiles/components/t_ile_double_line/t_ile_double_line_widget.dart';
import '/flutter_flow/flutter_flow_util.dart';
import 'card_expandable_campaigns_widget.dart'
    show CardExpandableCampaignsWidget;
import 'package:flutter/material.dart';

class CardExpandableCampaignsModel
    extends FlutterFlowModel<CardExpandableCampaignsWidget> {
  ///  Local state fields for this component.

  bool isExpanded = false;

  ///  State fields for stateful widgets in this component.

  // Model for cardTitle component.
  late CardTitleModel cardTitleModel;
  // Model for tIleDoubleLine component.
  late TIleDoubleLineModel tIleDoubleLineModel1;
  // Model for tIleDoubleLine component.
  late TIleDoubleLineModel tIleDoubleLineModel2;
  // Model for tIleDoubleLine component.
  late TIleDoubleLineModel tIleDoubleLineModel3;
  // Model for tIleDoubleLine component.
  late TIleDoubleLineModel tIleDoubleLineModel4;
  // Model for filterChips component.
  late FilterChipsModel filterChipsModel;
  // Model for tIleDoubleLine component.
  late TIleDoubleLineModel tIleDoubleLineModel5;
  // Model for tIleDoubleLine component.
  late TIleDoubleLineModel tIleDoubleLineModel6;
  // Model for tIleDoubleLine component.
  late TIleDoubleLineModel tIleDoubleLineModel7;
  // Model for tIleDoubleLine component.
  late TIleDoubleLineModel tIleDoubleLineModel8;
  // Model for tIleDoubleLine component.
  late TIleDoubleLineModel tIleDoubleLineModel9;
  // Model for tIleDoubleLine component.
  late TIleDoubleLineModel tIleDoubleLineModel10;
  // Model for tIleDoubleLine component.
  late TIleDoubleLineModel tIleDoubleLineModel11;
  // Model for tIleDoubleLine component.
  late TIleDoubleLineModel tIleDoubleLineModel12;
  // Model for tIleDoubleLine component.
  late TIleDoubleLineModel tIleDoubleLineModel13;
  // Model for tIleDoubleLine component.
  late TIleDoubleLineModel tIleDoubleLineModel14;
  // Model for tIleDoubleLine component.
  late TIleDoubleLineModel tIleDoubleLineModel15;
  // Model for tIleDoubleLine component.
  late TIleDoubleLineModel tIleDoubleLineModel16;
  // Model for buttonCardExpand component.
  late ButtonCardExpandModel buttonCardExpandModel;

  @override
  void initState(BuildContext context) {
    cardTitleModel = createModel(context, () => CardTitleModel());
    tIleDoubleLineModel1 = createModel(context, () => TIleDoubleLineModel());
    tIleDoubleLineModel2 = createModel(context, () => TIleDoubleLineModel());
    tIleDoubleLineModel3 = createModel(context, () => TIleDoubleLineModel());
    tIleDoubleLineModel4 = createModel(context, () => TIleDoubleLineModel());
    filterChipsModel = createModel(context, () => FilterChipsModel());
    tIleDoubleLineModel5 = createModel(context, () => TIleDoubleLineModel());
    tIleDoubleLineModel6 = createModel(context, () => TIleDoubleLineModel());
    tIleDoubleLineModel7 = createModel(context, () => TIleDoubleLineModel());
    tIleDoubleLineModel8 = createModel(context, () => TIleDoubleLineModel());
    tIleDoubleLineModel9 = createModel(context, () => TIleDoubleLineModel());
    tIleDoubleLineModel10 = createModel(context, () => TIleDoubleLineModel());
    tIleDoubleLineModel11 = createModel(context, () => TIleDoubleLineModel());
    tIleDoubleLineModel12 = createModel(context, () => TIleDoubleLineModel());
    tIleDoubleLineModel13 = createModel(context, () => TIleDoubleLineModel());
    tIleDoubleLineModel14 = createModel(context, () => TIleDoubleLineModel());
    tIleDoubleLineModel15 = createModel(context, () => TIleDoubleLineModel());
    tIleDoubleLineModel16 = createModel(context, () => TIleDoubleLineModel());
    buttonCardExpandModel = createModel(context, () => ButtonCardExpandModel());
  }

  @override
  void dispose() {
    cardTitleModel.dispose();
    tIleDoubleLineModel1.dispose();
    tIleDoubleLineModel2.dispose();
    tIleDoubleLineModel3.dispose();
    tIleDoubleLineModel4.dispose();
    filterChipsModel.dispose();
    tIleDoubleLineModel5.dispose();
    tIleDoubleLineModel6.dispose();
    tIleDoubleLineModel7.dispose();
    tIleDoubleLineModel8.dispose();
    tIleDoubleLineModel9.dispose();
    tIleDoubleLineModel10.dispose();
    tIleDoubleLineModel11.dispose();
    tIleDoubleLineModel12.dispose();
    tIleDoubleLineModel13.dispose();
    tIleDoubleLineModel14.dispose();
    tIleDoubleLineModel15.dispose();
    tIleDoubleLineModel16.dispose();
    buttonCardExpandModel.dispose();
  }
}
