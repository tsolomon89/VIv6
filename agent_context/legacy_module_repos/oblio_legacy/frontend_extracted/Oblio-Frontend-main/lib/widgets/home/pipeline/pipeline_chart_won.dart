import 'package:flutter/material.dart';
import 'package:hexcolor/hexcolor.dart';
import 'package:oblio/widgets/home/pipeline/bottom_legend.dart';
import 'package:oblio/widgets/home/pipeline/top_legend.dart';
import 'package:syncfusion_flutter_charts/charts.dart';

import '../../../widget_shadow.dart';

class _ChartData {
  String stage;
  double percent;
  HexColor color;

  _ChartData(this.stage, this.percent, this.color);
}

class PipelineChartWon extends StatelessWidget {
  const PipelineChartWon({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final List<_ChartData> chartData = <_ChartData>[
      _ChartData('RET', 20, HexColor('#34CA87')),
      _ChartData('CUS', 90, HexColor('#FF8787')),
      _ChartData('SQL', 10, HexColor('#FDC16D')),
      _ChartData('MQL', 30, HexColor('#778CE8')),
    ]; // Data source for circular chart

    return Stack(
      children: [
        Center(
          child: RotatedBox(
            quarterTurns: -1,
            child: WidgetShadow(
              blurRad: 1.5,
              borderRad: 2.5,
              spread: 1.0,
              opacity: 0.5,
              childOffset: Offset(0, 2.0),
              child: Container(
                height: 350,
                child: SfCircularChart(
                  //tooltipBehavior: TooltipBehavior(enable: true, duration: 2000),
                  series: <CircularSeries>[
                    RadialBarSeries<_ChartData, String>(
                        dataSource: chartData,
                        enableTooltip: true,
                        radius: '110%',
                        animationDuration: 800.0,
                        innerRadius: '10%',
                        gap: '5%',
                        xValueMapper: (data, _) => data.stage,
                        yValueMapper: (data, _) => data.percent,
                        cornerStyle: CornerStyle.bothCurve,
                        trackBorderWidth: 20,
                        maximumValue: 100,
                        useSeriesColor: true,
                        trackOpacity: 0.1,
                        pointColorMapper: (_ChartData data, _) => data.color)
                  ],
                ),
              ),
            ),
          ),
        ),
        Container(child: PipelineTopLegend()),
        Padding(
          padding: EdgeInsets.only(top: 290),
          child: PipelineBottomLegend(),
        ),
      ],
    );
  }
}
