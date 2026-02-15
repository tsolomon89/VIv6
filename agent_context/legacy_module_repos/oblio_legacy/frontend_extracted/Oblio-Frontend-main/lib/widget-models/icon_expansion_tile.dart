import 'package:flutter/material.dart';

class IconExpansionTileModel extends StatelessWidget {
  final Widget title;
  final Color openColor;
  final Color closedColor;
  final List<Widget> children;
  const IconExpansionTileModel(
      {Key? key, required this.title, required this.children, required this.openColor, required this.closedColor})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 100,
      child: ExpansionTile(
        tilePadding: EdgeInsets.all(10),
        title: title,
        children: children,
        collapsedIconColor: closedColor,
        iconColor: openColor,
      ),
    );
  }
}
