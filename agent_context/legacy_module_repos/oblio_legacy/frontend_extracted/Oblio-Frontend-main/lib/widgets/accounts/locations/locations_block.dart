import 'package:flutter/material.dart';
import 'package:oblio/theme/oblio_theme.dart';

class LocationsBlock extends StatelessWidget {
  final String tags;
   final String tags2;
  final String title;
  final String details;
  final String type;
  const LocationsBlock({
    Key? key,
    required this.tags,
    required this.tags2,
    required this.title,
    required this.details,
    required this.type,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.start,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.only(left: 16),
          child: Text(type, style: oblioTheme.textTheme.overline),
        ),
        Container(
          padding: EdgeInsets.all(10),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.start,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              SizedBox(width: 20),
              Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: oblioTheme.primaryTextTheme.headline2),
                  SizedBox(height: 3),
                  Row(
                    children: [
                      Text(tags, style: oblioTheme.textTheme.caption),
                      Padding(
                        padding: const EdgeInsets.all(2.0),
                        child: Icon(
                          Icons.fiber_manual_record,
                          size: 6,
                        ),
                      ),
                      Text(tags2, style: oblioTheme.textTheme.caption),
                    ],
                  ),
                  SizedBox(height: 3),
                  Text(title, style: oblioTheme.textTheme.caption),
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }
}
