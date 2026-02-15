import 'package:flutter/material.dart';
import 'package:oblio/widgets/accounts/created-by/created_accounts_tile.dart';

class CreatedByExpansionList extends StatelessWidget {
  const CreatedByExpansionList({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Container(
          height: 290,
          margin: EdgeInsets.only(top: 10),
          child: ListView(
            shrinkWrap: true,
            children: [
              CreatedByTile(
                type: 'Owned by'.toUpperCase(),
                title: 'Connor Sinclair',
                image: 'lib/assets/images/1.0x/avatar0.png',
              ),
              CreatedByTile(
                type: 'Last updated by'.toUpperCase(),
                title: 'Jason Sinclair',
                image: 'lib/assets/images/1.0x/avatar1.png',
              ),
              CreatedByTile(
                type: 'Created by'.toUpperCase(),
                title: 'Jane Sinclair',
                image: 'lib/assets/images/1.0x/avatar2.png',
              ),
              CreatedByTile(
                type: 'Owned by'.toUpperCase(),
                title: 'Rina Sinclair',
                image: 'lib/assets/images/1.0x/avatar3.png',
              ),
              CreatedByTile(
                type: 'Owned by'.toUpperCase(),
                title: 'Connor Sinclair',
                image: 'lib/assets/images/1.0x/avatar0.png',
              ),
              CreatedByTile(
                type: 'Last updated by'.toUpperCase(),
                title: 'Jason Sinclair',
                image: 'lib/assets/images/1.0x/avatar1.png',
              ),
              CreatedByTile(
                type: 'Created by'.toUpperCase(),
                title: 'Jane Sinclair',
                image: 'lib/assets/images/1.0x/avatar2.png',
              ),
              CreatedByTile(
                type: 'Owned by'.toUpperCase(),
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
