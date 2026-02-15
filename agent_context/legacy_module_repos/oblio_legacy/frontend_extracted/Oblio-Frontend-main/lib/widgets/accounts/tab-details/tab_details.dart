import 'package:flutter/material.dart';
import 'package:oblio/widgets/accounts/common/long-card.dart';
import 'package:oblio/widgets/accounts/common/short-card.dart';
import 'package:oblio/widgets/accounts/contact-details/contact_details_widgets.dart';
import 'package:oblio/widgets/accounts/created-by/created_contacts_widgets.dart';
import 'package:oblio/widgets/accounts/firmographics/firmographics_details_widgets.dart';
import 'package:oblio/widgets/accounts/links/link_details_widgets.dart';
import 'package:oblio/widgets/accounts/locations/locations_details_widgets.dart';
import 'package:oblio/widgets/accounts/primary/primary_contacts_widgets.dart';
import 'package:oblio/widgets/accounts/technographics/technographics_details_widgets.dart';

class AccountTabDetails extends StatelessWidget {
  const AccountTabDetails({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Column(
            mainAxisAlignment: MainAxisAlignment.start,
            children: [
              AccountsShortCard(child: ContactDetailsWidets()),
              SizedBox(height: 25),
              AccountsLongCard(child: LinksWidets()),
            ],
          ),
          Column(
            mainAxisAlignment: MainAxisAlignment.start,
            children: [
              AccountsShortCard(child: FirmographicsDetailsWidets()),
              SizedBox(height: 25),
              AccountsShortCard(child: TechnographicsDetailsWidets()),
              SizedBox(height: 25),
              AccountsShortCard(child: LocationsDetailsWidets()),
            ],
          ),
          Column(
            mainAxisAlignment: MainAxisAlignment.start,
            children: [
              AccountsLongCard(child: PrimaryContactsWidets()),
              SizedBox(height: 25),
              AccountsShortCard(child: CreatedByWidets()),
            ],
          ),
        ],
      ),
    );
  }
}
