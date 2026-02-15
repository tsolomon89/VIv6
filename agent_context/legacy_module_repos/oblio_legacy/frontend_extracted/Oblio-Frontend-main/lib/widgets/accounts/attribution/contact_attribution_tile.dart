import 'package:flutter/material.dart';
import 'package:oblio/theme/oblio_theme.dart';

class ContactAttributionTile extends StatelessWidget {
  final String title;
  final String body;
  const ContactAttributionTile(
      {Key? key, required this.title, required this.body})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 100,
      child: Column(
        mainAxisAlignment: MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: oblioTheme.textTheme.subtitle2,
          ),
          Text(
            body,
            style: oblioTheme.primaryTextTheme.headline2
          ),
          SizedBox(height: 2),
          Divider(
            height: 1,
            thickness: 1,
            color: Colors.grey[200],
          )
        ],
      ),
    );
  }
}
