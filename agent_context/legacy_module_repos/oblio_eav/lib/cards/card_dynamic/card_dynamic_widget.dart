import '/backend/schema/structs/index.dart';
import '/cards/components/button_card_expand/button_card_expand_widget.dart';
import '/cards/components/card_title/card_title_widget.dart';
import '/cards/components/charts/score_opp_goals/score_opp_goals_widget.dart';
import '/cards/components/filters/card_list_filter_chips/card_list_filter_chips_widget.dart';
import '/cards/components/filters/list_tile_group/list_tile_group/list_tile_group_widget.dart';
import '/cards/components/filters/list_tile_group/tile_group/list_tiles/tiles/tile_dynamic/tile_dynamic_widget.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/custom_functions.dart' as functions;
import '/flutter_flow/random_data_util.dart' as random_data;
import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'card_dynamic_model.dart';
export 'card_dynamic_model.dart';

class CardDynamicWidget extends StatefulWidget {
  const CardDynamicWidget({
    super.key,
    bool? isExpandable,
    this.dataObject,
    this.dataFieldGroup,
  }) : this.isExpandable = isExpandable ?? true;

  final bool isExpandable;
  final ObjectStruct? dataObject;
  final FieldGroupStruct? dataFieldGroup;

  @override
  State<CardDynamicWidget> createState() => _CardDynamicWidgetState();
}

class _CardDynamicWidgetState extends State<CardDynamicWidget> {
  late CardDynamicModel _model;

  @override
  void setState(VoidCallback callback) {
    super.setState(callback);
    _model.onUpdate();
  }

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => CardDynamicModel());

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
        maxHeight: 636.0,
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
              child: CardTitleWidget(
                cardTitle: functions.stringToUpperCase(
                    '${widget.dataObject?.typeObject}Title'),
              ),
            ),
            Container(
              decoration: BoxDecoration(),
              child: Column(
                mainAxisSize: MainAxisSize.max,
                children: [
                  wrapWithModel(
                    model: _model.listTileGroupModel,
                    updateCallback: () => safeSetState(() {}),
                    child: ListTileGroupWidget(),
                  ),
                  wrapWithModel(
                    model: _model.scoreOppGoalsModel,
                    updateCallback: () => safeSetState(() {}),
                    child: ScoreOppGoalsWidget(
                      valuteMQL: random_data.randomDouble(0.0, 1.0),
                      valueSQL: random_data.randomDouble(0.0, 1.0),
                      valueFTP: random_data.randomDouble(0.0, 1.0),
                      valueRTP: random_data.randomDouble(0.0, 1.0),
                    ),
                  ),
                  wrapWithModel(
                    model: _model.tileDynamicModel,
                    updateCallback: () => safeSetState(() {}),
                    child: TileDynamicWidget(
                      leadingVisible: false,
                      isExpandable: false,
                    ),
                  ),
                ],
              ),
            ),
            if (_model.isExpanded == true)
              Expanded(
                child: Align(
                  alignment: AlignmentDirectional(0.0, -1.0),
                  child: Container(
                    decoration: BoxDecoration(),
                    child: Column(
                      mainAxisSize: MainAxisSize.max,
                      children: [
                        wrapWithModel(
                          model: _model.cardListFilterChipsModel,
                          updateCallback: () => safeSetState(() {}),
                          updateOnChange: true,
                          child: CardListFilterChipsWidget(),
                        ),
                      ],
                    ),
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
