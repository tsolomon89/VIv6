import 'package:flutter/material.dart';
import 'package:hexcolor/hexcolor.dart';
import 'package:oblio/theme/oblio_theme.dart';
import 'package:oblio/widget-models/chip_model.dart';

class PerformersBottomChips extends StatelessWidget {
  const PerformersBottomChips({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        ChipModel(
          label: Container(
            alignment: Alignment.center,
            width: 40,
            child: Text(
              '19.3% MQL',
              style: TextStyle(
                color: HexColor('#0EBB6A'),
                fontSize: 8,
                fontFamily: 'Poppins',
                fontWeight: FontWeight.w500,
                fontStyle: FontStyle.normal,
              ),
            ),
          ),
          color: HexColor('#0EBB6A').withOpacity(0.1),
          style: oblioTheme.textTheme.overline!,
        ),
        SizedBox(width: 10),
        ChipModel(
          label: Container(
            alignment: Alignment.center,
            width: 40,
            child: Text(
              '19.3% MQL',
              style: TextStyle(
                color: HexColor('#0EBB6A'),
                fontSize: 8,
                fontFamily: 'Poppins',
                fontWeight: FontWeight.w500,
                fontStyle: FontStyle.normal,
              ),
            ),
          ),
          color: HexColor('#0EBB6A').withOpacity(0.1),
          style: oblioTheme.textTheme.overline!,
        ),
        SizedBox(width: 10),
        ChipModel(
          label: Container(
            alignment: Alignment.center,
            width: 40,
            child: Text(
              '19.3% MQL',
              style: TextStyle(
                color: HexColor('#0EBB6A'),
                fontSize: 8,
                fontFamily: 'Poppins',
                fontWeight: FontWeight.w500,
                fontStyle: FontStyle.normal,
              ),
            ),
          ),
          color: HexColor('#0EBB6A').withOpacity(0.1),
          style: oblioTheme.textTheme.overline!,
        ),
      ],
    );
  }
}
