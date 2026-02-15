import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import 'package:flutter/material.dart';
import 'score_health_icon_model.dart';
export 'score_health_icon_model.dart';

class ScoreHealthIconWidget extends StatefulWidget {
  const ScoreHealthIconWidget({
    super.key,
    int? healthScore,
    bool? isLarge,
    this.scoreTop,
    this.scoreMid,
    this.scoreLow,
    this.scoreBottom,
  })  : this.healthScore = healthScore ?? 100,
        this.isLarge = isLarge ?? false;

  final int healthScore;
  final bool isLarge;
  final int? scoreTop;
  final int? scoreMid;
  final int? scoreLow;
  final int? scoreBottom;

  @override
  State<ScoreHealthIconWidget> createState() => _ScoreHealthIconWidgetState();
}

class _ScoreHealthIconWidgetState extends State<ScoreHealthIconWidget> {
  late ScoreHealthIconModel _model;

  @override
  void setState(VoidCallback callback) {
    super.setState(callback);
    _model.onUpdate();
  }

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => ScoreHealthIconModel());

    WidgetsBinding.instance.addPostFrameCallback((_) => safeSetState(() {}));
  }

  @override
  void dispose() {
    _model.maybeDispose();

    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Icon(
      Icons.favorite_rounded,
      color: valueOrDefault<Color>(
        () {
          if (widget.healthScore >= widget.scoreTop!) {
            return valueOrDefault<Color>(
              _model.colorTop,
              FlutterFlowTheme.of(context).tertiary,
            );
          } else if (widget.healthScore >= widget.scoreMid!) {
            return valueOrDefault<Color>(
              _model.colorMid,
              Color(0x9AFF6D6D),
            );
          } else if (widget.healthScore >= widget.scoreLow!) {
            return valueOrDefault<Color>(
              _model.colorLow,
              Color(0x33FF6D6D),
            );
          } else if (widget.healthScore >= widget.scoreBottom!) {
            return valueOrDefault<Color>(
              _model.colorBottom,
              Color(0x1AFF6D6D),
            );
          } else {
            return valueOrDefault<Color>(
              _model.colorInactive,
              Color(0x10FF6D6D),
            );
          }
        }(),
        FlutterFlowTheme.of(context).tertiary,
      ),
      size: widget.isLarge == true
          ? _model.sizeIconLarge.toDouble()
          : _model.sizeIconSmall.toDouble(),
    );
  }
}
