import 'package:flutter/material.dart';
import 'package:oblio/theme/oblio_theme.dart';
import 'package:oblio/widget-models/text_model.dart';

class CommonSubtitle extends StatelessWidget {
  final String subtitle;
  final Widget dropdown;

  const CommonSubtitle({
    Key? key,
    required this.subtitle,
    required this.dropdown,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
        padding: EdgeInsets.only(top: 5, left: 15, right: 15),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            TextModel(
              data: subtitle.toUpperCase(),
              style: oblioTheme.primaryTextTheme.headline6!,
              textAlign: TextAlign.left,
              textDirection: TextDirection.ltr,
            ),
            Expanded(
              child: Container(),
            ),
            dropdown
          ],
        ));
  }
}
