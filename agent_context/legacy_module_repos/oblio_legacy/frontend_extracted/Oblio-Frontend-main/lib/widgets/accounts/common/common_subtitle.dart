import 'package:flutter/material.dart';
import 'package:oblio/theme/oblio_theme.dart';
import 'package:oblio/widget-models/text_model.dart';

class AccountCommonSubtitle extends StatelessWidget {
  final String subtitle;
  const AccountCommonSubtitle({Key? key, required this.subtitle})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.only(top: 20, left: 15),
      child: TextModel(
        data: subtitle.toUpperCase(),
        style: oblioTheme.textTheme.overline!,
        textAlign: TextAlign.left,
        textDirection: TextDirection.ltr,
      ),
    );
  }
}
