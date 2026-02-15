import 'package:flutter/material.dart';
import 'package:hexcolor/hexcolor.dart';
import 'package:oblio/theme/oblio_theme.dart';
import 'package:oblio/widgets/accounts/attribution/contact_attribution_activity.dart';
import 'package:oblio/widgets/accounts/attribution/contact_attribution_campaign.dart';
import 'package:oblio/widgets/accounts/attribution/contact_attribution_persona.dart';

class ContactAttributionNavigator extends StatefulWidget {
  const ContactAttributionNavigator({Key? key}) : super(key: key);

  @override
  State<ContactAttributionNavigator> createState() =>
      _ContactAttributionNavigatorState();
}

class _ContactAttributionNavigatorState
    extends State<ContactAttributionNavigator> with TickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      child: DefaultTabController(
        initialIndex: 1,
        length: 3,
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
                      'Campaign'.toUpperCase(),
                      style: oblioTheme.textTheme.overline!,
                    ),
                  ),
                  Padding(
                    padding: EdgeInsets.all(8.0),
                    child: Text(
                      'Persona'.toUpperCase(),
                      style: oblioTheme.textTheme.overline!,
                    ),
                  ),
                  Padding(
                    padding: EdgeInsets.all(8.0),
                    child: Text(
                      'Activity'.toUpperCase(),
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
              height: 600,
              child: TabBarView(
                controller: _tabController,
                children: const <Widget>[
                  Center(child: ContactAttributionCampaign()),
                  Center(child: ContactAttributionPersona()),
                  Center(child: ContactAttributionActivity()),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
