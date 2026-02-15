import 'package:flutter/material.dart';
import 'package:oblio/theme/oblio_theme.dart';
import 'package:oblio/widget-models/text_model.dart';

class Return extends StatelessWidget {
  final Function() onTap;
  const Return({Key? key, required this.onTap}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      splashFactory: NoSplash.splashFactory,
      hoverColor: Colors.transparent,
      highlightColor: Colors.transparent,
      child: TextModel(
          data: 'Return to Sign In',
          style: oblioTheme.textTheme.overline!,
          textAlign: TextAlign.left,
          textDirection: TextDirection.ltr),
    );
  }
}
