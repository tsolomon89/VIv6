import 'package:flutter/material.dart';
import 'package:hexcolor/hexcolor.dart';
import 'package:oblio/theme/oblio_theme.dart';
import 'package:oblio/widget-models/circular_frame_model.dart';
import 'package:oblio/widget-models/text_model.dart';

class WinsLegend extends StatelessWidget {
  const WinsLegend({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
        padding: EdgeInsets.only(top: 15, left: 35, right: 35),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Row(
              children: [
                CircularFrameModel(
                    height: 10,
                    width: 10,
                    child: Container(),
                    padding: EdgeInsets.all(0),
                    decoration: BoxDecoration(
                      color: HexColor('#8FA1EC'),
                      borderRadius: BorderRadius.circular(40),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.blueGrey.withOpacity(0.1),
                          spreadRadius: 10,
                          blurRadius: 15,
                          offset: Offset(0, 1),
                        ),
                      ],
                    )),
                SizedBox(width: 5),
                TextModel(
                    data: 'Mql'.toUpperCase(),
                    style: oblioTheme.textTheme.overline!,
                    textAlign: TextAlign.center,
                    textDirection: TextDirection.ltr)
              ],
            ),
            Row(
              children: [
                CircularFrameModel(
                    height: 10,
                    width: 10,
                    child: Container(),
                    padding: EdgeInsets.all(0),
                    decoration: BoxDecoration(
                      color: HexColor('#FDB653'),
                      borderRadius: BorderRadius.circular(40),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.blueGrey.withOpacity(0.1),
                          spreadRadius: 10,
                          blurRadius: 15,
                          offset: Offset(0, 1),
                        ),
                      ],
                    )),
                SizedBox(width: 5),
                TextModel(
                    data: 'Sql'.toUpperCase(),
                    style: oblioTheme.textTheme.overline!,
                    textAlign: TextAlign.center,
                    textDirection: TextDirection.ltr)
              ],
            ),
            Row(
              children: [
                CircularFrameModel(
                    height: 10,
                    width: 10,
                    child: Container(),
                    padding: EdgeInsets.all(0),
                    decoration: BoxDecoration(
                      color: HexColor('#FF8787'),
                      borderRadius: BorderRadius.circular(40),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.blueGrey.withOpacity(0.1),
                          spreadRadius: 10,
                          blurRadius: 15,
                          offset: Offset(0, 1),
                        ),
                      ],
                    )),
                SizedBox(width: 5),
                TextModel(
                    data: 'Cus'.toUpperCase(),
                    style: oblioTheme.textTheme.overline!,
                    textAlign: TextAlign.center,
                    textDirection: TextDirection.ltr)
              ],
            ),
            Row(
              children: [
                CircularFrameModel(
                    height: 10,
                    width: 10,
                    child: Container(),
                    padding: EdgeInsets.all(0),
                    decoration: BoxDecoration(
                      color: HexColor('#34CA87'),
                      borderRadius: BorderRadius.circular(40),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.blueGrey.withOpacity(0.1),
                          spreadRadius: 10,
                          blurRadius: 15,
                          offset: Offset(0, 1),
                        ),
                      ],
                    )),
                SizedBox(width: 5),
                TextModel(
                    data: 'Ret'.toUpperCase(),
                    style: oblioTheme.textTheme.overline!,
                    textAlign: TextAlign.center,
                    textDirection: TextDirection.ltr)
              ],
            ),
          ],
        ));
  }
}
