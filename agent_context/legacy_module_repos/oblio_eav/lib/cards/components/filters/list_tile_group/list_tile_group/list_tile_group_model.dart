import '/cards/components/filters/list_tile_group/tile_group/tile_group/tile_group_widget.dart';
import '/flutter_flow/flutter_flow_util.dart';
import 'list_tile_group_widget.dart' show ListTileGroupWidget;
import 'package:flutter/material.dart';

class ListTileGroupModel extends FlutterFlowModel<ListTileGroupWidget> {
  ///  State fields for stateful widgets in this component.

  // Model for tileGroup component.
  late TileGroupModel tileGroupModel;

  @override
  void initState(BuildContext context) {
    tileGroupModel = createModel(context, () => TileGroupModel());
  }

  @override
  void dispose() {
    tileGroupModel.dispose();
  }
}
