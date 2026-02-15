import 'package:flutter/material.dart';
import 'package:oblio/widgets/accounts/common/common_title.dart';
import 'package:oblio/widgets/accounts/created-by/created_account_expansion_list.dart';

class CreatedByWidets extends StatefulWidget {
  const CreatedByWidets({Key? key}) : super(key: key);

  @override
  State<CreatedByWidets> createState() => _CreatedByWidetsState();
}

class _CreatedByWidetsState extends State<CreatedByWidets> {
  String dropdownValue = "All Time";
  List list = <String>['Day', 'Week', 'Month', 'Quarter', 'Year', 'All Time'];
  @override
  Widget build(BuildContext context) {
    return Container(
      height: 100,
      child: Column(
        mainAxisAlignment: MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [CreatedByExpansionList()],
      ),
    );
  }
}
