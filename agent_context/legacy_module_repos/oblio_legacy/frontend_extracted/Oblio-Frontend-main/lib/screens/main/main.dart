import 'package:flutter/material.dart';
import 'package:lottie/lottie.dart';
import 'package:oblio/objects.dart';
import 'package:oblio/screens/accounts/accounts.dart';
import 'package:oblio/screens/construction/construction.dart';
import 'package:oblio/screens/home/home.dart';
import 'package:oblio/screens/recordPage/recordPage.dart';
import 'package:oblio/screens/table/oblioTable.dart';
import 'package:oblio/theme/oblio_theme.dart';
import 'package:oblio/widgets/header/header.dart';
import 'package:oblio/widgets/left-menu/left_menu.dart';
import 'package:oblio/widgets/right-menu/right_menu.dart';
import 'package:oblio/widgets/right-menu/right_window.dart';

import '../../widgets/accounts/common/dualButtons.dart';
import '../../widgets/home/owned/owned_opp_widgets.dart';

class MainScreen extends StatelessWidget {
  final String route;

  const MainScreen({Key? key, required this.route}) : super(key: key);

  void _launchTutorial(
      {required BuildContext context, required BoxConstraints constraints}) {
    var style1 = TextStyle(
        color: Colors.white,
        fontFamily: 'Poppins',
        fontStyle: FontStyle.normal,
        fontWeight: FontWeight.w500,
        fontSize: 19);
    var style2 = TextStyle(
        color: Colors.white,
        fontFamily: 'Poppins',
        fontStyle: FontStyle.normal,
        fontWeight: FontWeight.w400,
        fontSize: 16);

    Widget stageCircle(stage, color, firstText, lastText) {
      return Row(
        children: [
          Container(
              width: 70,
              height: 70,
              decoration: new BoxDecoration(
                color: color,
                shape: BoxShape.circle,
              ),
              child: Center(
                  child: Text(
                stage,
                style: TextStyle(
                    color: Colors.white,
                    fontFamily: 'Poppins',
                    fontStyle: FontStyle.normal,
                    fontWeight: FontWeight.w700,
                    fontSize: 27),
              ))),
          Padding(
            padding: EdgeInsets.only(left: 20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(firstText, style: style1),
                Text(lastText, style: style2),
              ],
            ),
          )
        ],
      );
    }

    ;

