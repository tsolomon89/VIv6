import 'package:flutter/material.dart';
import 'package:oblio/widgets/home/home.dart';

class HomeScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Flexible(
      flex: 1,
      child: LayoutBuilder(
          builder: (BuildContext context, BoxConstraints constraints) {
        return HomeWidgets(width: constraints.maxWidth);
      }),
    );
  }
}
