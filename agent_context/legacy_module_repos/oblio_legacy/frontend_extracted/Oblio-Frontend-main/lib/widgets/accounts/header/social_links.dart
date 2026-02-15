import 'package:flutter/material.dart';
import 'package:oblio/widget-models/circular_frame_model.dart';

class AccountSocialLinks extends StatelessWidget {
  final IconData icon;
  final Color background;
  final Color color;
  const AccountSocialLinks(
      {Key? key,
      required this.icon,
      required this.background,
      required this.color})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      child: CircularFrameModel(
          height: 35,
          width: 35,
          padding: EdgeInsets.all(2),
          child: Center(child: Icon(icon, size: 20, color: color)),
          decoration: BoxDecoration(
              color: background, borderRadius: BorderRadius.circular(20))),
    );
  }
}
