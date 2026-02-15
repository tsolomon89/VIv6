import 'package:flutter/material.dart';
import 'package:oblio/theme/oblio_theme.dart';
import 'package:oblio/widget-models/input_model.dart';

class RegistrationInput extends StatelessWidget {
  final bool obscure;
  final String label;
  final Widget suffixIcon;
  final String? Function(String?)? validator;
  final TextEditingController controller;
  const RegistrationInput({
    Key? key,
    required this.obscure,
    required this.label,
    required this.suffixIcon,
    required this.validator,
    required this.controller,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      child: InputModel(
        width: 300,
        obscure: obscure,
        style: oblioTheme.inputDecorationTheme.labelStyle!,
        cursorColor: oblioTheme.textSelectionTheme.cursorColor!,
        fillColor: oblioTheme.inputDecorationTheme.fillColor!,
        label: label,
        suffixIcon: suffixIcon,
        labelStyle: oblioTheme.inputDecorationTheme.labelStyle!,
        errorStyle: oblioTheme.inputDecorationTheme.errorStyle!,
        border: oblioTheme.inputDecorationTheme.border!,
        errorBorder: oblioTheme.inputDecorationTheme.errorBorder!,
        focusedBorder: oblioTheme.inputDecorationTheme.focusedBorder!,
        enabledBorder: oblioTheme.inputDecorationTheme.enabledBorder!,
        padding: oblioTheme.inputDecorationTheme.contentPadding!,
        validator: validator,
        controller: controller,
      ),
    );
  }
}
