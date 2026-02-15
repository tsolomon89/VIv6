import 'package:flutter/material.dart';
import 'package:oblio/theme/oblio_theme.dart';
import 'package:oblio/widget-models/text_model.dart';

class PerformersAvatar extends StatelessWidget {
  final String number;
  final AssetImage image;
  const PerformersAvatar({Key? key, required this.number, required this.image})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        TextModel(
          data: number,
          style: oblioTheme.textTheme.overline!,
          textAlign: TextAlign.left,
          textDirection: TextDirection.ltr,
        ),
        SizedBox(width: 5),
        InkResponse(
          onTap: () {},
          hoverColor: Colors.transparent,
          splashColor: Colors.transparent,
          highlightColor: Colors.transparent,
          child: Container(
            padding: EdgeInsets.all(5),
            child: CircleAvatar(
                backgroundColor: oblioTheme.backgroundColor,
                radius: 27,
                backgroundImage: image),
          ),
        ),
      ],
    );
  }
}
