import '/backend/schema/structs/index.dart';
import '/cards/components/filters/list_tile_group/tile_group/list_tiles/list_tiles/list_tiles_widget.dart';
import '/components/label_relation_group_widget.dart';
import '/flutter_flow/flutter_flow_util.dart';
import 'package:flutter/material.dart';
import 'tile_group_model.dart';
export 'tile_group_model.dart';

class TileGroupWidget extends StatefulWidget {
  const TileGroupWidget({
    super.key,
    String? nameField,
    this.listTiles,
  }) : this.nameField = nameField ?? 'Group Name';

  final String nameField;
  final List<ObjectStruct>? listTiles;

  @override
  State<TileGroupWidget> createState() => _TileGroupWidgetState();
}

class _TileGroupWidgetState extends State<TileGroupWidget> {
  late TileGroupModel _model;

  @override
  void setState(VoidCallback callback) {
    super.setState(callback);
    _model.onUpdate();
  }

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => TileGroupModel());

    WidgetsBinding.instance.addPostFrameCallback((_) => safeSetState(() {}));
  }

  @override
  void dispose() {
    _model.maybeDispose();

    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          wrapWithModel(
            model: _model.labelRelationGroupModel,
            updateCallback: () => safeSetState(() {}),
            child: LabelRelationGroupWidget(),
          ),
          wrapWithModel(
            model: _model.listTilesModel,
            updateCallback: () => safeSetState(() {}),
            child: ListTilesWidget(),
          ),
        ],
      ),
    );
  }
}
