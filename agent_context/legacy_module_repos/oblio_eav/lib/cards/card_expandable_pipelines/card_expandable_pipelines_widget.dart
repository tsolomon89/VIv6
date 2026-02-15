import '/cards/components/button_card_expand/button_card_expand_widget.dart';
import '/cards/components/card_title/card_title_widget.dart';
import '/cards/components/charts/score_opp_goals/score_opp_goals_widget.dart';
import '/cards/components/filters/card_list_filter_chips/card_list_filter_chips_widget.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/random_data_util.dart' as random_data;
import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'card_expandable_pipelines_model.dart';
export 'card_expandable_pipelines_model.dart';

class CardExpandablePipelinesWidget extends StatefulWidget {
  const CardExpandablePipelinesWidget({super.key});

  @override
  State<CardExpandablePipelinesWidget> createState() =>
      _CardExpandablePipelinesWidgetState();
}

class _CardExpandablePipelinesWidgetState
    extends State<CardExpandablePipelinesWidget> {
  late CardExpandablePipelinesModel _model;

  @override
  void setState(VoidCallback callback) {
    super.setState(callback);
    _model.onUpdate();
  }

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => CardExpandablePipelinesModel());

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
              model: _model.scoreOppGoalsModel,
              updateCallback: () => safeSetState(() {}),
              child: ScoreOppGoalsWidget(
                valuteMQL: random_data.randomDouble(0.0, 1.0),
                valueSQL: random_data.randomDouble(0.0, 1.0),
                valueFTP: random_data.randomDouble(0.0, 1.0),
                valueRTP: random_data.randomDouble(0.0, 1.0),
              ),
            ),
            if (_model.isExpanded == true)
              Expanded(
                child: Align(
                  alignment: AlignmentDirectional(0.0, -1.0),
                  child: wrapWithModel(
                    model: _model.cardListFilterChipsModel,
                    updateCallback: () => safeSetState(() {}),
                    updateOnChange: true,
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
