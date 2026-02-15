import 'package:flutter/material.dart';
import 'package:hexcolor/hexcolor.dart';
import 'package:oblio/theme/oblio_theme.dart';
import 'package:oblio/widget-models/text_model.dart';

class RankBottomText extends StatelessWidget {
  const RankBottomText({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
        padding: EdgeInsets.only(top: 15),
        child: Row(
          children: [
            TextModel(
              data: 'You\'re in top ',
              style: oblioTheme.textTheme.overline!,
              textAlign: TextAlign.left,
              textDirection: TextDirection.ltr,
            ),
            TextModel(
              data: '05%',
              style: TextStyle(
                color: HexColor('#0EBB6A'),
                fontSize: 13,
                letterSpacing: 0.2,
                fontFamily: 'Poppins',
                fontWeight: FontWeight.w500,
                fontStyle: FontStyle.normal,
              ),
              textAlign: TextAlign.left,
              textDirection: TextDirection.ltr,
            ),
          ],
        ));
  }
}
