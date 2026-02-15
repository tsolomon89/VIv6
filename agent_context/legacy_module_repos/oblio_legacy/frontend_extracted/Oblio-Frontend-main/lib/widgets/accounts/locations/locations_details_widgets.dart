import 'package:flutter/material.dart';
import 'package:oblio/widgets/accounts/common/common_title.dart';
import 'package:oblio/widgets/accounts/locations/locations_block_list.dart';
import 'package:oblio/widgets/accounts/locations/locations_details.dart';

class LocationsDetailsWidets extends StatefulWidget {
  const LocationsDetailsWidets({Key? key}) : super(key: key);

  @override
  State<LocationsDetailsWidets> createState() => _LocationsDetailsWidetsState();
}

class _LocationsDetailsWidetsState extends State<LocationsDetailsWidets> {
  @override
  Widget build(BuildContext context) {
    return IntrinsicHeight(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          AccountCommonTitle(title: 'Account Locations'),
          SizedBox(height: 5),
          LocationsBlockList()
        ],
      ),
    );
  }
}
