import 'package:flutter/material.dart';
import 'package:oblio/theme/oblio_theme.dart';

class AvatarModel extends StatelessWidget {
  final void Function() onPressed;
  final double radius;
  final AssetImage image;
  const AvatarModel({
    Key? key,
    required this.onPressed,
    required this.radius,
    required this.image,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return InkResponse(
      onTap: onPressed,
      hoverColor: Colors.transparent,
      splashColor: Colors.transparent,
      highlightColor: Colors.transparent,
      child: Container(
        padding: EdgeInsets.all(5),
        child: CircleAvatar(
            backgroundColor: oblioTheme.backgroundColor,
            radius: radius,
            backgroundImage: image),
      ),
    );
  }
}
