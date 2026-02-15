import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:hexcolor/hexcolor.dart';
import 'package:oblio/state/right-menu/right_menu_cubit.dart';
import 'package:oblio/theme/oblio_theme.dart';
import 'package:oblio/widgets/accounts/attribution/contact_attribution_widgets.dart';
import 'package:oblio/widgets/accounts/common/long-card.dart';
import 'package:oblio/widgets/accounts/common/short-card.dart';
import 'package:oblio/widgets/accounts/contact-activity/contact_activity_widgets.dart';
import 'package:oblio/widgets/accounts/header/header.dart';
import 'package:oblio/widgets/accounts/opps/account_opp_widgets.dart';
import 'package:oblio/widgets/accounts/related/related_contacts_widgets.dart';
import 'package:oblio/widgets/accounts/tab-details/tab_details.dart';
import 'package:oblio/widgets/accounts/tab-overview/tab_overview.dart';

class AccountsWidgets extends StatefulWidget {
  const AccountsWidgets({Key? key}) : super(key: key);

  @override
  State<AccountsWidgets> createState() => _AccountsWidgetsState();
}

class _AccountsWidgetsState extends State<AccountsWidgets>
    with TickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
  }

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<RightMenuCubit, String>(
      builder: (context, menuState) {
        var device = MediaQuery.of(context).size;
        var width = device.width;

        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Stack(children: [
              AccountHeader(),
              Positioned(
                bottom: 2,
                child: Container(
                  color: oblioTheme.canvasColor,
                  height: 50,
                  width: 450,
                  child: TabBar(
                    controller: _tabController,
                    tabs: <Widget>[
                      Padding(
                        padding: EdgeInsets.all(8.0),
                        child: Text(
                          'Overview'.toUpperCase(),
                          style: oblioTheme.textTheme.overline!,
                        ),
                      ),
                      Padding(
                        padding: EdgeInsets.all(8.0),
                        child: Text(
                          'Details'.toUpperCase(),
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
                      Padding(
                        padding: EdgeInsets.all(8.0),
                        child: Text(
                          'Versions'.toUpperCase(),
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
              ),
            ]),
            Container(
              padding: EdgeInsets.only(left: 10, right: 10, top: 25),
              height: 1175,
              child: TabBarView(
                controller: _tabController,
                children: <Widget>[
                  AccountTabOverview(),
                  AccountTabDetails(),
                  Center(
                    child: Text('Activity Tab'),
                  ),
                  Center(
                    child: Text('Overview Tab'),
                  ),
                ],
              ),
            ),
          ],
        );
      },
    );
  }
}
