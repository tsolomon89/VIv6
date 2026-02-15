import 'package:flutter/material.dart';
import 'package:oblio/theme/oblio_theme.dart';
import 'package:oblio/widget-models/large_number_model.dart';

class TaskNumber extends StatelessWidget {
  const TaskNumber({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
        child: LargeNumberModel(
      data: '78',
      style: oblioTheme.textTheme.headline6!,
      textAlign: TextAlign.left,
      textDirection: TextDirection.ltr,
    ));
  }
}
