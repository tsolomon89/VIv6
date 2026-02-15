import 'package:flutter/material.dart';
import 'package:oblio/widgets/accounts/locations/locations_block.dart';

class LocationsBlockList extends StatelessWidget {
  const LocationsBlockList({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Container(
          height: 440,
          child: ListView(
            shrinkWrap: true,
            children: [
              LocationsBlock(
                type: 'Primary Address'.toUpperCase(),
                title: 'New York City'.toUpperCase(),
                tags: 'Office 14'.toUpperCase(),
                tags2: 'Any st.'.toUpperCase(),
                details: 'NY, United States of America'.toUpperCase(),
              ),
              Padding(
                padding: const EdgeInsets.only(left: 30, right: 20),
                child: Divider(
                  thickness: 1,
                  color: Colors.grey[500],
                ),
              ),
              LocationsBlock(
                type: 'Billing Address'.toUpperCase(),
                title: 'New York City'.toUpperCase(),
                tags: 'Office 14'.toUpperCase(),
                tags2: 'Any st.'.toUpperCase(),
                details: 'NY, United States of America'.toUpperCase(),
              ),
              Padding(
                padding: const EdgeInsets.only(left: 30, right: 20),
                child: Divider(
                  thickness: 1,
                  color: Colors.grey[500],
                ),
              ),
              LocationsBlock(
                type: 'Corporate Address'.toUpperCase(),
                title: 'New York City'.toUpperCase(),
                tags: 'Office 14'.toUpperCase(),
                tags2: 'Any st.'.toUpperCase(),
                details: 'NY, United States of America'.toUpperCase(),
              ),
              Padding(
                padding: const EdgeInsets.only(left: 30, right: 20),
                child: Divider(
                  thickness: 1,
                  color: Colors.grey[500],
                ),
              ),
              LocationsBlock(
                type: 'Other Address'.toUpperCase(),
                title: 'New York City'.toUpperCase(),
                tags: 'Office 14'.toUpperCase(),
                tags2: 'Any st.'.toUpperCase(),
                details: 'NY, United States of America'.toUpperCase(),
              ),
              Padding(
                padding: const EdgeInsets.only(left: 30, right: 20),
                child: Divider(
                  thickness: 1,
                  color: Colors.grey[500],
                ),
              ),
              LocationsBlock(
                type: 'Other Address'.toUpperCase(),
                title: 'New York City'.toUpperCase(),
                tags: 'Office 14'.toUpperCase(),
                tags2: 'Any st.'.toUpperCase(),
                details: 'NY, United States of America'.toUpperCase(),
              ),
              Padding(
                padding: const EdgeInsets.only(left: 30, right: 20),
                child: Divider(
                  thickness: 1,
                  color: Colors.grey[500],
                ),
              ),
              LocationsBlock(
                type: 'Other Address'.toUpperCase(),
                title: 'New York City'.toUpperCase(),
                tags: 'Office 14'.toUpperCase(),
                tags2: 'Any st.'.toUpperCase(),
                details: 'NY, United States of America'.toUpperCase(),
              ),
              Padding(
                padding: const EdgeInsets.only(left: 30, right: 20),
                child: Divider(
                  thickness: 1,
                  color: Colors.grey[500],
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
