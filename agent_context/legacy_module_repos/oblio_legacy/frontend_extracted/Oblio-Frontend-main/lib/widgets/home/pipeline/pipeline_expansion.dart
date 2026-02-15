import 'package:flutter/material.dart';
import 'package:hexcolor/hexcolor.dart';
import 'package:oblio/theme/oblio_theme.dart';
import 'package:oblio/widget-models/percentage_expansion_tile.dart';
import 'package:percent_indicator/percent_indicator.dart';

class PipelineExpansion extends StatelessWidget {
  final double percentNum;
  final String percentText;
  final HexColor color;
  final String title;
  final String subtitle;
  final List<Widget> children;
  const PipelineExpansion(
      {Key? key,
      required this.percentNum,
      required this.percentText,
      required this.color,
      required this.title,
      required this.subtitle,
      required this.children})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Visibility(
      child: PercentageExpansionTileModel(
        title: Container(
          margin: EdgeInsets.only(top: 5),
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
                children: [
                  Text(title, style: oblioTheme.textTheme.headline4),
                  Text(subtitle, style: oblioTheme.textTheme.overline),
                ],
              ),
            ],
          ),
        ),
        children: children,
      ),
    );
  }
}
