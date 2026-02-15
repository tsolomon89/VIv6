import '/cards/components/button_card_expand/button_card_expand_widget.dart';
import '/cards/components/card_title/card_title_widget.dart';
import '/cards/components/filters/card_filter_tabs/card_filter_tabs_widget.dart';
import '/cards/components/filters/list_tile_group/list_tile_group/list_tile_group_widget.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'card_expandable_model.dart';
export 'card_expandable_model.dart';

class CardExpandableWidget extends StatefulWidget {
  const CardExpandableWidget({super.key});

  @override
  State<CardExpandableWidget> createState() => _CardExpandableWidgetState();
}

class _CardExpandableWidgetState extends State<CardExpandableWidget> {
  late CardExpandableModel _model;

  @override
  void setState(VoidCallback callback) {
    super.setState(callback);
    _model.onUpdate();
  }

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => CardExpandableModel());

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
            Container(
              width: double.infinity,
              decoration: BoxDecoration(),
              child: Column(
                mainAxisSize: MainAxisSize.max,
                children: [
                  wrapWithModel(
                    model: _model.cardTitleModel,
                    updateCallback: () => safeSetState(() {}),
                    child: CardTitleWidget(),
                  ),
                  wrapWithModel(
                    model: _model.listTileGroupModel,
                    updateCallback: () => safeSetState(() {}),
                    child: ListTileGroupWidget(),
                  ),
                ],
              ),
            ),
            if (_model.isExpanded == true)
              Expanded(
                child: wrapWithModel(
                  model: _model.cardFilterTabsModel,
                  updateCallback: () => safeSetState(() {}),
                  child: CardFilterTabsWidget(
                    parameter1: _model.isExpanded,
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
                  isExpanded: _model.isExpanded,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
