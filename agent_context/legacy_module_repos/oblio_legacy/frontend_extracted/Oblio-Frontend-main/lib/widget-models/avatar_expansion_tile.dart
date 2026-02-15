import 'package:flutter/material.dart';

class AvatarExpansionTileModel extends StatelessWidget {
  final Widget title;
  final List<Widget> children;
  const AvatarExpansionTileModel(
      {Key? key, required this.title, required this.children})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 75,
      child: ExpansionTile(
        title: title,
        children: children,
      ),
    );
  }
}
