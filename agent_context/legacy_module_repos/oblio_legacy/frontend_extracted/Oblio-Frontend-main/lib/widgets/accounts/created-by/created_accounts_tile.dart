import 'package:flutter/material.dart';
import 'package:oblio/theme/oblio_theme.dart';
import 'package:oblio/widgets/accounts/created-by/created_account_expansion.dart';

class CreatedByTile extends StatelessWidget {
  final String title;
  final String image;
  final String type;
  const CreatedByTile(
      {Key? key, required this.title, required this.image, required this.type})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 100,
      child: CreatedByExpansion(
          type: type,
          title: Text(title, style: oblioTheme.primaryTextTheme.headline2),
          image: image,
          tags: Row(
            children: [
              Text(
                'CEO'.toUpperCase(),
                style: oblioTheme.textTheme.caption,
              ),
              Padding(
                padding: const EdgeInsets.all(2.0),
                child: Icon(
                  Icons.fiber_manual_record,
                  size: 6,
                ),
              ),
              Text(
                'Operations'.toUpperCase(),
                style: oblioTheme.textTheme.caption,
              ),
              Padding(
                padding: const EdgeInsets.all(2.0),
                child: Icon(
                  Icons.fiber_manual_record,
                  size: 6,
                ),
              ),
              Text(
                'C-level'.toUpperCase(),
                style: oblioTheme.textTheme.caption,
              ),
            ],
          ),
          children: []),
    );
  }
}
