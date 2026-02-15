import 'package:flutter/material.dart';
import 'package:oblio/widgets/accounts/header/org_details.dart';
import 'package:oblio/widgets/accounts/header/stat_details.dart';


class AccountHeader extends StatelessWidget {
  const AccountHeader({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(right: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
        OrgDetails(), 
        SizedBox(width: 20),
        StatDetails()],
      ),
    );
  }
}
