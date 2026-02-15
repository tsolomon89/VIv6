import 'package:flutter/material.dart';
import 'package:oblio/theme/oblio_theme.dart';
import 'package:oblio/widget-models/text_model.dart';

class RegistrationTitle extends StatelessWidget {
  const RegistrationTitle({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(
        top: 20,
        bottom: 20,
      ),
      child: TextModel(
        data: 'CONTACT DETAILS',
        style: oblioTheme.textTheme.subtitle1!,
        textAlign: TextAlign.left,
        textDirection: TextDirection.ltr,
      ),
    );
  }
}
