import 'package:flutter/material.dart';
import 'package:oblio/theme/oblio_theme.dart';
import 'package:oblio/widget-models/primary_button_model.dart';

class SubmitButton extends StatelessWidget {
  final void Function()? onPressed;
  const SubmitButton({Key? key, required this.onPressed}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return PrimaryButtonModel(
      height: 45,
      width: 300,
      padding: EdgeInsets.all(0),
      name: 'Submit',
      textStyle: oblioTheme.primaryTextTheme.button!,
      style: oblioTheme.elevatedButtonTheme.style!,
      onPressed: onPressed,
    );
  }
}
