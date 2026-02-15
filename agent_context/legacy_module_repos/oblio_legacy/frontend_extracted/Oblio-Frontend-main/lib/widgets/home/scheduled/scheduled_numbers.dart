import 'package:flutter/material.dart';
import 'package:oblio/theme/oblio_theme.dart';
import 'package:oblio/widget-models/large_number_model.dart';
import 'package:oblio/widget-models/text_model.dart';

class ScheduledNumbers extends StatelessWidget {
  const ScheduledNumbers({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(left: 15, right: 15, top: 5),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            children: [
              Container(
                  child: LargeNumberModel(
                data: '77',
                style: oblioTheme.textTheme.headline6!,
                textAlign: TextAlign.left,
                textDirection: TextDirection.ltr,
              )),
              TextModel(
                data: 'Open'.toUpperCase(),
                style: oblioTheme.primaryTextTheme.headline6!,
                textAlign: TextAlign.center,
                textDirection: TextDirection.ltr,
              ),
            ],
          ),
          Column(
            children: [
              Container(
                  child: LargeNumberModel(
                data: '90',
                style: oblioTheme.textTheme.headline6!,
                textAlign: TextAlign.left,
                textDirection: TextDirection.ltr,
              )),
              TextModel(
                data: 'Closed'.toUpperCase(),
                style: oblioTheme.primaryTextTheme.headline6!,
                textAlign: TextAlign.center,
                textDirection: TextDirection.ltr,
              ),
            ],
          ),
        ],
      ),
    );
  }
}
