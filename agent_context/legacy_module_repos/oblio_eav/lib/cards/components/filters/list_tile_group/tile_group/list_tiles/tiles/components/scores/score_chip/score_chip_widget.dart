import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'score_chip_model.dart';
export 'score_chip_model.dart';

class ScoreChipWidget extends StatefulWidget {
  const ScoreChipWidget({
    super.key,
    String? string,
    double? stringDouble,
    bool? isLarge,
  })  : this.string = string ?? 'OPP',
        this.stringDouble = stringDouble ?? .1,
        this.isLarge = isLarge ?? false;

  final String string;
  final double stringDouble;
  final bool isLarge;

  @override
  State<ScoreChipWidget> createState() => _ScoreChipWidgetState();
}

class _ScoreChipWidgetState extends State<ScoreChipWidget> {
  late ScoreChipModel _model;

  @override
  void setState(VoidCallback callback) {
    super.setState(callback);
    _model.onUpdate();
  }

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => ScoreChipModel());

    // On component load action.
    SchedulerBinding.instance.addPostFrameCallback((_) async {
      _model.colorChip = () {
        if (widget.string == 'MQL') {
          return Color(0x19435BD9);
        } else if (widget.string == 'SQL') {
          return Color(0x1AFDAF4C);
        } else if (widget.string == 'FTP') {
          return Color(0x1AFF4F4C);
        } else if (widget.string == 'RTP') {
          return Color(0x1909AB55);
        } else {
          return Color(0x1A5E14E8);
        }
      }();
      _model.colorText = () {
        if (widget.string == 'MQL') {
          return FlutterFlowTheme.of(context).accent1;
        } else if (widget.string == 'SQL') {
          return FlutterFlowTheme.of(context).accent2;
        } else if (widget.string == 'FTP') {
          return FlutterFlowTheme.of(context).accent3;
        } else if (widget.string == 'RTP') {
          return FlutterFlowTheme.of(context).accent4;
        } else {
          return Color(0x195E14E8);
        }
      }();
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
    return Container(
      decoration: BoxDecoration(),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            height: widget.isLarge == true
                ? _model.sizeHeightChipLarge.toDouble()
                : _model.sizeHeightChipSmall?.toDouble(),
            decoration: BoxDecoration(
              color: valueOrDefault<Color>(
                _model.colorChip,
                Color(0x195E14E8),
              ),
              borderRadius: BorderRadius.circular(16.0),
            ),
            child: Align(
              alignment: AlignmentDirectional(0.0, 0.0),
              child: Padding(
                padding: EdgeInsetsDirectional.fromSTEB(8.0, 0.0, 8.0, 0.0),
                child: Text(
                  '${valueOrDefault<String>(
                    formatNumber(
                      widget.stringDouble,
                      formatType: FormatType.percent,
                    ),
                    '.1',
                  )} ${widget.string}',
                  style: FlutterFlowTheme.of(context).bodyMedium.override(
                        fontFamily:
                            FlutterFlowTheme.of(context).bodyMediumFamily,
                        color: valueOrDefault<Color>(
                          _model.colorText,
                          FlutterFlowTheme.of(context).purple800,
                        ),
                        fontSize: widget.isLarge == true
                            ? _model.sizeTextLarge.toDouble()
                            : _model.sizeTextSmall.toDouble(),
                        letterSpacing: 0.0,
                        fontWeight: FontWeight.w500,
                        useGoogleFonts:
                            !FlutterFlowTheme.of(context).bodyMediumIsCustom,
                      ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
