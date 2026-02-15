import 'package:flutter/material.dart';
import 'package:oblio/theme/oblio_theme.dart';
import 'package:oblio/widget-models/text_model.dart';

class ResetTitle extends StatelessWidget {
  const ResetTitle({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10, left: 25, right: 25),
      child: TextModel(
        data: 'RESET YOUR PASSWORD',
        style: oblioTheme.textTheme.subtitle1!,
        textAlign: TextAlign.center,
        textDirection: TextDirection.ltr,
      ),
    );
  }
}
