import 'package:flutter/material.dart';
import 'package:oblio/dummy.dart';
import 'package:oblio/objects.dart';
import 'package:oblio/screens/construction/construction.dart';
import 'package:oblio/screens/recordPage/widgets/related.dart';
import 'package:oblio/widgets/common/oblioListTile.dart';
import 'package:oblio/widgets/home/common/short-card.dart';

import '../../widgets/accounts/attribution/contact_attribution_widgets.dart';
import '../../widgets/accounts/common/long-card.dart';
import '../../widgets/accounts/common/short-card.dart';
import '../../widgets/accounts/contact-activity/contact_activity_widgets.dart';
import '../../widgets/accounts/contact-details/contact_details_widgets.dart';
import '../../widgets/accounts/created-by/created_contacts_widgets.dart';
import '../../widgets/accounts/firmographics/firmographics_details_widgets.dart';
import '../../widgets/accounts/links/link_details_widgets.dart';
import '../../widgets/accounts/locations/locations_details_widgets.dart';
import '../../widgets/accounts/opps/account_opp_widgets.dart';
import '../../widgets/accounts/primary/primary_contacts_widgets.dart';
import '../../widgets/accounts/related/related_contacts_widgets.dart';
import '../../widgets/accounts/technographics/technographics_details_widgets.dart';

class RecordPage extends StatefulWidget {
  final String id;
  final String object;
  const RecordPage({Key? key, required this.id, required this.object})
      : super(key: key);

  @override
  State<RecordPage> createState() => _RecordPageState();
}

class _RecordPageState extends State<RecordPage> {
  String viewport = 'Overview';

  Map viewRoutes = {
    'Overview': [
      Related(name: 'Acme Corporation'),
      ContactActivityWidets(),
      ContactAttributionWidgets(),
      AccountOppWidets(),
      //RelatedContactsWidets(),
    ],
    'Details': [
      ShortCard(
        height: 260,
        child: ContactDetailsWidets(),
        title: 'WORK CONTACT DETAILS',
      ),
      ShortCard(
        height: 315,
        child: FirmographicsDetailsWidets(),
        title: 'WORK HISTORY',
      ),
      ShortCard(
          height: 900,
          title: 'PRODUCT PERSONA ATTRIBUTION',
          child: LinksWidets()),
      ShortCard(
        height: 270,
        child: TechnographicsDetailsWidets(),
        title: 'CONTACT LINKS',
      ),
      // ShortCard(
      //   child: LocationsDetailsWidets(),
      //   title: 'ACCOUNT LOCATIONS',
      // ),

      ShortCard(
        child: CreatedByWidets(),
        title: 'USER ATTRIBUTION',
      ),
      // ShortCard(
      //     title: 'ACQUISITION ATTRIBUTION', child: PrimaryContactsWidets()),
    ],
    'Activity': [Construction()],
    'Versions': [Construction()]
  };

