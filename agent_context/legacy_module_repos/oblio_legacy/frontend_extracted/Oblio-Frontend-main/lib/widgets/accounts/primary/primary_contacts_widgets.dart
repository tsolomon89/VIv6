import 'package:flutter/material.dart';
import 'package:oblio/widgets/accounts/common/common_title.dart';
import 'package:oblio/widgets/accounts/primary/primary_account_expansion_list.dart';

class PrimaryContactsWidets extends StatefulWidget {
  const PrimaryContactsWidets({Key? key}) : super(key: key);

  @override
  State<PrimaryContactsWidets> createState() => _PrimaryContactsWidetsState();
}

class _PrimaryContactsWidetsState extends State<PrimaryContactsWidets> {
  String dropdownValue = "All Time";
  List list = <String>['Day', 'Week', 'Month', 'Quarter', 'Year', 'All Time'];
  @override
  Widget build(BuildContext context) {
    return IntrinsicHeight(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          AccountCommonTitle(title: 'Primary Contacts'),
          SizedBox(height: 5),
          PrimaryAccountExpansionList()
        ],
      ),
    );
  }
}
