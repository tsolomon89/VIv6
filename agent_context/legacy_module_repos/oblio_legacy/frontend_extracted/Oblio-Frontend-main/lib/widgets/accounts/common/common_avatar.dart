import 'package:flutter/material.dart';
import 'package:oblio/theme/oblio_theme.dart';

class AccountsCommonAvatar extends StatelessWidget {
  final double radius;
  final String image;

  const AccountsCommonAvatar(
      {Key? key, required this.radius, required this.image})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return InkResponse(
      onTap: () {},
      hoverColor: Colors.transparent,
      splashColor: Colors.transparent,
      highlightColor: Colors.transparent,
      child: Container(
        padding: EdgeInsets.all(5),
        child: CircleAvatar(
          backgroundColor: oblioTheme.backgroundColor,
          radius: radius,
          backgroundImage: AssetImage(image),
        ),
      ),
    );
  }
}
