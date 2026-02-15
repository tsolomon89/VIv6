import 'package:flutter/material.dart';
import 'package:oblio/theme/colors.dart';
import 'package:oblio/theme/oblio_theme.dart';
import 'package:oblio/widgets/accounts/primary/primary_account_expansion.dart';

class PrimaryAccountsTile extends StatelessWidget {
  final String title;
  final String image;
  final String type;
  const PrimaryAccountsTile(
      {Key? key, required this.title, required this.image, required this.type})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 100,
      child: PrimaryAccountExpansion(
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
          hearts: Row(
            children: [
              Row(
                children: [
                  Icon(Icons.favorite, size: 18, color: CompanyColors.red[500]),
                  Icon(Icons.favorite, size: 18, color: CompanyColors.red[500]),
                  Icon(Icons.favorite, size: 18, color: CompanyColors.red[300]),
                  Icon(Icons.favorite, size: 18, color: CompanyColors.red[100]),
                  Icon(Icons.favorite, size: 18, color: CompanyColors.red[100]),
                ],
              ),
              SizedBox(width: 15),
              Text('Nov 10'.toUpperCase(), style: oblioTheme.textTheme.caption),
            ],
          ),
          children: []),
    );
  }
}
