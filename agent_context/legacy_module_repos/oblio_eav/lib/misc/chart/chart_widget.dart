import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/misc/chart_bar/chart_bar_widget.dart';
import '/flutter_flow/random_data_util.dart' as random_data;
import 'package:flutter/material.dart';
import 'chart_model.dart';
export 'chart_model.dart';

class ChartWidget extends StatefulWidget {
  const ChartWidget({super.key});

  @override
  State<ChartWidget> createState() => _ChartWidgetState();
}

class _ChartWidgetState extends State<ChartWidget> {
  late ChartModel _model;

  @override
  void setState(VoidCallback callback) {
    super.setState(callback);
    _model.onUpdate();
  }

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => ChartModel());

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
      constraints: BoxConstraints(
        maxWidth: 200.0,
      ),
      decoration: BoxDecoration(
        color: FlutterFlowTheme.of(context).secondaryBackground,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Expanded(
            child: ListView(
              padding: EdgeInsets.zero,
              shrinkWrap: true,
              scrollDirection: Axis.vertical,
              children: [
                wrapWithModel(
                  model: _model.chartBarModel1,
                  updateCallback: () => safeSetState(() {}),
                  child: ChartBarWidget(
                    valueMQL: random_data.randomInteger(0, 50).toDouble(),
                    valueSQL: 13.0,
                    valueFTP: 43.0,
                    valueRTP: 40.0,
                  ),
                ),
                wrapWithModel(
                  model: _model.chartBarModel2,
                  updateCallback: () => safeSetState(() {}),
                  child: ChartBarWidget(),
                ),
                wrapWithModel(
                  model: _model.chartBarModel3,
                  updateCallback: () => safeSetState(() {}),
                  child: ChartBarWidget(),
                ),
              ].divide(SizedBox(height: 16.0)),
            ),
          ),
        ],
      ),
    );
  }
}
