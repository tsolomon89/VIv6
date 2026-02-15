import 'package:flutter/material.dart';
import 'package:hexcolor/hexcolor.dart';
import 'package:oblio/theme/oblio_theme.dart';
import 'package:oblio/widgets/accounts/attribution/contact_attribution_tile.dart';
import 'package:percent_indicator/circular_percent_indicator.dart';

class ContactAttributionTabColumn extends StatelessWidget {
  final double percentNum;
  final String percentText;
  final HexColor color;
  const ContactAttributionTabColumn({
    Key? key,
    required this.percentNum,
    required this.percentText,
    required this.color,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          SizedBox(height: 30),
          CircularPercentIndicator(
              radius: 75.0,
              lineWidth: 12.0,
              animation: true,
              percent: percentNum,
              center: Text(
                percentText + "%",
              ),
              backgroundColor: Colors.grey[200]!,
              circularStrokeCap: CircularStrokeCap.round,
              progressColor: color),
          SizedBox(height: 30),
          Padding(
            padding: const EdgeInsets.only(left: 15),
            child: ContactAttributionTile(
                title: 'Opportunity'.toUpperCase(), body: 'MQL'),
          ),
          SizedBox(height: 30),
          Padding(
            padding: const EdgeInsets.only(left: 15),
            child: ContactAttributionTile(
                title: 'Persona'.toUpperCase(), body: 'Decision M.'),
          ),
          SizedBox(height: 30),
          Padding(
            padding: const EdgeInsets.only(left: 15),
            child: ContactAttributionTile(
                title: 'Use Case'.toUpperCase(), body: 'HR'),
          ),
          SizedBox(height: 30),
          Padding(
            padding: const EdgeInsets.only(left: 15),
            child: ContactAttributionTile(
                title: 'Ad Group'.toUpperCase(), body: 'HR Manager'),
          ),
        ],
      ),
    );
  }
}
