import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:hexcolor/hexcolor.dart';
import 'package:oblio/widgets/home/home.dart';
import 'package:syncfusion_flutter_charts/charts.dart';

import '../common/long-card.dart';
import '../common/row_wrapper.dart';
import '../common/wrapper.dart';

class WinsData {
  WinsData(
    this.week,
    this.res,
    this.cus,
    this.sql,
    this.mql,
  );
  final String week;
  final int res;
  final int cus;
  final int sql;
  final int mql;
}

class WinsChart extends StatefulWidget {
  const WinsChart({Key? key, required this.expanded}) : super(key: key);

  final bool expanded;

  @override
  _WinsChartState createState() => _WinsChartState();
}

class _WinsChartState extends State<WinsChart> {
  late List<WinsData> _chartData;
  late List<WinsData> _chartData2;

  List<WinsData> getChartData() {
    final List<WinsData> chartData = [
      WinsData('Week 4', 8, 12, 6, 14),
      WinsData('Week 3', 5, 8, 10, 7),
      WinsData('Week 2', 9, 13, 7, 14),
      WinsData('Week 1', 10, 10, 10, 10),
    ];
    return chartData;
  }

  List<WinsData> getChartData2() {
    final List<WinsData> chartData2 = [
      WinsData('Week 9', 8, 12, 6, 14),
      WinsData('Week 8', 8, 12, 6, 14),
      WinsData('Week 7', 5, 8, 10, 7),
      WinsData('Week 6', 9, 13, 7, 14),
      WinsData('Week 5', 10, 10, 10, 10),
      WinsData('Week 4', 8, 12, 6, 14),
      WinsData('Week 3', 5, 8, 10, 7),
      WinsData('Week 2', 9, 13, 7, 14),
      WinsData('Week 1', 10, 10, 10, 10),
    ];
    return chartData2;
  }

  @override
  void initState() {
    _chartData = getChartData();
    _chartData2 = getChartData2();
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    chartData() => widget.expanded == false ? _chartData : _chartData2;
    height() => widget.expanded == false ? 300.0 : 600.0;
    return Container(
      height: height(),
      child: Center(
        child: Column(
          children: [
            ConstrainedBox(
              constraints: BoxConstraints(
                  maxHeight: widget.expanded == false ? 293 : 600),
              child: SfCartesianChart(
                  primaryXAxis: CategoryAxis(),
                  series: <ChartSeries>[
                    StackedBarSeries<WinsData, String>(
                      dataSource: chartData(),
                      xValueMapper: (WinsData wins, _) => wins.week,
                      yValueMapper: (WinsData wins, _) => wins.res,
                      color: HexColor('#5F78E4'),
                    ),
                    StackedBarSeries<WinsData, String>(
                      dataSource: chartData(),
                      xValueMapper: (WinsData wins, _) => wins.week,
                      yValueMapper: (WinsData wins, _) => wins.cus,
                      color: HexColor('#FDB653'),
                    ),
                    StackedBarSeries<WinsData, String>(
                        dataSource: chartData(),
                        xValueMapper: (WinsData wins, _) => wins.week,
                        yValueMapper: (WinsData wins, _) => wins.sql,
                        color: HexColor('#FF8787')),
                    StackedBarSeries<WinsData, String>(
                        dataSource: chartData(),
                        xValueMapper: (WinsData wins, _) => wins.week,
                        yValueMapper: (WinsData wins, _) => wins.mql,
                        color: HexColor('#34CA87'),
                        borderRadius: BorderRadius.only(
                            topRight: Radius.circular(5),
                            bottomRight: Radius.circular(5))),
                  ]),
            )
          ],
        ),
      ),
    );
  }
}
