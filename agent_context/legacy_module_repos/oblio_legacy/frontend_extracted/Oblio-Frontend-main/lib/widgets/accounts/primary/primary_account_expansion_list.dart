import 'package:flutter/material.dart';
import 'package:oblio/widgets/accounts/primary/primary_accounts_tile.dart';

class PrimaryAccountExpansionList extends StatelessWidget {
  const PrimaryAccountExpansionList({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Container(
          height: 500,
          child: ListView(
            shrinkWrap: true,
            children: [
              PrimaryAccountsTile(
                type: 'Primary Contact'.toUpperCase(),
                title: 'Connor Sinclair',
                image: 'lib/assets/images/1.0x/avatar0.png',
              ),
              PrimaryAccountsTile(
                type: 'Primary Decision Maker'.toUpperCase(),
                title: 'Jason Sinclair',
                image: 'lib/assets/images/1.0x/avatar1.png',
              ),
              PrimaryAccountsTile(
                type: 'Primary End User'.toUpperCase(),
                title: 'Jane Sinclair',
                image: 'lib/assets/images/1.0x/avatar2.png',
              ),
              PrimaryAccountsTile(
                type: 'Primary Billing'.toUpperCase(),
                title: 'Rina Sinclair',
                image: 'lib/assets/images/1.0x/avatar3.png',
              ),
              PrimaryAccountsTile(
                type: 'Primary Contact'.toUpperCase(),
                title: 'Connor Sinclair',
                image: 'lib/assets/images/1.0x/avatar0.png',
              ),
              PrimaryAccountsTile(
                type: 'Primary Decision Maker'.toUpperCase(),
                title: 'Jason Sinclair',
                image: 'lib/assets/images/1.0x/avatar1.png',
              ),
              PrimaryAccountsTile(
                type: 'Primary End User'.toUpperCase(),
                title: 'Jane Sinclair',
                image: 'lib/assets/images/1.0x/avatar2.png',
              ),
              PrimaryAccountsTile(
                type: 'Primary Billing'.toUpperCase(),
                title: 'Rina Sinclair',
                image: 'lib/assets/images/1.0x/avatar3.png',
              ),
            ],
          ),
        ),
      ],
    );
  }
}
