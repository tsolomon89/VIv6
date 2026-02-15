import 'package:flutter/material.dart';
import 'package:hexcolor/hexcolor.dart';
import 'package:oblio/theme/oblio_theme.dart';
import 'package:oblio/widgets/accounts/contact-activity/contact_activity_completed.dart';
import 'package:oblio/widgets/accounts/contact-activity/contact_activity_scheduled.dart';

class ContactActivityNavigator extends StatefulWidget {
  const ContactActivityNavigator({Key? key}) : super(key: key);

  @override
  State<ContactActivityNavigator> createState() =>
      _ContactActivityNavigatorState();
}

class _ContactActivityNavigatorState extends State<ContactActivityNavigator>
    with TickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      child: DefaultTabController(
        initialIndex: 1,
        length: 2,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Container(
              height: 40,
              child: TabBar(
                controller: _tabController,
                tabs: <Widget>[
                  Padding(
                    padding: EdgeInsets.all(8.0),
                    child: Text(
                      'Scheduled'.toUpperCase(),
                      style: oblioTheme.textTheme.overline!,
                    ),
                  ),
                  Padding(
                    padding: EdgeInsets.all(8.0),
                    child: Text(
                      'Completed'.toUpperCase(),
                      style: oblioTheme.textTheme.overline!,
                    ),
                  ),
                ],
                indicator: UnderlineTabIndicator(
                  borderSide:
                      BorderSide(color: HexColor('#5F78E4'), width: 2.0),
                ),
              ),
            ),
            Container(
              height: 500,
              child: TabBarView(
                controller: _tabController,
                children: const <Widget>[
                  Center(child: ContactActivityScheduled()),
                  Center(child: ContactActivityCompleted()),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