  @override
  Widget build(BuildContext context) {
    Map data = Database.data[widget.object]!
        .where((row) => (row["id"].contains(widget.id)))
        .toList()[0];

    //record(field) => data[Objects.fieldMappings[widget.object]![field]];

    List<Map> insightData = [
      {'title': '42 Days', 'subtitle': 'Since last contact', 'down': true},
      {'title': '9 Open', 'subtitle': 'Account Opportunities', 'down': true},
      {'title': '83 New', 'subtitle': 'Activities this week', 'down': false}
    ];

    return Expanded(
      child: SingleChildScrollView(
        controller: new ScrollController(),
        child: LayoutBuilder(
            builder: (BuildContext context, BoxConstraints constraints) {
          double width =
              constraints.maxWidth < 800 ? 1 : constraints.maxWidth / 440;
          int columns = int.parse((width).toStringAsFixed(0));
          columns = columns > 4 ? 4 : columns;

          return width == 1
              ? Column(
                  children: [
                    OblioTile(object: widget.object, data: data, grow: true),
                    SizedBox(height: 10),
                    navigator(),
                  ],
                )
              : Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Flexible(
                      flex: columns - 1,
                      child: Column(
                        children: [
                          if (constraints.maxWidth < 1100) SizedBox(height: 10),
                          OblioTile(
                              object: widget.object, data: data, grow: true),
                          SizedBox(height: 10),
                          navigator(),
                          Align(
                              alignment: Alignment.topCenter,
                              child: Padding(
                                padding: const EdgeInsets.all(10.0),
                                child: Builder(
                                    builder: (BuildContext innerContext) {
                                  return Row(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    mainAxisAlignment:
                                        MainAxisAlignment.spaceAround,
                                    children: [
                                      for (var index = 1;
                                          index <= columns - 1;
                                          index++)
                                        // TODO: Fix unnecessary widget re-builds when moved around

                                        if (index == columns - 1)
                                          cardWidget(index, columns, width)
                                        else
                                          cardWidget(index, columns, width)
                                    ],
                                  );
                                }),
                              ))
                        ],
                      ),
                    ),
                    if (constraints.maxWidth > 800)
                      rightColumn(insightData, columns, width)
                  ],
                );
        }),
      ),
    );
  }

  Widget navigator() {
    return Padding(
      padding: const EdgeInsets.only(left: 18.0),
      child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
        for (var item in viewRoutes.entries)
          GestureDetector(
            onTap: (() {
              setState(() {
                viewport = item.key;
              });
            }),
            child: Container(
              width: 100,
              child: Column(
                children: [
                  Text(
                    item.key.toString().toUpperCase(),
                    style: TextStyle(
                        fontFamily: 'Poppins',
                        fontSize: 13,
                        fontWeight: FontWeight.w400,
                        color: viewport == item.key
                            ? Color.fromRGBO(95, 120, 228, 1)
                            : Color.fromARGB(255, 117, 117, 117),
                        letterSpacing: 1.4,
                        fontStyle: FontStyle.normal),
                  ),
                  if (viewport == item.key)
                    Container(
                        margin: EdgeInsets.only(top: 10),
                        height: 2.3,
                        width: 95,
                        decoration: new BoxDecoration(
                            color: Color.fromRGBO(95, 120, 228, 1),
                            borderRadius: new BorderRadius.only(
                              topLeft: const Radius.circular(50.0),
                              topRight: const Radius.circular(50.0),
                            )))
                ],
              ),
            ),
          )
      ]),
    );
  }

  Widget rightColumn(insightData, columns, width) {
    return Flexible(
      flex: 1,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
              //height: 210,
              padding: EdgeInsets.symmetric(vertical: 20, horizontal: 10),
              child: ShortCard(
                height: 101,
                textColor: Colors.white,
                background: Color.fromARGB(255, 87, 187, 142),
                //background: Color.fromRGBO(98, 123, 229, 1),
                headerIcon: Icons.insights,
                title: 'INSIGHTS',
                child: Container(
                  margin: EdgeInsets.only(top: 3),
                  padding: EdgeInsets.symmetric(horizontal: 20),
                  child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Flexible(
                          flex: 5,
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            mainAxisAlignment: MainAxisAlignment.start,
                            children: [
                              Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                mainAxisAlignment: MainAxisAlignment.start,
                                children: [
                                  Icon(
                                    Icons.arrow_circle_up_outlined,
                                    color: Colors.white,
                                    size: 38,
                                  ),
                                  SizedBox(width: 10),
                                  Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    mainAxisAlignment: MainAxisAlignment.start,
                                    children: [
                                      Text(
                                        '888% ROI',
                                        style: TextStyle(
                                            color: Colors.white,
                                            fontSize: 20,
                                            fontFamily: 'Poppins',
                                            fontStyle: FontStyle.normal,
                                            fontWeight: FontWeight.w600),
                                      ),
                                      SizedBox(height: 1),
                                      Text('if CUS is won',
                                          style: TextStyle(
                                              color: Colors.white,
                                              fontSize: 14,
                                              fontFamily: 'Poppins',
                                              fontStyle: FontStyle.normal,
                                              fontWeight: FontWeight.w500))
                                    ],
                                  ),
                                ],
                              ),
                              SizedBox(height: 10),
                              Row(children: [
                                Text('opportunity value',
                                    style: TextStyle(
                                        color: Colors.white,
                                        fontSize: 12,
                                        fontFamily: 'Poppins',
                                        fontStyle: FontStyle.normal,
                                        fontWeight: FontWeight.w500)),
                                Spacer(),
                                Text('\$888.3K',
                                    style: TextStyle(
                                        color: Colors.white,
                                        fontSize: 12,
                                        fontFamily: 'Poppins',
                                        fontStyle: FontStyle.normal,
                                        fontWeight: FontWeight.w600))
                              ]),
                              Row(children: [
                                Text('activities cost',
                                    style: TextStyle(
                                        color: Colors.white,
                                        fontSize: 12,
                                        fontFamily: 'Poppins',
                                        fontStyle: FontStyle.normal,
                                        fontWeight: FontWeight.w500)),
                                Spacer(),
                                Text('\$888.8K',
                                    style: TextStyle(
                                        color: Colors.white,
                                        fontSize: 12,
                                        fontFamily: 'Poppins',
                                        fontStyle: FontStyle.normal,
                                        fontWeight: FontWeight.w600))
                              ])
                            ],
                          ),
                        ),
                        Flexible(
                            child: VerticalDivider(
                          width: 0,
                          color: Color.fromARGB(74, 255, 255, 255),
                        )),
                        Flexible(
                          flex: 5,
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            mainAxisAlignment: MainAxisAlignment.start,
                            children: [
                              Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                mainAxisAlignment: MainAxisAlignment.start,
                                children: [
                                  Icon(
                                    Icons.arrow_circle_up_outlined,
                                    color: Colors.white,
                                    size: 38,
                                  ),
                                  SizedBox(width: 10),
                                  Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    mainAxisAlignment: MainAxisAlignment.start,
                                    children: [
                                      Text(
                                        '88% CONV.',
                                        style: TextStyle(
                                            color: Colors.white,
                                            fontSize: 20,
                                            fontFamily: 'Poppins',
                                            fontStyle: FontStyle.normal,
                                            fontWeight: FontWeight.w600),
                                      ),
                                      SizedBox(height: 1),
                                      Text('that CUS IS won',
                                          style: TextStyle(
                                              color: Colors.white,
                                              fontSize: 14,
                                              fontFamily: 'Poppins',
                                              fontStyle: FontStyle.normal,
                                              fontWeight: FontWeight.w500))
                                    ],
                                  ),
                                ],
                              ),
                              SizedBox(height: 10),
                              Row(children: [
                                Text('flows remaining',
                                    style: TextStyle(
                                        color: Colors.white,
                                        fontSize: 12,
                                        fontFamily: 'Poppins',
                                        fontStyle: FontStyle.normal,
                                        fontWeight: FontWeight.w500)),
                                Spacer(),
                                Text('13 steps',
                                    style: TextStyle(
                                        color: Colors.white,
                                        fontSize: 12,
                                        fontFamily: 'Poppins',
                                        fontStyle: FontStyle.normal,
                                        fontWeight: FontWeight.w600))
                              ]),
                              Row(children: [
                                Text('next step conv. rate',
                                    style: TextStyle(
                                        color: Colors.white,
                                        fontSize: 12,
                                        fontFamily: 'Poppins',
                                        fontStyle: FontStyle.normal,
                                        fontWeight: FontWeight.w500)),
                                Spacer(),
                                Text('34%',
                                    style: TextStyle(
                                        color: Colors.white,
                                        fontSize: 12,
                                        fontFamily: 'Poppins',
                                        fontStyle: FontStyle.normal,
                                        fontWeight: FontWeight.w600))
                              ])
                            ],
                          ),
                        ),
                        // for (var i = 0; i < insightData.length; i++) ...[
                        //   Flexible(
                        //     flex: 4,
                        //     child: Column(
                        //       crossAxisAlignment: CrossAxisAlignment.start,
                        //       children: [
                        //         Container(
                        //           padding: EdgeInsets.only(bottom: 10),
                        //           child: Row(
                        //             children: [
                        //               Icon(
                        //                 insightData[i]['down']
                        //                     ? Icons.arrow_circle_down
                        //                     : Icons.arrow_circle_up,
                        //                 size: 20,
                        //                 color: insightData[i]['down']
                        //                     ? Color.fromARGB(255, 223, 166, 166)
                        //                     : Color.fromARGB(
                        //                         255, 166, 223, 168),
                        //               ),
                        //               Padding(
                        //                 padding:
                        //                     const EdgeInsets.only(left: 5.0),
                        //                 child: Text(
                        //                   insightData[i]['title'],
                        //                   style: TextStyle(
                        //                       color: Colors.white,
                        //                       fontSize: 15,
                        //                       fontFamily: 'Poppins',
                        //                       fontWeight: FontWeight.w600),
                        //                 ),
                        //               ),
                        //             ],
                        //           ),
                        //         ),
                        //         Text(insightData[i]['subtitle'],
                        //             style: TextStyle(
                        //                 color: Colors.white,
                        //                 fontSize: 13,
                        //                 fontFamily: 'Poppins',
                        //                 fontWeight: FontWeight.w400)),
                        //       ],
                        //     ),
                        //   ),
                        //   if (i != 2)
                        //     Flexible(
                        //         child: VerticalDivider(
                        //       width: 0,
                        //       color: Color.fromARGB(74, 255, 255, 255),
                        //     ))
                        // ]
                      ]),
                ),
              )),
          for (var i = columns - 1;
              i < viewRoutes[viewport].length;
              i += columns)
            Padding(
              padding: EdgeInsets.all(width < 1200 ? 7 : 10),
              child: viewRoutes[viewport][i],
            ),
        ],
      ),
    );
  }

  Widget cardWidget(index, columns, width) {
    return Expanded(
      child: Column(children: [
        for (var i = index - 1; i < viewRoutes[viewport].length; i += columns)
          Padding(
            padding: EdgeInsets.all(width < 1200 ? 7 : 10),
            child: viewRoutes[viewport][i],
          ),
      ]),
    );
  }
}
