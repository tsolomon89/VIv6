import 'package:flutter/material.dart';

class LargeNumberModel extends StatelessWidget {
  final String data;
  final TextStyle style;
  final TextAlign textAlign;
  final TextDirection textDirection;

  const LargeNumberModel({
    Key? key,
    required this.data,
    required this.style,
    required this.textAlign,
    required this.textDirection,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Text(
      data,
      textAlign: textAlign,
      style: style,
      textDirection: textDirection,
    );
  }
}
