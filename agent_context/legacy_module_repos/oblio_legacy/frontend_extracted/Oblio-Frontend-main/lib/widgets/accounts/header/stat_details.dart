import 'package:flutter/material.dart';
import 'package:hexcolor/hexcolor.dart';
import 'package:oblio/widget-models/divider_model.dart';
import 'package:oblio/widgets/accounts/header/stats_tile.dart';
import 'package:oblio/widgets/accounts/stats/stats.dart';

class StatDetails extends StatelessWidget {
  const StatDetails({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return AccountStats(
        child: Container(
      color: HexColor('#5F78E4'),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.only(top: 15, left: 15),
            child: Text(
              'Your Stats'.toUpperCase(),
              style: TextStyle(
                color: Colors.white,
                fontSize: 13,
                fontFamily: "Poppins",
                fontWeight: FontWeight.w500,
                fontStyle: FontStyle.normal,
              ),
            ),
          ),
          AccountStatsTile(),
          SizedBox(height: 1),
          Center(
            child: Container(
              padding: EdgeInsets.only(left: 25),
              width: 250,
              child: DividerModel(height: 0, thickness: 1, color: Colors.white),
            ),
          )
        ],
      ),
    ));
  }
}
