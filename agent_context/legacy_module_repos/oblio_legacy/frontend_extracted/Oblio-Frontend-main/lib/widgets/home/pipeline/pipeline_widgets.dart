import 'package:flutter/material.dart';
import 'package:oblio/widgets/home/pipeline/pipeline_chart_navigator.dart';
import 'package:oblio/widgets/home/pipeline/pipeline_drawer.dart';

import '../common/long-card.dart';

class PipelineWidets extends StatefulWidget {
  const PipelineWidets({Key? key}) : super(key: key);

  @override
  State<PipelineWidets> createState() => _PipelineWidetsState();
}

class _PipelineWidetsState extends State<PipelineWidets> {
  bool expanded = false;
  List<String> list = ['All Time', 'Day', 'Week', 'Month', 'Quarter', 'Year'];

  @override
  Widget build(BuildContext context) {
    return LongCard(
      title: 'PIPELINE GOALS',
      subtitle: 'PERSONAL GOALS',
      dropdownValues: list,
      onPress: () => setState(() {
        expanded = !expanded;
      }),
      expanded: expanded,
      child: IntrinsicHeight(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.start,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            PipelineChartNavigator(),
            Visibility(visible: expanded, child: PipelineDrawer()),
          ],
        ),
      ),
    );
  }
}
