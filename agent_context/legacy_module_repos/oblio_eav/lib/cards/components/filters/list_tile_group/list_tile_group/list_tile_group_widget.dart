import '/cards/components/filters/list_tile_group/tile_group/tile_group/tile_group_widget.dart';
import '/flutter_flow/flutter_flow_util.dart';
import 'package:flutter/material.dart';
import 'list_tile_group_model.dart';
export 'list_tile_group_model.dart';

class ListTileGroupWidget extends StatefulWidget {
  const ListTileGroupWidget({super.key});

  @override
  State<ListTileGroupWidget> createState() => _ListTileGroupWidgetState();
}

class _ListTileGroupWidgetState extends State<ListTileGroupWidget> {
  late ListTileGroupModel _model;

  @override
  void setState(VoidCallback callback) {
    super.setState(callback);
    _model.onUpdate();
  }

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => ListTileGroupModel());

    WidgetsBinding.instance.addPostFrameCallback((_) => safeSetState(() {}));
  }

  @override
  void dispose() {
    _model.maybeDispose();

    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedContainer(
      duration: Duration(milliseconds: 800),
      curve: Curves.easeInOut,
      constraints: BoxConstraints(
        maxHeight: 5000.0,
      ),
      decoration: BoxDecoration(),
      child: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            wrapWithModel(
              model: _model.tileGroupModel,
              updateCallback: () => safeSetState(() {}),
              child: TileGroupWidget(),
            ),
          ],
        ),
      ),
    );
  }
}
