import 'package:flutter/material.dart';
import 'package:oblio/widgets/accounts/accounts.dart';

class AccountsScreen extends StatefulWidget {
  const AccountsScreen({Key? key}) : super(key: key);

  @override
  _AccountsScreenState createState() => _AccountsScreenState();
}

class _AccountsScreenState extends State<AccountsScreen> {
  @override
  Widget build(BuildContext context) {
    return Flexible(
      flex: 1,
      child: Padding(
        padding: const EdgeInsets.all(10.0),
        child: ScrollConfiguration(
          behavior: ScrollConfiguration.of(context).copyWith(scrollbars: false),
          child: SingleChildScrollView(child: AccountsWidgets())),
      ),
    );
  }
}
