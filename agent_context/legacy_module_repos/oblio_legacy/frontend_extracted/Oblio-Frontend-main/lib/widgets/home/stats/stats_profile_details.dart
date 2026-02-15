import 'package:flutter/material.dart';
import 'package:oblio/theme/oblio_theme.dart';
import 'package:oblio/widget-models/text_model.dart';

class StatsProfileDetails extends StatelessWidget {
  const StatsProfileDetails({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
        child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisAlignment: MainAxisAlignment.start,
      children: [
        TextModel(
          data: 'Alita Stone'.toUpperCase(),
          style: oblioTheme.textTheme.headline1!,
          textAlign: TextAlign.left,
          textDirection: TextDirection.ltr,
        ),
        TextModel(
          data: 'Marketing Junior'.toUpperCase(),
          style: oblioTheme.textTheme.overline!,
          textAlign: TextAlign.left,
          textDirection: TextDirection.ltr,
        ),
      ],
    ));
  }
}
