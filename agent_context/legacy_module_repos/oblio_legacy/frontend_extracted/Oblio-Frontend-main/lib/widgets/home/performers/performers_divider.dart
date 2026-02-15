import 'package:flutter/material.dart';
import 'package:oblio/theme/oblio_theme.dart';
import 'package:oblio/widget-models/divider_model.dart';

class PerformersDivider extends StatelessWidget {
  const PerformersDivider({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(left: 20, right: 20, top: 0, bottom: 0),
      child: DividerModel(
        height: 0,
        thickness: 1,
        color: oblioTheme.dividerTheme.color!,
      ),
    );
  }
}
