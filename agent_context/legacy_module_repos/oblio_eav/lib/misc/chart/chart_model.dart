import '/flutter_flow/flutter_flow_util.dart';
import '/misc/chart_bar/chart_bar_widget.dart';
import 'chart_widget.dart' show ChartWidget;
import 'package:flutter/material.dart';

class ChartModel extends FlutterFlowModel<ChartWidget> {
  ///  State fields for stateful widgets in this component.

  // Model for chartBar component.
  late ChartBarModel chartBarModel1;
  // Model for chartBar component.
  late ChartBarModel chartBarModel2;
  // Model for chartBar component.
  late ChartBarModel chartBarModel3;

  @override
  void initState(BuildContext context) {
    chartBarModel1 = createModel(context, () => ChartBarModel());
    chartBarModel2 = createModel(context, () => ChartBarModel());
    chartBarModel3 = createModel(context, () => ChartBarModel());
  }

  @override
  void dispose() {
    chartBarModel1.dispose();
    chartBarModel2.dispose();
    chartBarModel3.dispose();
  }
}
