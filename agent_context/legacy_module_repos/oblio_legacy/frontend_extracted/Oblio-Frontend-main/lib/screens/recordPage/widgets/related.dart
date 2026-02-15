import 'package:flutter/material.dart';
import 'package:oblio/dummy.dart';
import 'package:oblio/objects.dart';
import 'package:oblio/widgets/common/oblioListTile.dart';
import 'package:oblio/widgets/home/common/long-card.dart';

class Related extends StatelessWidget {
  final String name;

  const Related({Key? key, required this.name}) : super(key: key);

  //TODO: this will import data from one specific account (for example)

  @override
  Widget build(BuildContext context) {
    Map company = Database.data['accounts']!
        .where((row) => (row["companyName"].contains(name)))
        .toList()[0];
    var data = {
      'accountType': 'customer',
      'status': 'open',
      'stage': 'renewal',
      'companyName': name,
      'companyIndustry': 'Information Industry',
      'startDate': '5000+ Employees',
      'endDate': '\$50M+ ARR'
    };
    return LongCard(
        child: Column(children: [
          Image.asset(
            'lib/assets/logos/Acme Corporation.png',
            width: 310,
            filterQuality: FilterQuality.high,
          ),
          Container(
              margin: EdgeInsets.only(bottom: 10),
              child:
                  OblioTile(object: Objects.Accounts, data: data, children: []))
        ]),
        expanded: false,
        title: 'RELATED ACCOUNT',
        onPress: () {});
  }
}
