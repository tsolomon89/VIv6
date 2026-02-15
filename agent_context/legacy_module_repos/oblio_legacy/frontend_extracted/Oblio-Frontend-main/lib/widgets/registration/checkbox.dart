import 'package:flutter/material.dart';
import 'package:oblio/theme/oblio_theme.dart';
import 'package:oblio/widget-models/checkbox_model.dart';

class AuthenticationCheckbox extends StatelessWidget {
  final bool value;
  final void Function(bool?) onChanged;
  const AuthenticationCheckbox(
      {Key? key, required this.value, required this.onChanged})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return CheckboxModel(
      fillColor: oblioTheme.checkboxTheme.fillColor!,
      value: value,
      onChanged: onChanged,
      border: oblioTheme.checkboxTheme.side!,
    );
  }
}
