import '/cards/components/filters/list_tile_group/tile_group/list_tiles/tiles/components/scores/score_chip/score_chip_widget.dart';
import '/flutter_flow/flutter_flow_util.dart';
import 'package:flutter/material.dart';
import 'score_opp_row_model.dart';
export 'score_opp_row_model.dart';

class ScoreOppRowWidget extends StatefulWidget {
  const ScoreOppRowWidget({
    super.key,
    bool? isLarge,
    this.lable1,
    this.value1,
    this.lable2,
    this.value2,
    this.lable3,
    this.value3,
    this.lable4,
    this.value4,
  }) : this.isLarge = isLarge ?? false;

  final bool isLarge;
  final String? lable1;
  final double? value1;
  final String? lable2;
  final double? value2;
  final String? lable3;
  final double? value3;
  final String? lable4;
  final double? value4;

  @override
  State<ScoreOppRowWidget> createState() => _ScoreOppRowWidgetState();
}

class _ScoreOppRowWidgetState extends State<ScoreOppRowWidget> {
  late ScoreOppRowModel _model;

  @override
  void setState(VoidCallback callback) {
    super.setState(callback);
    _model.onUpdate();
  }

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => ScoreOppRowModel());

    WidgetsBinding.instance.addPostFrameCallback((_) => safeSetState(() {}));
  }

  @override
  void dispose() {
    _model.maybeDispose();

    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        wrapWithModel(
          model: _model.scoreChipModel1,
          updateCallback: () => safeSetState(() {}),
          updateOnChange: true,
          child: ScoreChipWidget(
            string: widget.lable1!,
            stringDouble: widget.value1,
            isLarge: widget.isLarge,
          ),
        ),
        wrapWithModel(
          model: _model.scoreChipModel2,
          updateCallback: () => safeSetState(() {}),
          updateOnChange: true,
          child: ScoreChipWidget(
            string: widget.lable2!,
            stringDouble: widget.value2,
            isLarge: widget.isLarge,
          ),
        ),
        wrapWithModel(
          model: _model.scoreChipModel3,
          updateCallback: () => safeSetState(() {}),
          updateOnChange: true,
          child: ScoreChipWidget(
            string: widget.lable3!,
            stringDouble: widget.value3,
            isLarge: widget.isLarge,
          ),
        ),
        wrapWithModel(
          model: _model.scoreChipModel4,
          updateCallback: () => safeSetState(() {}),
          updateOnChange: true,
          child: ScoreChipWidget(
            string: widget.lable4!,
            stringDouble: widget.value4,
            isLarge: widget.isLarge,
          ),
        ),
      ].divide(SizedBox(width: 8.0)),
    );
  }
}
