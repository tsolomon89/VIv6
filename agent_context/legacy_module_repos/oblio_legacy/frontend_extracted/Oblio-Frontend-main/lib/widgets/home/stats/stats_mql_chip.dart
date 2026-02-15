import 'package:flutter/material.dart';
import 'package:hexcolor/hexcolor.dart';
import 'package:oblio/theme/oblio_theme.dart';
import 'package:oblio/widget-models/chip_model.dart';

class StatsMqlChip extends StatelessWidget {
  const StatsMqlChip({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      child: ChipModel(
        label: Container(
          alignment: Alignment.center,
          width: 85,
          child: Text(
            '19.3% MQL',
            style: TextStyle(
              color: HexColor('#0EBB6A'),
              fontSize: 16,
              letterSpacing: 0.2,
              height: 1.5,
              fontFamily: 'Poppins',
              fontWeight: FontWeight.w500,
              fontStyle: FontStyle.normal,
            ),
          ),
        ),
        color: HexColor('#0EBB6A').withOpacity(0.1),
        style: oblioTheme.textTheme.overline!,
      ),
    );
  }
}
