import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import 'package:flutter/material.dart';
import 'chart_bar_model.dart';
export 'chart_bar_model.dart';

class ChartBarWidget extends StatefulWidget {
  const ChartBarWidget({
    super.key,
    double? valueMQL,
    double? valueSQL,
    double? valueFTP,
    double? valueRTP,
  })  : this.valueMQL = valueMQL ?? 25.0,
        this.valueSQL = valueSQL ?? 25.0,
        this.valueFTP = valueFTP ?? 25.0,
        this.valueRTP = valueRTP ?? 25.0;

  final double valueMQL;
  final double valueSQL;
  final double valueFTP;
  final double valueRTP;

  @override
  State<ChartBarWidget> createState() => _ChartBarWidgetState();
}

class _ChartBarWidgetState extends State<ChartBarWidget> {
  late ChartBarModel _model;

  @override
  void setState(VoidCallback callback) {
    super.setState(callback);
    _model.onUpdate();
  }

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => ChartBarModel());

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
      width: 200.0,
      constraints: BoxConstraints(
        maxHeight: 42.0,
      ),
      decoration: BoxDecoration(),
      child: Row(
        mainAxisSize: MainAxisSize.max,
        mainAxisAlignment: MainAxisAlignment.start,
        children: [
          Container(
            width: widget.valueMQL,
            height: double.infinity,
            decoration: BoxDecoration(
              color: FlutterFlowTheme.of(context).primary,
            ),
          ),
          Container(
            width: widget.valueSQL,
            height: double.infinity,
            constraints: BoxConstraints(
              maxWidth: widget.valueMQL,
            ),
            decoration: BoxDecoration(
              color: FlutterFlowTheme.of(context).secondary,
            ),
          ),
          Container(
            width: widget.valueFTP,
            height: double.infinity,
            decoration: BoxDecoration(
              color: FlutterFlowTheme.of(context).tertiary,
            ),
          ),
          Container(
            width: widget.valueRTP,
            height: double.infinity,
            decoration: BoxDecoration(
              color: FlutterFlowTheme.of(context).alternate,
            ),
          ),
        ],
      ),
    );
  }
}
