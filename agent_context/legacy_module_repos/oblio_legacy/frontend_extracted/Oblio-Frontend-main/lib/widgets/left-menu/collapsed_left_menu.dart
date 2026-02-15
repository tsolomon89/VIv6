import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:oblio/state/collapse/collapse_cubit.dart';
import 'package:oblio/widget-models/tile_model.dart';

class CollapsedLeftMenu extends StatefulWidget {
  const CollapsedLeftMenu({Key? key}) : super(key: key);

  @override
  State<CollapsedLeftMenu> createState() => _LeftMenuState();
}

class _LeftMenuState extends State<CollapsedLeftMenu> {
  int _selectedIndex = 0;

  @override
  Widget build(BuildContext context) {
    // RegExp routeExp =
    //     new RegExp(r"^(?:\/([^\/#\?]+?))(?:\/([^\/#\?]+?))?[\/#\?]?$");
    // RegExpMatch? match =
    //     routeExp.firstMatch(ModalRoute.of(context)!.settings.name!);

    //print(ModalRoute.of(context)!.settings);

    return BlocBuilder<CollapseCubit, bool>(
      builder: (context, collapseState) {
        List<IconData> iconItems = [
          Icons.dashboard,
          Icons.calendar_today,
          Icons.assignment,
          Icons.assignment_ind,
          Icons.attach_money,
          Icons.business,
          Icons.contacts,
          Icons.assessment,
          Icons.perm_media,
          Icons.autorenew,
          Icons.shopping_cart,
          Icons.people,
        ];
        List<String> navItems = [
          "Dashboard2",
          "Calendar",
          "Todos",
          "Teams",
          "Opportunities",
          "Accounts",
          "Contacts",
          "Campaings",
          "Creatives",
          "Workflows",
          "Products",
          "Employees",
        ];

        var device = MediaQuery.of(context).size;
        var width = device.width;

        dynamicView() => width < 900 ? true : false;

        //print(match);

        return Visibility(
          visible: dynamicView(),
          child: Container(
              width: 225,
              padding: EdgeInsets.only(top: 25, bottom: 10, right: 15),
              child: Container()),
        );
      },
    );
  }
}
