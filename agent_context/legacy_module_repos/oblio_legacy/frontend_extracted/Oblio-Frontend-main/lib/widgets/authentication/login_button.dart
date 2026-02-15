import 'package:flutter/material.dart';
import 'package:oblio/theme/oblio_theme.dart';
import 'package:oblio/widget-models/secondary_button_model.dart';


class LoginButton extends StatelessWidget {
  final void Function()? onPressed;
  const LoginButton({Key? key, required this.onPressed}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return SecondaryButtonModel(
      height: 40,
      width: 125,
      padding: EdgeInsets.all(0),
      name: 'SIGN IN',
      textStyle: oblioTheme.textTheme.button!,
      style: oblioTheme.textButtonTheme.style!,
      onPressed: onPressed,
    );
  }
}
