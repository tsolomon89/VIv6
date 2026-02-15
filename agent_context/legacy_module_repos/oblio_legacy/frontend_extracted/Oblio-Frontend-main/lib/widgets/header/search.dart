import 'package:flutter/material.dart';
import 'package:oblio/theme/oblio_theme.dart';

import 'package:oblio/widget-models/search_input.dart';

class SearchInput extends StatelessWidget {
  final bool obscure;
  final String label;
  final Widget prefixIcon;
  const SearchInput({
    Key? key,
    required this.obscure,
    required this.label,
    required this.prefixIcon,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    var device = MediaQuery.of(context).size;
    var width = device.width;

    dynamicWidth() {
      if (width > 750 && width < 1200) {
        return width * 0.5;
      } else if (width > 1200 && width < 1400) {
        return width * 0.6;
      } else if (width > 1400) {
        return width * 0.5;
      } else if (width > 500 && width < 900) {
        return width * 0.65;
      } else {
        return width * 0.6;
      }
    }

    return Padding(
      padding:
          EdgeInsets.symmetric(vertical: 10, horizontal: width < 560 ? 10 : 40),
      child: SearchInputModel(
        width: dynamicWidth(),
        padding: EdgeInsets.all(10),
        style: oblioTheme.inputDecorationTheme.labelStyle!,
        cursorColor: oblioTheme.textSelectionTheme.cursorColor!,
        fillColor: oblioTheme.inputDecorationTheme.fillColor!,
        label: label,
        prefixIcon: prefixIcon,
        validator: (String) {},
        controller: TextEditingController(),
        labelStyle: oblioTheme.inputDecorationTheme.labelStyle!,
      ),
    );
  }
}
