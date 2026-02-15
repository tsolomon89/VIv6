import '/cards/components/filter_chips/filter_chips_widget.dart';
import '/cards/components/filters/list_tile_group/tile_group/tile_group/tile_group_widget.dart';
import '/flutter_flow/flutter_flow_util.dart';
import 'card_list_filter_chips_widget.dart' show CardListFilterChipsWidget;
import 'package:flutter/material.dart';

class CardListFilterChipsModel
    extends FlutterFlowModel<CardListFilterChipsWidget> {
  ///  State fields for stateful widgets in this component.

  // Model for filterChips component.
  late FilterChipsModel filterChipsModel;
  // Model for tileGroup component.
  late TileGroupModel tileGroupModel;

  @override
  void initState(BuildContext context) {
    filterChipsModel = createModel(context, () => FilterChipsModel());
    tileGroupModel = createModel(context, () => TileGroupModel());
  }

  @override
  void dispose() {
    filterChipsModel.dispose();
    tileGroupModel.dispose();
  }
}
