import '/cards/components/filters/list_tile_group/tile_group/list_tiles/tiles/components/scores/score_health_icon/score_health_icon_widget.dart';
import '/flutter_flow/flutter_flow_util.dart';
import 'package:flutter/material.dart';
import 'score_health_row_model.dart';
export 'score_health_row_model.dart';

class ScoreHealthRowWidget extends StatefulWidget {
  const ScoreHealthRowWidget({
    super.key,
    int? healthScore,
    bool? isLarge,
  })  : this.healthScore = healthScore ?? 0,
        this.isLarge = isLarge ?? false;

  final int healthScore;
  final bool isLarge;

  @override
  State<ScoreHealthRowWidget> createState() => _ScoreHealthRowWidgetState();
}

class _ScoreHealthRowWidgetState extends State<ScoreHealthRowWidget> {
  late ScoreHealthRowModel _model;

  @override
  void setState(VoidCallback callback) {
    super.setState(callback);
    _model.onUpdate();
  }

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => ScoreHealthRowModel());

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
      child: Row(
        mainAxisSize: MainAxisSize.min,
        mainAxisAlignment: MainAxisAlignment.end,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          wrapWithModel(
            model: _model.scoreHealthIcon1Model,
            updateCallback: () => safeSetState(() {}),
            child: ScoreHealthIconWidget(
              healthScore: widget.healthScore,
              isLarge: widget.isLarge,
              scoreTop: 20,
              scoreMid: 15,
              scoreLow: 10,
              scoreBottom: 5,
            ),
          ),
          wrapWithModel(
            model: _model.scoreHealthIcon2Model,
            updateCallback: () => safeSetState(() {}),
            child: ScoreHealthIconWidget(
              healthScore: widget.healthScore,
              isLarge: widget.isLarge,
              scoreTop: 40,
              scoreMid: 35,
              scoreLow: 30,
              scoreBottom: 25,
            ),
          ),
          wrapWithModel(
            model: _model.scoreHealthIcon3Model,
            updateCallback: () => safeSetState(() {}),
            child: ScoreHealthIconWidget(
              healthScore: widget.healthScore,
              isLarge: widget.isLarge,
              scoreTop: 60,
              scoreMid: 55,
              scoreLow: 50,
              scoreBottom: 45,
            ),
          ),
          wrapWithModel(
            model: _model.scoreHealthIcon4Model,
            updateCallback: () => safeSetState(() {}),
            child: ScoreHealthIconWidget(
              healthScore: widget.healthScore,
              isLarge: widget.isLarge,
              scoreTop: 80,
              scoreMid: 75,
              scoreLow: 70,
              scoreBottom: 65,
            ),
          ),
          wrapWithModel(
            model: _model.scoreHealthIcon5Model,
            updateCallback: () => safeSetState(() {}),
            child: ScoreHealthIconWidget(
              healthScore: widget.healthScore,
              isLarge: widget.isLarge,
              scoreTop: 100,
              scoreMid: 95,
              scoreLow: 90,
              scoreBottom: 85,
            ),
          ),
        ],
      ),
    );
  }
}
