import 'package:flutter/material.dart';
import 'package:oblio/theme/oblio_theme.dart';
import 'package:oblio/widget-models/text_model.dart';

class AlertModel extends StatelessWidget {
  final String data;
  final double height;
  final double width;
  final EdgeInsets padding;

  const AlertModel({
    Key? key,
    required this.data,
    required this.height,
    required this.width,
    required this.padding,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      height: height,
      width: width,
      padding: padding,
      child: Center(
          child: TextModel(
              data: data,
              style: oblioTheme.textTheme.headline4!,
              textAlign: TextAlign.center,
              textDirection: TextDirection.ltr)),
      decoration: BoxDecoration(
        color: oblioTheme.cardColor,
        borderRadius: BorderRadius.all(
          Radius.circular(10),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.blueGrey.withOpacity(0.1),
            spreadRadius: 10,
            blurRadius: 20,
            offset: Offset(0, 3),
          ),
        ],
      ),
    );
  }
}
