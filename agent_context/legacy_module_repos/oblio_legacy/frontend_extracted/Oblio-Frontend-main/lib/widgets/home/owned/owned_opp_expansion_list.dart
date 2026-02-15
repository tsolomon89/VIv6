import 'package:flutter/material.dart';
import 'package:oblio/dummy.dart';
import 'package:oblio/objects.dart';
import '../../common/oblioListTile.dart';
import '../performers/performers_divider.dart';

class OwnedOppExpansionList extends StatelessWidget {
  const OwnedOppExpansionList({Key? key, required this.expanded})
      : super(key: key);

  final bool expanded;

  @override
  Widget build(BuildContext context) {
    // var data = [
    //   {
    //     'id': 'fK4ddutEpD2qQqOPPW1',
    //     'completion': {'stage': 'MQL', 'percent': 60},
    //     'title': ['Open', 'Renewal', 'IBM Corporation'],
    //     'subtitle': 'Standard Membership',
    //     'body': ['\$1500', '10/10/21', '14/01/22'],
    //     'health': {'date': 1636898944, 'score': 3.5}
    //   },
    //   {
    //     'id': 'fK4ddutEpD2qQqOPPW2',
    //     'completion': {'stage': 'SQL', 'percent': 10},
    //     'title': ['Open', 'Purchase', 'Salesforce'],
    //     'subtitle': 'Enterprise Membership',
    //     'body': ['\$8500', '15/10/21', '20/02/22'],
    //     'health': {'date': 1636553344, 'score': 1.5}
    //   },
    //   {
    //     'id': 'fK4ddutEpD2qQqOPPW3',
    //     'completion': {'stage': 'RET', 'percent': 40},
    //     'title': ['Open', 'Opportunity', 'Microsoft'],
    //     'subtitle': 'Enterprise Membership',
    //     'body': ['\$3200', '20/09/21', '25/02/22'],
    //     'health': {'date': 1634738944, 'score': 2.5}
    //   },
    //   {
    //     'id': 'fK4ddutEpD2qQqOPPW4',
    //     'completion': {'stage': 'MQL', 'percent': 30},
    //     'title': ['Open', 'Discovery', 'Cazoo'],
    //     'subtitle': 'Standard Membership',
    //     'body': ['\$9000', '13/09/21', '15/05/22'],
    //     'health': {'date': 1633529344, 'score': 2}
    //   },
    //   {
    //     'id': 'fK4ddutEpD2qQqOPPW5',
    //     'completion': {'stage': 'SQL', 'percent': 60},
    //     'title': ['Open', 'Purchase', 'Staples'],
    //     'subtitle': 'Standard Membership',
    //     'body': ['\$1200', '10/09/21', '16/05/22'],
    //     'health': {'date': 1631628544, 'score': 3.5}
    //   },
    //   {
    //     'id': 'fK4ddutEpD2qQqOPPW6',
    //     'completion': {'stage': 'RET', 'percent': 60},
    //     'title': ['Open', 'Opportunity', 'Microsoft'],
    //     'subtitle': 'Enterprise Membership',
    //     'body': ['\$8400', '14/11/21', '10/03/22'],
    //     'health': {'date': 1634738944, 'score': 2.5}
    //   },
    // ];

    var data = Database.data[Objects.Opps]!;

    return Column(
      children: [
        Container(
            height: this.expanded ? 700.0 : 400.0,
            child: ListView.builder(
                itemCount: data.length,
                itemBuilder: (context, i) {
                  return Column(
                    children: [
                      OblioTile(
                        object: 'opportunities',
                        data: data[i],
                        children: [Text('Placeholder')],
                      ),
                      if (i != data.length - 1) PerformersDivider()
                    ],
                  );
                }))
      ],
    );
  }
}
