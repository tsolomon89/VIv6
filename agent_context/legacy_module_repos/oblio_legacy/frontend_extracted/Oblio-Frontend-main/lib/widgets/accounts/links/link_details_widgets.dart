import 'package:flutter/material.dart';
import 'package:oblio/theme/oblio_theme.dart';
import 'package:oblio/widgets/accounts/common/common_title.dart';
import 'package:oblio/widgets/accounts/links/directory_links.dart';
import 'package:oblio/widgets/accounts/links/site_links.dart';
import 'package:oblio/widgets/accounts/links/social_links.dart';

import '../../../widget-models/details_tile.dart';

class LinksWidets extends StatefulWidget {
  const LinksWidets({Key? key}) : super(key: key);

  @override
  State<LinksWidets> createState() => _LinksWidetsState();
}

class _LinksWidetsState extends State<LinksWidets> {
  @override
  Widget build(BuildContext context) {
    return IntrinsicHeight(
      child: Container(
        padding: EdgeInsets.only(top: 20, right: 20),
        height: 800,
        child: ListView(
          shrinkWrap: true,
          children: [
            DetailsTile(
              icon: Container(),
              title: 'PRIMARY PERSONA'.toUpperCase(),
              content: 'B2B • Decision Maker',
            ),
            Padding(
              padding: const EdgeInsets.only(left: 20, bottom: 14, top: 14),
              child: Divider(
                thickness: 1,
                color: Color.fromARGB(255, 211, 211, 211),
              ),
            ),
            DetailsTile(
              icon: Container(),
              title: 'PRODUCT'.toUpperCase(),
              content: 'Standard Membership',
            ),
            Padding(
              padding: const EdgeInsets.only(left: 20, bottom: 14, top: 14),
              child: Divider(
                thickness: 1,
                color: Color.fromARGB(255, 211, 211, 211),
              ),
            ),
            DetailsTile(
              icon: Container(),
              title: 'USE CASES'.toUpperCase(),
              content: 'Search, Sell, Build Rapport',
            ),
            Padding(
              padding: const EdgeInsets.only(left: 20, bottom: 14, top: 14),
              child: Divider(
                thickness: 1,
                color: Color.fromARGB(255, 211, 211, 211),
              ),
            ),
            SizedBox(height: 10),
            DetailsTile(
                icon: Container(), title: 'Persona Fields'.toUpperCase()),
            SizedBox(height: 10),
            DetailsTile(
              icon: Container(),
              title: 'Filename'.toUpperCase(),
              content: 'Unknown',
              checkbox: false,
            ),
            Padding(
              padding: const EdgeInsets.only(left: 20, bottom: 14, top: 14),
              child: Divider(
                thickness: 1,
                color: Color.fromARGB(255, 211, 211, 211),
              ),
            ),
            DetailsTile(
              icon: Container(),
              title: 'Job Title'.toUpperCase(),
              content: 'Head of Employee Relations',
              checkbox: true,
            ),
            Padding(
              padding: const EdgeInsets.only(left: 20, bottom: 14, top: 14),
              child: Divider(
                thickness: 1,
                color: Color.fromARGB(255, 211, 211, 211),
              ),
            ),
            DetailsTile(
              icon: Container(),
              title: 'Department'.toUpperCase(),
              content: 'Human Resources',
              checkbox: true,
            ),
            Padding(
              padding: const EdgeInsets.only(left: 20, bottom: 14, top: 14),
              child: Divider(
                thickness: 1,
                color: Color.fromARGB(255, 211, 211, 211),
              ),
            ),
            DetailsTile(
              icon: Container(),
              title: 'Seniority'.toUpperCase(),
              content: 'Director',
              checkbox: true,
            ),
            Padding(
              padding: const EdgeInsets.only(left: 20, bottom: 14, top: 14),
              child: Divider(
                thickness: 1,
                color: Color.fromARGB(255, 211, 211, 211),
              ),
            ),
            DetailsTile(
              icon: Container(),
              title: 'Industry'.toUpperCase(),
              content: 'Information Technology',
              checkbox: true,
            ),
            Padding(
              padding: const EdgeInsets.only(left: 20, bottom: 14, top: 14),
              child: Divider(
                thickness: 1,
                color: Color.fromARGB(255, 211, 211, 211),
              ),
            ),
            DetailsTile(
              icon: Container(),
              title: 'Sector'.toUpperCase(),
              content: 'Technology',
              checkbox: true,
            ),
            Padding(
              padding: const EdgeInsets.only(left: 20, bottom: 14, top: 14),
              child: Divider(
                thickness: 1,
                color: Color.fromARGB(255, 211, 211, 211),
              ),
            ),
            DetailsTile(
              icon: Container(),
              title: 'Company Size'.toUpperCase(),
              content: '5000+',
              checkbox: true,
            ),
            Padding(
              padding: const EdgeInsets.only(left: 20, bottom: 14, top: 14),
              child: Divider(
                thickness: 1,
                color: Color.fromARGB(255, 211, 211, 211),
              ),
            ),
            DetailsTile(
              icon: Container(),
              title: 'Technology Profile'.toUpperCase(),
              content: 'Salesforce',
              checkbox: true,
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
      ),
    );
  }
}
