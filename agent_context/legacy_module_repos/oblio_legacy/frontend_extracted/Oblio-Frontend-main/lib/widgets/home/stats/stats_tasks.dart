import 'package:flutter/material.dart';
import 'package:oblio/theme/oblio_theme.dart';
import 'package:oblio/widget-models/text_model.dart';
import 'package:oblio/widgets/home/stats/stats_task_bottom_text.dart';
import 'package:oblio/widgets/home/stats/stats_task_icon.dart';
import 'package:oblio/widgets/home/stats/stats_task_number.dart';

class TaskWidgets extends StatelessWidget {
  const TaskWidgets({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          TextModel(
            data: 'Tasks'.toUpperCase(),
            style: oblioTheme.primaryTextTheme.headline4!,
            textAlign: TextAlign.left,
            textDirection: TextDirection.ltr,
          ),
          SizedBox(
            height: 20,
          ),
          Row(
            mainAxisAlignment: MainAxisAlignment.start,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              TaskIcon(),
              SizedBox(
                width: 20,
              ),
              TaskNumber(),
            ],
          ),
          SizedBox(
            height: 5,
          ),
          TaskBottomText()
        ],
      ),
    );
  }
}
