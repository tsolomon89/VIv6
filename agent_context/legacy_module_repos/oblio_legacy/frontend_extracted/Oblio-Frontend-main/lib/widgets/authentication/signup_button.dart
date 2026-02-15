import 'package:flutter/material.dart';
import 'package:oblio/theme/oblio_theme.dart';
import 'package:oblio/widget-models/primary_button_model.dart';

class SignupButton extends StatelessWidget {
  final void Function()? onPressed;
  const SignupButton({Key? key, required this.onPressed}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return PrimaryButtonModel(
      height: 40,
      width: 125,
      padding: EdgeInsets.all(0),
      name: 'SIGN UP',
      textStyle: oblioTheme.primaryTextTheme.button!,
      style: oblioTheme.elevatedButtonTheme.style!,
      onPressed: onPressed,
    );
  }
}
