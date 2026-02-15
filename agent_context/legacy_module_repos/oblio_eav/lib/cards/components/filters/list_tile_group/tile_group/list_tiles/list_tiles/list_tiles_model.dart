import '/cards/components/filters/list_tile_group/tile_group/list_tiles/tiles/tile_dynamic/tile_dynamic_widget.dart';
import '/flutter_flow/flutter_flow_util.dart';
import 'list_tiles_widget.dart' show ListTilesWidget;
import 'package:flutter/material.dart';

class ListTilesModel extends FlutterFlowModel<ListTilesWidget> {
  ///  State fields for stateful widgets in this component.

  // Model for tileDynamic component.
  late TileDynamicModel tileDynamicModel;

  @override
  void initState(BuildContext context) {
    tileDynamicModel = createModel(context, () => TileDynamicModel());
  }

  @override
  void dispose() {
    tileDynamicModel.dispose();
  }
}
