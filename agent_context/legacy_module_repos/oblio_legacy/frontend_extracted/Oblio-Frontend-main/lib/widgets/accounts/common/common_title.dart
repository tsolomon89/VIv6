import 'package:flutter/material.dart';
import 'package:oblio/theme/oblio_theme.dart';
import 'package:oblio/widget-models/text_model.dart';

class AccountCommonTitle extends StatelessWidget {
  final String title;

  const AccountCommonTitle({Key? key, required this.title}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.only(top: 20, left: 15),
      child: TextModel(
        data: title.toUpperCase(),
        style: oblioTheme.primaryTextTheme.headline3!,
        textAlign: TextAlign.left,
        textDirection: TextDirection.ltr,
      ),
    );
  }
}
