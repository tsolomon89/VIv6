import 'package:flutter/material.dart';
import 'package:hexcolor/hexcolor.dart';
import 'package:oblio/widget-models/circular_frame_model.dart';

class PerformersNumData extends StatelessWidget {
  final String numdata;
  const PerformersNumData({Key? key, required this.numdata}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      child: CircularFrameModel(
          height: 35,
          width: 35,
          padding: EdgeInsets.all(2),
          child: Center(
            child: Text(
              numdata,
              textAlign: TextAlign.center,
              style: TextStyle(
                  color: HexColor('#5F78E4'),
                  fontSize: 10,
                  fontWeight: FontWeight.w600),
            ),
          ),
          decoration: BoxDecoration(
              color: HexColor('#5F78E4').withOpacity(0.1),
              borderRadius: BorderRadius.circular(20))),
    );
  }
}
