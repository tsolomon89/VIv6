import 'package:flutter/material.dart';
import 'package:hexcolor/hexcolor.dart';
import 'package:oblio/widget-models/circular_frame_model.dart';

class StatsNumData extends StatelessWidget {
  const StatsNumData({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      child: CircularFrameModel(
          height: 50,
          width: 50,
          padding: EdgeInsets.all(2),
          child: Center(
            child: Text(
              '122',
              textAlign: TextAlign.center,
              style: TextStyle(
                  color: HexColor('#5F78E4'),
                  fontSize: 14,
                  fontWeight: FontWeight.w600),
            ),
          ),
          decoration: BoxDecoration(
              color: HexColor('#5F78E4').withOpacity(0.1),
              borderRadius: BorderRadius.circular(35))),
    );
  }
}
