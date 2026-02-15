import 'package:flutter/material.dart';
import 'package:hexcolor/hexcolor.dart';
import 'package:material_design_icons_flutter/material_design_icons_flutter.dart';
import 'package:oblio/oblio_icons.dart';
import 'package:oblio/widget-models/details_tile.dart';

import '../header/social_links.dart';

class TechnographicsDetails extends StatelessWidget {
  const TechnographicsDetails({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.only(left: 20, top: 20, right: 20, bottom: 0),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.start,
        children: [
          DetailsTile(
              icon: AccountSocialLinks(
                  icon: MdiIcons.linkedin,
                  background: HexColor('#2489BE'),
                  color: Colors.white),
              title: 'LINKEDIN',
              content: 'linkedin.com/in/GemmaDillon66493423'),
          Padding(
            padding: const EdgeInsets.only(left: 20, bottom: 14, top: 14),
            child: Divider(
              thickness: 1,
              color: Color.fromARGB(255, 211, 211, 211),
            ),
          ),
          DetailsTile(
            icon: Icon(
              Oblio.facebook,
              color: HexColor('#1877F2'),
              size: 35,
            ),
            title: 'FACEBOOK',
            content: 'facebook.com/people/Gemma-Dillon10',
          ),
          Padding(
            padding: const EdgeInsets.only(left: 20, bottom: 14, top: 14),
            child: Divider(
              thickness: 1,
              color: Color.fromARGB(255, 211, 211, 211),
            ),
          ),
          DetailsTile(
            icon: AccountSocialLinks(
                icon: MdiIcons.twitter,
                background: HexColor('#2DAAE1'),
                color: Colors.white),
            title: 'TWITTER',
            content: 'twitter.com/GemmaDillon9915972',
          ),
          Padding(
            padding: const EdgeInsets.only(left: 20, bottom: 14, top: 14),
            child: Divider(
              thickness: 1,
              color: Color.fromARGB(255, 211, 211, 211),
            ),
          ),
        ],
      ),
    );
  }
}
