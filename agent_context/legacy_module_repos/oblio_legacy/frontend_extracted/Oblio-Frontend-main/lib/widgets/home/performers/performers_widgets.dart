import 'package:flutter/material.dart';
import 'package:oblio/dummy.dart';
import 'package:oblio/widgets/common/oblioListTile.dart';
import 'package:oblio/widgets/home/common/short-card.dart';
import 'package:oblio/widgets/home/performers/performers_divider.dart';

class PerformersWidgets extends StatefulWidget {
  const PerformersWidgets({Key? key}) : super(key: key);

  @override
  State<PerformersWidgets> createState() => _PerformersWidgetsState();
}

class _PerformersWidgetsState extends State<PerformersWidgets> {
  List<String> list = ['All Time', 'Day', 'Week', 'Month', 'Quarter', 'Year'];

  // var data = {
  //   'image': 'lib/assets/images/1.0x/avatar1.png',
  //   'title': ['Sales', 'Senior', 'Gamma'],
  //   'subtitle': 'Matthew John',
  //   'body': ['£1500', '10/01/21', '25/05/21'],
  //   'health': {'date': 1648642168, 'score': 2.0},
  //   'completion': {'stage': 'MQL', 'percent': 60},
  //   'performance': {'MQL': 23.0, 'SQL': 54.0, 'CUS': 32.0, 'RET': 10.0},
  //   'activities': 322
  // };

  // var data = [
  //   {
  //     'id': 'fK4ddutEpD2qQqSUSPW1',
  //     'profilePicture': 'lib/assets/images/1.0x/avatar1.png',
  //     'department': 'Sales',
  //     'experience': 'Senior',
  //     'stage': 'Gamma',
  //     'fullName': 'Matthew John',
  //     'userPerformance': {'MQL': 23.0, 'SQL': 54.0, 'CUS': 32.0, 'RET': 10.0},
  //     'userActivities': 322
  //   },
  //   {
  //     'id': 'fK4ddutEpD2qQqSUSPW2',
  //     'image': 'lib/assets/images/1.0x/avatar2.png',
  //     'title': ['Marketing', 'Junior', 'Alpha'],
  //     'subtitle': 'Benjamin Dover',
  //     'performance': {'MQL': 67.0, 'RET': 33.0},
  //     'activities': 43
  //   },
  //   {
  //     'id': 'fK4ddutEpD2qQqSUSPW3',
  //     'image': 'lib/assets/images/1.0x/avatar3.png',
  //     'title': ['Marketing', 'Senior', 'Alpha'],
  //     'subtitle': 'Elizabeth Kin',
  //     'performance': {'MQL': 23.0, 'SQL': 61.0, 'CUS': 12.0, 'RET': 2.0},
  //     'activities': 999
  //   }
  // ];

  var data = Database.data['users']!;

  @override
  Widget build(BuildContext context) {
    return ShortCard(
        subtitle: 'TOP PERSONAL',
        dropdownValues: list,
        title: 'TOP PERFORMERS',
        child: ListView.builder(
            itemCount: 3,
            itemBuilder: (context, i) {
              return Column(
                children: [
                  OblioTile(object: 'users', data: data[i], index: i + 1),
                  if (i != 2) PerformersDivider()
                ],
              );
            }));
  }
}
