import 'package:flutter/material.dart';

class HeaderTileModel extends StatelessWidget {
  final Widget? leading;
  final Widget? title;
  final Widget? trailing;

  const HeaderTileModel({
    Key? key,
    required this.leading,
    required this.title,
    required this.trailing
    
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return ListTile(
        leading: leading,
        title: title,
        trailing: trailing,
        dense: false,
        contentPadding: EdgeInsets.all(10),
        focusColor: Colors.transparent,
        tileColor: Colors.transparent,
        selectedTileColor: Colors.transparent,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.only(
              topRight: Radius.circular(10), bottomRight: Radius.circular(10)),
        ));
  }
}
