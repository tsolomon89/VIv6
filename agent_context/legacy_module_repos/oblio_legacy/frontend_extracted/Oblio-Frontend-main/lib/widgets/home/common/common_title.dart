import 'package:flutter/material.dart';
import 'package:oblio/theme/oblio_theme.dart';
import 'package:oblio/widget-models/text_model.dart';

class CommonTitle extends StatelessWidget {
  final String title;
  final Color? color;
  const CommonTitle({Key? key, required this.title, this.color})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.only(top: 16, left: 15),
      child: TextModel(
        data: title.toUpperCase(),
        style: oblioTheme.primaryTextTheme.headline3!
            .copyWith(color: color != null ? color : null),
        textAlign: TextAlign.left,
        textDirection: TextDirection.ltr,
      ),
    );
  }
}
