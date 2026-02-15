import 'package:flutter/material.dart';
import 'package:oblio/theme/oblio_theme.dart';

class StatsAvatar extends StatelessWidget {
  const StatsAvatar({Key? key}) : super(key: key);

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
          radius: 30,
          backgroundImage: AssetImage(
            'lib/assets/images/profile_low.png',
          ),
        ),
      ),
    );
  }
}
