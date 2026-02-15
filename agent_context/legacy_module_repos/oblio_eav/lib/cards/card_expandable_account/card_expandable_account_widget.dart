import '/cards/components/button_card_expand/button_card_expand_widget.dart';
import '/cards/components/card_title/card_title_widget.dart';
import '/cards/components/filters/card_list_filter_chips/card_list_filter_chips_widget.dart';
import '/cards/components/filters/list_tile_group/tile_group/list_tiles/tiles/tile_dynamic/tile_dynamic_widget.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'card_expandable_account_model.dart';
export 'card_expandable_account_model.dart';

class CardExpandableAccountWidget extends StatefulWidget {
  const CardExpandableAccountWidget({super.key});

  @override
  State<CardExpandableAccountWidget> createState() =>
      _CardExpandableAccountWidgetState();
}

class _CardExpandableAccountWidgetState
    extends State<CardExpandableAccountWidget> {
  late CardExpandableAccountModel _model;

  @override
  void setState(VoidCallback callback) {
    super.setState(callback);
    _model.onUpdate();
  }

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => CardExpandableAccountModel());

    // On component load action.
    SchedulerBinding.instance.addPostFrameCallback((_) async {
      _model.isExpanded = false;
      safeSetState(() {});
    });

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
      duration: Duration(milliseconds: 400),
      curve: Curves.easeInOut,
      constraints: BoxConstraints(
        minWidth: 357.0,
        maxWidth: 457.0,
        maxHeight: 900.0,
      ),
      decoration: BoxDecoration(),
      child: Card(
        clipBehavior: Clip.antiAliasWithSaveLayer,
        color: FlutterFlowTheme.of(context).foreground,
        elevation: 4.0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8.0),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            wrapWithModel(
              model: _model.cardTitleModel,
              updateCallback: () => safeSetState(() {}),
              child: CardTitleWidget(),
            ),
            wrapWithModel(
              model: _model.tileDynamicModel,
              updateCallback: () => safeSetState(() {}),
              child: TileDynamicWidget(
                typeLeading: 'above',
                leadingVisible: true,
                isExpandable: true,
              ),
            ),
            if (_model.isExpanded == true)
              Expanded(
                child: Align(
                  alignment: AlignmentDirectional(0.0, -1.0),
                  child: wrapWithModel(
                    model: _model.cardListFilterChipsModel,
                    updateCallback: () => safeSetState(() {}),
                    child: CardListFilterChipsWidget(),
                  ),
                ),
              ),
            InkWell(
              splashColor: Colors.transparent,
              focusColor: Colors.transparent,
              hoverColor: Colors.transparent,
              highlightColor: Colors.transparent,
              onTap: () async {
                _model.isExpanded = !_model.isExpanded;
                safeSetState(() {});
              },
              child: wrapWithModel(
                model: _model.buttonCardExpandModel,
                updateCallback: () => safeSetState(() {}),
                updateOnChange: true,
                child: ButtonCardExpandWidget(
                  isExpanded: _model.isExpanded == true,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
