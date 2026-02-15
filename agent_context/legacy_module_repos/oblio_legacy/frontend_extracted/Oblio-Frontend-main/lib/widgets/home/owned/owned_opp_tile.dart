import 'package:flutter/material.dart';
import 'package:hexcolor/hexcolor.dart';
import 'package:oblio/theme/colors.dart';
import 'package:oblio/theme/oblioTheme.dart';
import 'package:oblio/theme/oblio_theme.dart';
import 'package:oblio/widgets/home/owned/owned_opp_expansion.dart';

class OwnedOppTile extends StatelessWidget {
  final String title;
  final HexColor color;
  const OwnedOppTile({Key? key, required this.title, required this.color})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 100,
      child: OwnedOppExpansion(
          percentNum: 0.6,
          percentText: '60',
          color: color,
          tags: Row(
            children: [
              Text(
                'Open'.toUpperCase(),
                style: Typeface.tileHeader,
              ),
              Padding(
                padding: const EdgeInsets.all(2.0),
                child: Icon(
                  Icons.fiber_manual_record,
                  size: 6,
                ),
              ),
              Text(
                'Renewal'.toUpperCase(),
                style: Typeface.tileHeader,
              ),
              Padding(
                padding: const EdgeInsets.all(2.0),
                child: Icon(
                  Icons.fiber_manual_record,
                  size: 6,
                ),
              ),
              Text(
                'Ibm'.toUpperCase(),
                style: Typeface.tileHeader,
              ),
            ],
          ),
          title: Text(title, style: Typeface.tileSubtitle),
          subtitle: Row(
            children: [
              Text(
                '\$1500',
                style: Typeface.tileBody,
              ),
              Padding(
                padding: const EdgeInsets.all(2.0),
                child: Icon(
                  Icons.fiber_manual_record,
                  size: 6,
                ),
              ),
              Text(
                '10/01/21',
                style: Typeface.tileBody,
              ),
              Padding(
                padding: const EdgeInsets.all(2.0),
                child: Icon(
                  Icons.fiber_manual_record,
                  size: 6,
                ),
              ),
              Text(
                '25/05/21',
                style: Typeface.tileBody,
              ),
            ],
          ),
          hearts: Container(
            margin: EdgeInsets.only(top: 10),
            child: Row(
              children: [
                Row(
                  children: [
                    Icon(Icons.favorite,
                        size: 16, color: CompanyColors.red[500]),
                    Icon(Icons.favorite,
                        size: 16, color: CompanyColors.red[500]),
                    Icon(Icons.favorite,
                        size: 16, color: CompanyColors.red[300]),
                    Icon(Icons.favorite,
                        size: 16, color: CompanyColors.red[100]),
                    Icon(Icons.favorite,
                        size: 16, color: CompanyColors.red[100]),
                  ],
                ),
                SizedBox(width: 15),
                Text('Nov 10'.toUpperCase(),
                    style: oblioTheme.textTheme.caption),
              ],
            ),
          ),
          children: []),
    );
  }
}
