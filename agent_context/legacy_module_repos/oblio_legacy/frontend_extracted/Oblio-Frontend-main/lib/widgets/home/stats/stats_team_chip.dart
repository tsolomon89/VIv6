import 'package:flutter/material.dart';
import 'package:oblio/theme/oblio_theme.dart';
import 'package:oblio/widget-models/chip_model.dart';

class StatsTeamChip extends StatelessWidget {
  const StatsTeamChip({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return ChipModel(
      label: Container(
        alignment: Alignment.center,
        height: 23,
        width: 95,
        child: Text(
          'alpha team',
          style: TextStyle(
            fontSize: 13,
            letterSpacing: 0.2,
            fontFamily: 'Poppins',
            fontWeight: FontWeight.w500,
            fontStyle: FontStyle.normal,
          ),
        ),
      ),
      color: oblioTheme.chipTheme.backgroundColor,
      style: oblioTheme.textTheme.overline!,
    );
  }
}
