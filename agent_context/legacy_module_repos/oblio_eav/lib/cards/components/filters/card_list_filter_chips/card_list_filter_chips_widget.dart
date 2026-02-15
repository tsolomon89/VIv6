import '/cards/components/filter_chips/filter_chips_widget.dart';
import '/cards/components/filters/list_tile_group/tile_group/tile_group/tile_group_widget.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import 'package:flutter/material.dart';
import 'card_list_filter_chips_model.dart';
export 'card_list_filter_chips_model.dart';

class CardListFilterChipsWidget extends StatefulWidget {
  const CardListFilterChipsWidget({super.key});

  @override
  State<CardListFilterChipsWidget> createState() =>
      _CardListFilterChipsWidgetState();
}

class _CardListFilterChipsWidgetState extends State<CardListFilterChipsWidget> {
  late CardListFilterChipsModel _model;

  @override
  void setState(VoidCallback callback) {
    super.setState(callback);
    _model.onUpdate();
  }

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => CardListFilterChipsModel());

    WidgetsBinding.instance.addPostFrameCallback((_) => safeSetState(() {}));
  }

  @override
  void dispose() {
    _model.maybeDispose();

    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: AlignmentDirectional(0.0, -1.0),
      child: AnimatedContainer(
        duration: Duration(milliseconds: 220),
        curve: Curves.easeInOut,
        width: double.infinity,
        constraints: BoxConstraints(
          maxHeight: 420.0,
        ),
        decoration: BoxDecoration(
          color: FlutterFlowTheme.of(context).foreground,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.max,
          children: [
            wrapWithModel(
              model: _model.filterChipsModel,
              updateCallback: () => safeSetState(() {}),
              child: FilterChipsWidget(),
            ),
            Expanded(
              child: wrapWithModel(
                model: _model.tileGroupModel,
                updateCallback: () => safeSetState(() {}),
                child: TileGroupWidget(),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
