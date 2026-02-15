import '/cards/components/filters/list_tile_group/tile_group/tile_group/tile_group_widget.dart';
import '/flutter_flow/flutter_flow_util.dart';
import 'package:flutter/material.dart';
import 'list_tile_group_child_model.dart';
export 'list_tile_group_child_model.dart';

class ListTileGroupChildWidget extends StatefulWidget {
  const ListTileGroupChildWidget({super.key});

  @override
  State<ListTileGroupChildWidget> createState() =>
      _ListTileGroupChildWidgetState();
}

class _ListTileGroupChildWidgetState extends State<ListTileGroupChildWidget> {
  late ListTileGroupChildModel _model;

  @override
  void setState(VoidCallback callback) {
    super.setState(callback);
    _model.onUpdate();
  }

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => ListTileGroupChildModel());

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
