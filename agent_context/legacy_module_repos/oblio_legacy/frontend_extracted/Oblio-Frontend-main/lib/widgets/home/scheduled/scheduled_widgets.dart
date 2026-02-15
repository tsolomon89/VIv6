import 'package:flutter/material.dart';
import 'package:oblio/widgets/home/common/short-card.dart';
import 'package:oblio/widgets/home/scheduled/scheduled_circular.dart';

class ScheduledWidets extends StatefulWidget {
  const ScheduledWidets({Key? key}) : super(key: key);

  @override
  State<ScheduledWidets> createState() => _ScheduledWidetsState();
}

class _ScheduledWidetsState extends State<ScheduledWidets> {
  List<String> list = ['All Time', 'Day', 'Week', 'Month', 'Quarter', 'Year'];

  @override
  Widget build(BuildContext context) {
    return ShortCard(
      subtitle: 'SALES TEAM',
      dropdownValues: list,
      title: 'SCHEDULED TASKS',
      child: Column(
        mainAxisAlignment: MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(height: 10),
          ScheduledCircular(),
        ],
      ),
    );
  }
}
