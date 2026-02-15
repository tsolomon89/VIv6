import 'package:flutter/material.dart';

class CampaignsScreen extends StatefulWidget {
  const CampaignsScreen({Key? key}) : super(key: key);

  @override
  _CampaignsScreenState createState() => _CampaignsScreenState();
}

class _CampaignsScreenState extends State<CampaignsScreen> {
  @override
  Widget build(BuildContext context) {
    return ScrollConfiguration(
      behavior: ScrollConfiguration.of(context).copyWith(scrollbars: false),
      child: Flexible(
        flex: 1,
        child: SingleChildScrollView(
            child: Center(
          child: Text('Campaigns Screen'),
        )),
      ),
    );
  }
}
