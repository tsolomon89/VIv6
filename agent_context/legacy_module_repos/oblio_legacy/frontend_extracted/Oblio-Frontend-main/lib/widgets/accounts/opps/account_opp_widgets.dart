import 'package:flutter/material.dart';
import 'package:oblio/widgets/accounts/common/common_title.dart';
import 'package:oblio/widgets/accounts/opps/account_opp_expansion_list.dart';

import '../../home/common/long-card.dart';

class AccountOppWidets extends StatefulWidget {
  const AccountOppWidets({Key? key}) : super(key: key);

  @override
  State<AccountOppWidets> createState() => _AccountOppWidetsState();
}

class _AccountOppWidetsState extends State<AccountOppWidets> {
  String dropdownValue = "All Time";
  List list = <String>['Day', 'Week', 'Month', 'Quarter', 'Year', 'All Time'];
  @override
  Widget build(BuildContext context) {
    return LongCard(
      title: 'ACCOUNT OPPORTUNITIES',
      expanded: false,
      onPress: () {},
      child: IntrinsicHeight(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.start,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [AccountOppExpansionList()],
        ),
      ),
    );
  }
}
