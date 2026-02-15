import 'package:flutter/material.dart';
import 'package:oblio/widgets/home/wins/wins_chart.dart';
import 'package:oblio/widgets/home/wins/wins_chips.dart';
import 'package:oblio/widgets/home/wins/wins_legend.dart';

import '../common/long-card.dart';

class WinsWidets extends StatefulWidget {
  const WinsWidets({Key? key}) : super(key: key);

  @override
  State<WinsWidets> createState() => _WinsWidetsState();
}

class _WinsWidetsState extends State<WinsWidets> {
  bool expanded = false;
  List<String> list = ['All Time', 'Day', 'Week', 'Month', 'Quarter', 'Year'];

  @override
  Widget build(BuildContext context) {
    return LongCard(
      title: 'OPPORTUNITY WINS',
      subtitle: 'TEAM WINS',
      dropdownValues: list,
      onPress: () {
        setState(() {
          expanded = !expanded;
        });
      },
      expanded: expanded,
      child: IntrinsicHeight(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.start,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            SizedBox(height: 10),
            WinsChips(),
            WinsLegend(),
            SizedBox(height: 17),
            WinsChart(expanded: expanded),
          ],
        ),
      ),
    );
  }
}
