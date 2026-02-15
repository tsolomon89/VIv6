import 'package:flutter/material.dart';
import 'package:oblio/theme/oblio_theme.dart';

class InputModel extends StatelessWidget {
  final double width;
  final bool obscure;
  final TextStyle style;
  final Color cursorColor;
  final Color fillColor;
  final String label;
  final Widget suffixIcon;
  final TextStyle labelStyle;
  final TextStyle errorStyle;
  final InputBorder border;
  final InputBorder errorBorder;
  final InputBorder focusedBorder;
  final InputBorder enabledBorder;
  final EdgeInsetsGeometry padding;
  final String? Function(String?)? validator;
  final TextEditingController controller;

  InputModel({
    Key? key,
    required this.width,
    required this.obscure,
    required this.style,
    required this.cursorColor,
    required this.fillColor,
    required this.label,
    required this.suffixIcon,
    required this.labelStyle,
    required this.errorStyle,
    required this.border,
    required this.errorBorder,
    required this.focusedBorder,
    required this.enabledBorder,
    required this.padding,
    this.validator,
    required this.controller,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return SizedBox(
        width: width,
        child: Material(
          color: Colors.transparent,
          child: TextFormField(
            obscureText: obscure,
            style: style,
            cursorColor: cursorColor,
            decoration: InputDecoration(
              isDense: false,
              hoverColor: Colors.transparent,
              suffixIcon: suffixIcon,
              suffixStyle: TextStyle(color: oblioTheme.primaryColorDark),
              fillColor: fillColor,
              errorStyle: errorStyle,
              border: border,
              errorBorder: errorBorder,
              focusedBorder: focusedBorder,
              enabledBorder: enabledBorder,
              contentPadding: padding,
              label: Text(label),
              labelStyle: labelStyle,
            ),
            validator: validator,
            controller: controller,
          ),
        ));
  }
}
