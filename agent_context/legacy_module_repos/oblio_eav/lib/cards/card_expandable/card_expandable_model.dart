import '/cards/components/button_card_expand/button_card_expand_widget.dart';
import '/cards/components/card_title/card_title_widget.dart';
import '/cards/components/filters/card_filter_tabs/card_filter_tabs_widget.dart';
import '/cards/components/filters/list_tile_group/list_tile_group/list_tile_group_widget.dart';
import '/flutter_flow/flutter_flow_util.dart';
import 'card_expandable_widget.dart' show CardExpandableWidget;
import 'package:flutter/material.dart';

class CardExpandableModel extends FlutterFlowModel<CardExpandableWidget> {
  ///  Local state fields for this component.

  bool isExpanded = false;

  ///  State fields for stateful widgets in this component.

  // Model for cardTitle component.
  late CardTitleModel cardTitleModel;
  // Model for listTileGroup component.
  late ListTileGroupModel listTileGroupModel;
  // Model for cardFilterTabs component.
  late CardFilterTabsModel cardFilterTabsModel;
  // Model for buttonCardExpand component.
  late ButtonCardExpandModel buttonCardExpandModel;

  @override
  void initState(BuildContext context) {
    cardTitleModel = createModel(context, () => CardTitleModel());
    listTileGroupModel = createModel(context, () => ListTileGroupModel());
    cardFilterTabsModel = createModel(context, () => CardFilterTabsModel());
    buttonCardExpandModel = createModel(context, () => ButtonCardExpandModel());
  }

  @override
  void dispose() {
    cardTitleModel.dispose();
    listTileGroupModel.dispose();
    cardFilterTabsModel.dispose();
    buttonCardExpandModel.dispose();
  }
}
