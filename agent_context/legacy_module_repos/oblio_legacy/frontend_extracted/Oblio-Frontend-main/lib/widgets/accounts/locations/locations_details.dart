import 'package:flutter/material.dart';
import 'package:oblio/widget-models/details_tile.dart';

class LocationsDetails extends StatelessWidget {
  const LocationsDetails({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 440,
      padding: EdgeInsets.only(left: 10, top: 20, right: 20 , bottom: 20),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.start,
        children: [
          DetailsTile(
              icon: Container(),
              title: 'Industry'.toUpperCase(),
              content: 'Internet Technology'),
          Padding(
            padding: const EdgeInsets.only(left: 25),
            child: Divider(
              thickness: 1,
              color: Colors.grey[500],
            ),
          ),
          DetailsTile(
            icon: Container(),
            title: 'Sector'.toUpperCase(),
            content: 'Software',
          ),
          Padding(
            padding: const EdgeInsets.only(left: 25),
            child: Divider(
              thickness: 1,
              color: Colors.grey[500],
            ),
          ),
          DetailsTile(
            icon: Container(),
            title: 'Company Size'.toUpperCase(),
            content: '5000 +',
          ),
          Padding(
            padding: const EdgeInsets.only(left: 25),
            child: Divider(
              thickness: 1,
              color: Colors.grey[500],
            ),
          ),
          DetailsTile(
            icon: Container(),
            title: 'Estimated Revenue'.toUpperCase(),
            content: '50M+ ARR',
          ),
          Padding(
            padding: const EdgeInsets.only(left: 25),
            child: Divider(
              thickness: 1,
              color: Colors.grey[500],
            ),
          ),
        ],
      ),
    );
  }
}
