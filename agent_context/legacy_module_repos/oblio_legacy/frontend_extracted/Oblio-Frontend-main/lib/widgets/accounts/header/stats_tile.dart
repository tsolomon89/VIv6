import 'package:flutter/material.dart';
import 'package:hexcolor/hexcolor.dart';
import 'package:oblio/theme/oblio_theme.dart';
import 'package:oblio/widget-models/circular_frame_model.dart';
import 'package:oblio/widget-models/icon_expansion_tile.dart';

class AccountStatsTile extends StatelessWidget {
  const AccountStatsTile({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return IconExpansionTileModel(
      openColor: Colors.white,
      closedColor: Colors.white,
      title: Container(
        margin: EdgeInsets.only(top: 5),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.start,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            CircularFrameModel(
                height: 40,
                width: 40,
                padding: EdgeInsets.all(5),
                child: Icon(
                  Icons.mail,
                  size: 25,
                  color: HexColor('#5F78E4'),
                ),
                decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(30))),
            SizedBox(width: 20),
            Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text('Customer'.toUpperCase(),
                        style: oblioTheme.primaryTextTheme.caption),
                    Padding(
                      padding: const EdgeInsets.all(2.0),
                      child: Icon(
                        Icons.fiber_manual_record,
                        size: 6,
                        color: Colors.white,
                      ),
                    ),
                    Text('Open'.toUpperCase(),
                        style: oblioTheme.primaryTextTheme.caption),
                    Padding(
                      padding: const EdgeInsets.all(2.0),
                      child: Icon(
                        Icons.fiber_manual_record,
                        size: 6,
                        color: Colors.white,
                      ),
                    ),
                    Text('Renewal'.toUpperCase(),
                        style: oblioTheme.primaryTextTheme.caption),
                  ],
                ),
                SizedBox(height: 2),
                Text(
                  'IBM Corporation',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 13,
                    fontFamily: "Poppins",
                    fontWeight: FontWeight.w500,
                    fontStyle: FontStyle.normal,
                  ),
                ),
                SizedBox(height: 2),
                Row(
                  children: [
                    Text('Computer Hardware',
                        style: oblioTheme.primaryTextTheme.caption),
                    Padding(
                      padding: const EdgeInsets.all(2.0),
                      child: Icon(
                        Icons.fiber_manual_record,
                        size: 6,
                        color: Colors.white,
                      ),
                    ),
                    Text('5000+ Employees',
                        style: oblioTheme.primaryTextTheme.caption),
                  ],
                ),
              ],
            ),
          ],
        ),
      ),
      children: [],
    );
  }
}
