import 'package:flutter/material.dart';

class DividerModel extends StatelessWidget {
  final double height;
  final double thickness;
  final Color color;

  const DividerModel({
    Key? key,
    required this.height,
    required this.thickness,
    required this.color,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      child: Divider(
        height: height,
        thickness: thickness,
        color: color,
      ),
    );
  }
}
