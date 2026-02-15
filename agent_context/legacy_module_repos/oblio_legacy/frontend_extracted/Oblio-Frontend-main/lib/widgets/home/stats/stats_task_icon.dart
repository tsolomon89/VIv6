import 'package:flutter/material.dart';
import 'package:hexcolor/hexcolor.dart';
import 'package:oblio/widget-models/circular_frame_model.dart';

class TaskIcon extends StatelessWidget {
  const TaskIcon({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      child: CircularFrameModel(
          height: 50,
          width: 50,
          padding: EdgeInsets.all(5),
          child: Icon(
            Icons.assignment_turned_in,
            size: 32,
            color: Colors.white,
          ),
          decoration: BoxDecoration(
              color: HexColor('#5F78E4'),
              borderRadius: BorderRadius.circular(30))),
    );
  }
}
