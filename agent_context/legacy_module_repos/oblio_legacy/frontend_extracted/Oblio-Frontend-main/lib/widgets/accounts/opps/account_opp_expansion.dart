import 'package:flutter/material.dart';
import 'package:hexcolor/hexcolor.dart';
import 'package:oblio/widget-models/percentage_expansion_tile.dart';
import 'package:percent_indicator/percent_indicator.dart';

class AccountOppExpansion extends StatelessWidget {
  final double percentNum;
  final String percentText;
  final HexColor color;
  final Widget tags;
  final Widget title;
  final Widget subtitle;
  final Widget hearts;
  final List<Widget> children;
  const AccountOppExpansion(
      {Key? key,
      required this.percentNum,
      required this.percentText,
      required this.color,
      required this.tags,
      required this.title,
      required this.subtitle,
      required this.hearts,
      required this.children})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return PercentageExpansionTileModel(
      title: Container(
        margin: EdgeInsets.only(top: 14),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.start,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            CircularPercentIndicator(
                radius: 55.0,
                lineWidth: 6.0,
                animation: true,
                percent: percentNum,
                center: Text(
                  percentText + "%",
                  // style: oblioTheme.textTheme.subtitle2,
                ),
                backgroundColor: Colors.grey[200]!,
                circularStrokeCap: CircularStrokeCap.round,
                progressColor: color),
            SizedBox(width: 20),
            Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [tags, title, subtitle, hearts],
            ),
          ],
        ),
      ),
      children: children,
    );
  }
}
