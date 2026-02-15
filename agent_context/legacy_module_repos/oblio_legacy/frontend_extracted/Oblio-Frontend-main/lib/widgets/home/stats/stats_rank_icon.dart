import 'package:flutter/material.dart';
import 'package:hexcolor/hexcolor.dart';
import 'package:oblio/widget-models/circular_frame_model.dart';

class RankIcon extends StatelessWidget {
  const RankIcon({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      child: CircularFrameModel(
          height: 50,
          width: 50,
          padding: EdgeInsets.all(5),
          child: Icon(
            Icons.star,
            size: 35,
            color: Colors.white,
          ),
          decoration: BoxDecoration(
              color: HexColor('#5F78E4'),
              borderRadius: BorderRadius.circular(30))),
    );
  }
}
