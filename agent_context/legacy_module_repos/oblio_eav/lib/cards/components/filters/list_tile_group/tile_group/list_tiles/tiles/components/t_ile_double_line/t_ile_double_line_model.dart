import '/cards/components/filters/list_tile_group/tile_group/list_tiles/tiles/components/icon_dynamic/icon_dynamic_widget.dart';
import '/flutter_flow/flutter_flow_util.dart';
import 't_ile_double_line_widget.dart' show TIleDoubleLineWidget;
import 'package:flutter/material.dart';

class TIleDoubleLineModel extends FlutterFlowModel<TIleDoubleLineWidget> {
  ///  State fields for stateful widgets in this component.

  // Model for iconDynamic component.
  late IconDynamicModel iconDynamicModel;

  @override
  void initState(BuildContext context) {
    iconDynamicModel = createModel(context, () => IconDynamicModel());
  }

  @override
  void dispose() {
    iconDynamicModel.dispose();
  }
}
