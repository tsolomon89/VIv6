import 'package:flutter/material.dart';
import 'package:hexcolor/hexcolor.dart';
import 'package:oblio/theme/colors.dart';
import 'package:oblio/theme/oblio_theme.dart';
import 'package:oblio/widgets/accounts/header/social_links.dart';
import 'package:material_design_icons_flutter/material_design_icons_flutter.dart';

class OrgDetails extends StatelessWidget {
  const OrgDetails({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: EdgeInsets.all(25),
        height: 160,
        decoration: BoxDecoration(
          color: oblioTheme.canvasColor,
          borderRadius: BorderRadius.all(
            Radius.circular(10),
          ),
          
        ),
        child: Container(
          child: Row(
            children: [
              Container(
                alignment: Alignment.topCenter,
                child: Image.asset(
                  'lib/assets/images/1.0x/ibm.png',
                  height: 100,
                  width: 100,
                ),
              ),
              Expanded(child: Container()),
              Container(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.start,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Text('Open'.toUpperCase(),
                            style: oblioTheme.textTheme.headline4),
                        Padding(
                          padding: const EdgeInsets.all(4.0),
                          child: Icon(
                            Icons.fiber_manual_record,
                            size: 6,
                          ),
                        ),
                        Text('Sql'.toUpperCase(),
                            style: oblioTheme.textTheme.headline4),
                        Padding(
                          padding: const EdgeInsets.all(4.0),
                          child: Icon(
                            Icons.fiber_manual_record,
                            size: 6,
                          ),
                        ),
                        Text('Created 29/11/20'.toUpperCase(),
                            style: oblioTheme.textTheme.headline4),
                      ],
                    ),
                    SizedBox(height: 2),
                    Text(
                      'IBM Corporation',
                      style: TextStyle(
                        fontSize: 22,
                        fontFamily: "Poppins",
                        color: Colors.grey[700],
                        fontWeight: FontWeight.w600,
                        fontStyle: FontStyle.normal,
                      ),
                    ),
                    SizedBox(height: 2),
                    Row(
                      children: [
                        Text('Computer Hardware',
                            style: oblioTheme.textTheme.headline4),
                        Padding(
                          padding: const EdgeInsets.all(4.0),
                          child: Icon(
                            Icons.fiber_manual_record,
                            size: 6,
                          ),
                        ),
                        Text(
                          'Technology',
                          style: oblioTheme.textTheme.headline4,
                        ),
                        Padding(
                          padding: const EdgeInsets.all(4.0),
                          child: Icon(
                            Icons.fiber_manual_record,
                            size: 6,
                          ),
                        ),
                        Text(
                          '5000+',
                          style: oblioTheme.textTheme.headline4,
                        ),
                        Padding(
                          padding: const EdgeInsets.all(4.0),
                          child: Icon(
                            Icons.fiber_manual_record,
                            size: 6,
                          ),
                        ),
                        Text(
                          '50M ARR',
                          style: oblioTheme.textTheme.headline4,
                        ),
                      ],
                    ),
                    SizedBox(height: 5),
                    Row(
                      children: [
                        Row(
                          children: [
                            Icon(
                              Icons.phone,
                              size: 16,
                              color: Colors.grey[600],
                            ),
                            SizedBox(width: 10),
                            Text('+44 788 255 2078',
                                style: oblioTheme.textTheme.headline4),
                          ],
                        ),
                        SizedBox(width: 25),
                        Row(children: [
                          Icon(
                            Icons.email,
                            size: 16,
                            color: Colors.grey[600],
                          ),
                          SizedBox(width: 10),
                          Text('maggie@ibmcorp.com',
                              style: oblioTheme.textTheme.headline4),
                        ]),
                      ],
                    ),
                  ],
                ),
              ),
              Expanded(child: Container()),
              Column(
                mainAxisAlignment: MainAxisAlignment.start,
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Container(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.start,
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Row(
                          children: [
                            Icon(Icons.favorite,
                                size: 18, color: CompanyColors.red[500]),
                            Icon(Icons.favorite,
                                size: 18, color: CompanyColors.red[500]),
                            Icon(Icons.favorite,
                                size: 18, color: CompanyColors.red[300]),
                            Icon(Icons.favorite,
                                size: 18, color: CompanyColors.red[100]),
                            Icon(Icons.favorite,
                                size: 18, color: CompanyColors.red[100]),
                          ],
                        ),
                        SizedBox(height: 2),
                        Text('Nov 10'.toUpperCase(),
                            style: oblioTheme.textTheme.caption),
                      ],
                    ),
                  ),
                  SizedBox(height: 35),
                  Row(
                    children: [
                      AccountSocialLinks(
                          icon: MdiIcons.viewCompact,
                          background: HexColor('#34CA87'),
                          color: Colors.white),
                      SizedBox(width: 10),
                      AccountSocialLinks(
                          icon: MdiIcons.linkedin,
                          background: HexColor('#2489BE'),
                          color: Colors.white),
                      SizedBox(width: 10),
                      AccountSocialLinks(
                          icon: MdiIcons.twitter,
                          background: HexColor('#2DAAE1'),
                          color: Colors.white),
                      SizedBox(width: 10),
                      AccountSocialLinks(
                          icon: MdiIcons.facebook,
                          background: HexColor('#1877F2'),
                          color: Colors.white),
                    ],
                  )
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