    return Overlay.of(context)!.insert(OverlayEntry(
        builder: (context) => Positioned(
              width: MediaQuery.of(context).size.width - 70,
              height: constraints.maxHeight,
              left: 0,
              top: MediaQuery.of(context).size.height - constraints.maxHeight,
              child: Material(
                color: Color.fromARGB(232, 27, 27, 27),
                elevation: 4.0,
                child: Flex(
                  direction: Axis.horizontal,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      color: Color.fromRGBO(255, 254, 254, 1),
                      width: 300,
                      padding: EdgeInsets.all(20),
                      child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'WELCOME TO OBLIO!',
                              style: TextStyle(
                                  fontFamily: 'Poppins',
                                  fontStyle: FontStyle.normal,
                                  fontSize: 20,
                                  color: Color.fromARGB(255, 114, 114, 114),
                                  fontWeight: FontWeight.w600),
                            ),
                            SizedBox(height: 15),
                            Text(
                              'Oblio tracks performance with two Opportunities' +
                                  ' and Activities!',
                              style: TextStyle(
                                  fontFamily: 'Poppins',
                                  fontStyle: FontStyle.normal,
                                  fontSize: 16,
                                  color: Color.fromARGB(255, 114, 114, 114),
                                  fontWeight: FontWeight.w500),
                            ),
                            Spacer(),
                            DualButton(leftLabel: 'LAST', rightLabel: 'NEXT'),
                          ]),
                    ),
                    Flexible(
                      child: Center(
                        child: ConstrainedBox(
                          constraints: BoxConstraints(maxWidth: 1100),
                          child: Container(
                            padding: EdgeInsets.all(20),
                            child: Column(
                                mainAxisAlignment: MainAxisAlignment.start,
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'OPPORTUNITIES',
                                    style: TextStyle(
                                        color: Colors.white,
                                        fontFamily: 'Poppins',
                                        fontStyle: FontStyle.normal,
                                        fontWeight: FontWeight.w600,
                                        fontSize: 29),
                                  ),
                                  Padding(
                                    padding:
                                        EdgeInsets.only(top: 20, bottom: 50),
                                    child: Text(
                                      'OPPORTUNITIES relate many CONTACTS or ACCOUNTS to one purchasing process.' +
                                          ' This process is separated into OPPORTUNITY STAGES. Each stage tracks ' +
                                          'QUALIFIERS and special ACTIVITIES, defined when creating a PRODUCT. ' +
                                          'When a threshold of these is reached, an opportunity is automatically' +
                                          ' created/modified, and related to a USER.',
                                      style: TextStyle(
                                          color: Colors.white,
                                          fontFamily: 'Poppins',
                                          fontStyle: FontStyle.normal,
                                          fontWeight: FontWeight.w500,
                                          fontSize: 17),
                                    ),
                                  ),
                                  Row(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        Column(
                                          crossAxisAlignment:
                                              CrossAxisAlignment.start,
                                          children: [
                                            Text('OPPORTUNITY STAGES',
                                                style: TextStyle(
                                                    color: Colors.white,
                                                    fontFamily: 'Poppins',
                                                    fontStyle: FontStyle.normal,
                                                    fontWeight: FontWeight.w700,
                                                    fontSize: 20)),
                                            SizedBox(height: 20),
                                            stageCircle(
                                                'MQL',
                                                Color.fromRGBO(
                                                    112, 129, 210, 1),
                                                'MARKETING QUALIFIED LEAD (MQL)',
                                                'Activities to acquire or create' +
                                                    ' Contact and Account data.'),
                                            SizedBox(height: 30),
                                            stageCircle(
                                                'SQL',
                                                Color.fromRGBO(
                                                    253, 193, 109, 1),
                                                'SALES QUALIFIED LEAD (SQL)',
                                                'Activities to communicate with Contacts' +
                                                    ' to validate data.'),
                                            SizedBox(height: 30),
                                            stageCircle(
                                                'CQL',
                                                Color.fromRGBO(
                                                    255, 135, 135, 1),
                                                'CUSTOMER QUALIFIED LEAD (CQL)',
                                                'Activities that must be complete' +
                                                    ' to fulfill the purchase'),
                                            SizedBox(height: 30),
                                            stageCircle(
                                                'RQL',
                                                Color.fromRGBO(52, 202, 135, 1),
                                                'RETENTION QUALIFIED LEAD (RQL)',
                                                'Activities that must be complete' +
                                                    'for a secondary purchase')
                                          ],
                                        ),
                                        Padding(
                                          padding: EdgeInsets.only(left: 40),
                                          child: Column(
                                            crossAxisAlignment:
                                                CrossAxisAlignment.start,
                                            children: [
                                              Text(
                                                'OPPORTUNITY TILES',
                                                style: TextStyle(
                                                    color: Colors.white,
                                                    fontFamily: 'Poppins',
                                                    fontStyle: FontStyle.normal,
                                                    fontWeight: FontWeight.w500,
                                                    fontSize: 20),
                                              ),
                                              SizedBox(height: 10),
                                              Container(
                                                  width: 400,
                                                  height: 540,
                                                  child: OwnedOppWidets())
                                            ],
                                          ),
                                        )
                                      ]),
                                ]),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            )));
  }

  @override
  Widget build(BuildContext context) {
    RegExp routeExp =
        new RegExp(r"^(?:\/([^\/#\?]+?))(?:\/([^\/#\?]+?))?[\/#\?]?$");
    RegExpMatch? match = routeExp.firstMatch(route);

    screens() {
      if (match != null && Objects.valid.contains(match[1])) {
        if (match[1] == 'dashboard') {
          return HomeScreen();
        } else if (match[1] == 'setup') {
          //TODO: WidgetsBinding.instance observer could be worth looking into (for loading)

          return Expanded(
            child: LayoutBuilder(builder: (context, constraints) {
              if (route == '/setup') {
                WidgetsBinding.instance!.addPostFrameCallback((_) =>
                    _launchTutorial(
                        context: context, constraints: constraints));
              }
              return Flex(direction: Axis.horizontal, children: [HomeScreen()]);
            }),
          );
        } else if (Objects.construction.contains(match[1])) {
          return Construction();
        } else if (match[2] != null) {
          return RecordPage(id: match[2]!, object: match[1]!);
          //return AccountsScreen();
        } else {
          return OblioTable(
            object: route.substring(1),
          );
        }
      } else {
        return pageNotFound();
      }
    }

    return Scaffold(
      backgroundColor: oblioTheme.canvasColor,
      appBar: PreferredSize(
        preferredSize: Size.fromHeight(60),
        child: HomeHeader(match: match),
      ),
      body: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Visibility(
            visible: MediaQuery.of(context).size.width < 900 ? false : true,
            child: LeftMenu(
                route: match != null &&
                        Objects.valid.contains(match[1]) &&
                        match[2] != null
                    ? [match[1]!, match[2]!]
                    : []),
          ),
          Container(child: screens()),
          if (MediaQuery.of(context).size.width > 900) activityBar()
        ],
      ),
    );
  }

  Widget activityBar() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.end,
      children: [RightMenu(), VerticalDivider(width: 1), RightWindow()],
    );
  }

  Widget pageNotFound() {
    return Flexible(
      flex: 1,
      child: Container(
        padding: EdgeInsets.only(top: 60),
        child: Column(mainAxisAlignment: MainAxisAlignment.start, children: [
          Container(
              width: 600,
              height: 400,
              margin: EdgeInsets.only(bottom: 60),
              child: Lottie.asset('lib/assets/animations/search.json',
                  fit: BoxFit.contain)),
          Text(
            'Error 404',
            style: TextStyle(
                fontSize: 40,
                fontFamily: 'Poppins',
                fontStyle: FontStyle.normal,
                fontWeight: FontWeight.w600),
          ),
          Text(
            'Page not Found!',
            style: TextStyle(
                fontSize: 20,
                fontFamily: 'Poppins',
                fontStyle: FontStyle.normal,
                fontWeight: FontWeight.w400),
          )
        ]),
      ),
    );
  }
}
