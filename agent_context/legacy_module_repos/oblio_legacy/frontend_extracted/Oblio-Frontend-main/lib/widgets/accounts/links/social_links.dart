import 'package:flutter/material.dart';
import 'package:hexcolor/hexcolor.dart';
import 'package:material_design_icons_flutter/material_design_icons_flutter.dart';
import 'package:oblio/theme/oblio_theme.dart';
import 'package:oblio/widget-models/details_tile.dart';
import 'package:oblio/widgets/accounts/header/social_links.dart';

class SocialLinks extends StatelessWidget {
  const SocialLinks({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.only(left: 15),
          child: Text('Social Links'.toUpperCase(),
              style: oblioTheme.primaryTextTheme.headline2),
        ),
        Container(
          padding: EdgeInsets.all(20),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.start,
            children: [
              DetailsTile(
                  icon: AccountSocialLinks(
                      icon: MdiIcons.linkedin,
                      background: HexColor('#2489BE'),
                      color: Colors.white),
                  title: 'Home Page',
                  content: 'linkedin.com/timothy'),
              Padding(
                padding: const EdgeInsets.only(left: 40),
                child: Divider(
                  thickness: 1,
                  color: Colors.grey[500],
                ),
              ),
              DetailsTile(
                icon: AccountSocialLinks(
                    icon: MdiIcons.facebook,
                    background: HexColor('#1877F2'),
                    color: Colors.white),
                title: 'Blog',
                content: 'facebook.com/timothy',
              ),
              Padding(
                padding: const EdgeInsets.only(left: 40),
                child: Divider(
                  thickness: 1,
                  color: Colors.grey[500],
                ),
              ),
              DetailsTile(
                icon: AccountSocialLinks(
                    icon: MdiIcons.twitter,
                    background: HexColor('#2DAAE1'),
                    color: Colors.white),
                title: 'Contact Page',
                content: 'twitter.com/timothy',
              ),
              Padding(
                padding: const EdgeInsets.only(left: 40),
                child: Divider(
                  thickness: 1,
                  color: Colors.grey[500],
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
