import '/cards/components/filters/list_tile_group/tile_group/list_tiles/list_tiles/list_tiles_widget.dart';
import '/components/label_relation_group_widget.dart';
import '/flutter_flow/flutter_flow_util.dart';
import 'tile_group_widget.dart' show TileGroupWidget;
import 'package:flutter/material.dart';

class TileGroupModel extends FlutterFlowModel<TileGroupWidget> {
  ///  State fields for stateful widgets in this component.

  // Model for labelRelationGroup component.
  late LabelRelationGroupModel labelRelationGroupModel;
  // Model for listTiles component.
  late ListTilesModel listTilesModel;

  @override
  void initState(BuildContext context) {
    labelRelationGroupModel =
        createModel(context, () => LabelRelationGroupModel());
    listTilesModel = createModel(context, () => ListTilesModel());
  }

  @override
  void dispose() {
    labelRelationGroupModel.dispose();
    listTilesModel.dispose();
  }
}
