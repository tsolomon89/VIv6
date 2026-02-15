import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:hexcolor/hexcolor.dart';
import 'package:oblio/theme/oblio_theme.dart';
import 'package:oblio/widget-models/chip_model.dart';

class WinsChips extends StatefulWidget {
  const WinsChips({Key? key}) : super(key: key);

  @override
  State<WinsChips> createState() => _WinsChipsState();
}

class _WinsChipsState extends State<WinsChips> {
  List<Color> chipColor = [
    HexColor('#dcdcdc'),
    HexColor('#dcdcdc'),
    HexColor('#dcdcdc'),
    HexColor('#dcdcdc'),
  ];
  List<Color> textColor = [
    HexColor('#808080'),
    HexColor('#808080'),
    HexColor('#808080'),
    HexColor('#808080'),
  ];

  @override
  Widget build(BuildContext context) {
    List<String> items = ['RES', 'CUS', 'SQL', 'MQL'];
    return Container(
        height: 39,
        padding: EdgeInsets.only(bottom: 6),
        child: ShaderMask(
          shaderCallback: (Rect rect) {
            return LinearGradient(
              begin: Alignment.centerLeft,
              end: Alignment.centerRight,
              colors: [
                Colors.purple,
                Colors.transparent,
                Colors.transparent,
                Colors.purple
              ],
              stops: [0.0, 0.2, 0.7, 1.0],
            ).createShader(rect);
          },
          blendMode: BlendMode.dstOut,
          child: ListView.separated(
              separatorBuilder: (context, index) => SizedBox(width: 10),
              itemCount: items.length,
              scrollDirection: Axis.horizontal,
              itemBuilder: (context, i) {
                return InkWell(
                  hoverColor: Colors.transparent,
                  splashColor: Colors.transparent,
                  highlightColor: Colors.transparent,
                  onTap: () {
                    setState(() {
                      chipColor[i] = chipColor[i] == HexColor('#dcdcdc')
                          ? HexColor('#711BEF').withOpacity(0.2)
                          : HexColor('#dcdcdc');
                      textColor[i] = textColor[i] == HexColor('#808080')
                          ? HexColor('#711BEF')
                          : HexColor('#808080');
                    });
                  },
                  child: ChipModel(
                    label: Container(
                      padding: EdgeInsets.only(bottom: 0),
                      alignment: Alignment.center,
                      width: 70,
                      child: Text(
                        items[i],
                        style: TextStyle(
                          color: textColor[i],
                          fontSize: 12,
                          fontFamily: 'Poppins',
                          fontWeight: FontWeight.w500,
                          fontStyle: FontStyle.normal,
                        ),
                      ),
                    ),
                    color: chipColor[i],
                    style: oblioTheme.textTheme.overline!,
                  ),
                );
              }),
        ));
  }
}
