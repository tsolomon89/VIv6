import 'package:flutter/material.dart';
import 'package:oblio/theme/oblio_theme.dart';
import 'package:oblio/widget-models/text_model.dart';

class AuthenticationTitle extends StatelessWidget {
  const AuthenticationTitle({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10, left: 25, right: 25),
      child: TextModel(
        data: 'WELCOME, PLEASE LOGIN TO YOUR ACCOUNT',
        style: oblioTheme.textTheme.subtitle1!,
        textAlign: TextAlign.center,
        textDirection: TextDirection.ltr,
      ),
    );
  }
}
