import 'package:flutter/material.dart';
import 'package:oblio/widgets/accounts/attribution/contact_attribution_widgets.dart';
import 'package:oblio/widgets/accounts/common/long-card.dart';
import 'package:oblio/widgets/accounts/common/short-card.dart';
import 'package:oblio/widgets/accounts/contact-activity/contact_activity_widgets.dart';
import 'package:oblio/widgets/accounts/opps/account_opp_widgets.dart';
import 'package:oblio/widgets/accounts/related/related_contacts_widgets.dart';

class AccountTabOverview extends StatelessWidget {
  const AccountTabOverview({Key? key}) : super(key: key);

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
              AccountsShortCard(child: RelatedContactsWidets()),
              SizedBox(height: 25),
              AccountsShortCard(child: AccountOppWidets()),
            ],
          ),
          AccountsLongCard(child: ContactActivityWidets()),
          AccountsLongCard(child: ContactAttributionWidgets()),
        ],
      ),
    );
  }
}
