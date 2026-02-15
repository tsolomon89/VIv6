import 'package:flutter/material.dart';
import 'package:hexcolor/hexcolor.dart';
import 'package:oblio/theme/oblio_theme.dart';
import 'package:oblio/widgets/home/pipeline/pipeline_chart_open.dart';
import 'package:oblio/widgets/home/pipeline/pipeline_chart_won.dart';

class PipelineChartNavigator extends StatefulWidget {
  const PipelineChartNavigator({Key? key}) : super(key: key);

  @override
  State<PipelineChartNavigator> createState() => _PipelineChartNavigatorState();
}

class _PipelineChartNavigatorState extends State<PipelineChartNavigator>
    with TickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      child: DefaultTabController(
        initialIndex: 1,
        length: 2,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Container(
              height: 360,
              child: TabBarView(
                controller: _tabController,
                children: const <Widget>[
                  Center(child: PipelineChartOpen()),
                  Center(child: PipelineChartWon()),
                ],
              ),
            ),
            Container(
              height: 40,
              child: TabBar(
                controller: _tabController,
                tabs: <Widget>[
                  Padding(
                    padding: EdgeInsets.all(8.0),
                    child: Text(
                      'Open'.toUpperCase(),
                      style: oblioTheme.textTheme.overline!,
                    ),
                  ),
                  Padding(
                    padding: EdgeInsets.all(8.0),
                    child: Text(
                      'Won'.toUpperCase(),
                      style: oblioTheme.textTheme.overline!,
                    ),
                  ),
                ],
                indicator: UnderlineTabIndicator(
                  borderSide:
                      BorderSide(color: HexColor('#5F78E4'), width: 2.0),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
