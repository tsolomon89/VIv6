import 'package:flutter/material.dart';

class OrganizationsScreen extends StatefulWidget {
  const OrganizationsScreen({Key? key}) : super(key: key);

  @override
  _OrganizationsScreenState createState() => _OrganizationsScreenState();
}

class _OrganizationsScreenState extends State<OrganizationsScreen> {
  @override
  Widget build(BuildContext context) {
    return ScrollConfiguration(
      behavior: ScrollConfiguration.of(context).copyWith(scrollbars: false),
      child: Flexible(
        flex: 1,
        child: SingleChildScrollView(
            child: Center(
          child: Text('Organizations Screen'),
        )),
      ),
    );
  }
}
