import 'package:flutter/material.dart';
import 'package:oblio/theme/oblio_theme.dart';
import 'package:oblio/widget-models/primary_button_model.dart';

class PublishButton extends StatelessWidget {
  final void Function()? onPressed;
  const PublishButton({Key? key, required this.onPressed}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return PrimaryButtonModel(
      height: double.infinity,
      width: 200,
      padding: EdgeInsets.all(10),
      name: 'REVIEW & PUBLISH',
      textStyle: TextStyle(
          fontFamily: 'Poppins',
          color: Colors.white,
          fontWeight: FontWeight.w600,
          fontStyle: FontStyle.normal),
      //textStyle: oblioTheme.primaryTextTheme.button!,
      style: oblioTheme.outlinedButtonTheme.style!,
      onPressed: onPressed,
    );
  }
}
