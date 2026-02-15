import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:hexcolor/hexcolor.dart';
import 'package:oblio/state/collapse/collapse_cubit.dart';
import 'package:oblio/widget-models/fab_button_model.dart';
import 'package:oblio/widget-models/tile_model.dart';
import 'package:oblio/oblio_icons.dart';
import 'dart:async';

class NavData {
  IconData? icon;
  String? name;
  String? separator;
  String? route;

  NavData({this.icon, this.name, this.separator, this.route});
}

class LeftMenu extends StatefulWidget {
  final List<String> route;
  final String? modal;
  const LeftMenu({Key? key, required this.route, this.modal}) : super(key: key);

  @override
  State<LeftMenu> createState() => _LeftMenuState();
}

class _LeftMenuState extends State<LeftMenu> {
  String _selectedIndex = '';

  List<NavData> navItems = [
    NavData(icon: Icons.dashboard, name: 'Dashboard', route: 'dashboard'),
    NavData(separator: 'RECORDS'),
    NavData(icon: Icons.contacts, name: 'Contacts', route: 'contacts'),
    NavData(icon: Icons.business, name: 'Accounts', route: 'accounts'),
    NavData(icon: Icons.fact_check, name: 'Activities', route: 'activities'),
    NavData(
        icon: Icons.monetization_on_rounded,
        name: 'Opportunities',
        route: 'opportunities'),
    NavData(
        icon: Icons.inventory_2_rounded, name: 'Products', route: 'products'),
    NavData(
        icon: Icons.supervised_user_circle_rounded,
        name: 'Users',
        route: 'users'),
    NavData(separator: 'SEGMENTS'),
    NavData(
        icon: Icons.campaign_rounded, name: 'Campaigns', route: 'campaigns'),
    NavData(icon: Oblio.pipelines, name: 'Pipelines', route: 'pipelines'),
    NavData(icon: Icons.perm_media, name: 'Contents', route: 'contents'),
    NavData(
        icon: Icons.autorenew_rounded, name: 'Workflows', route: 'workflows'),
    NavData(separator: 'CONFIGURATION'),
    NavData(
        icon: Icons.business_rounded,
        name: 'Organisation',
        route: 'organisation'),
    NavData(icon: Icons.storage_rounded, name: 'Data', route: 'data'),
  ];

  @override
  Widget build(BuildContext context) {
    /// TODO: Fix messy workaround
    if (_selectedIndex == '' && widget.modal == null) {
      _selectedIndex = ModalRoute.of(context)!.settings.name!.substring(1);
    }

    if (_selectedIndex == '' && widget.modal != null) {
      _selectedIndex = widget.modal!;
    }

    if (widget.route.length > 0) {
      _selectedIndex = widget.route[0];
    }

    return BlocBuilder<CollapseCubit, bool>(
      builder: (context, collapseState) {
        var width = MediaQuery.of(context).size.width;

        var isCollapsed =
            width < 1500 && collapseState == false ? true : !collapseState;

        menuVisibility() => width < 900 ? false : true;
        responsiveWidth() => width > 900 && isCollapsed ? 70.0 : 200.0;

        var collapse = isCollapsed ? Icons.chevron_right : Icons.chevron_left;

        return Container(
          width: responsiveWidth(),
          padding:
              EdgeInsets.only(top: menuVisibility() ? 25.0 : 0.0, bottom: 10),
          child: Column(
            children: [
              Expanded(
                flex: 1,
                child: ListView.builder(
                  itemCount: navItems.length,
                  itemBuilder: (context, index) {
                    if (navItems[index].separator != null)
                      return Padding(
                        padding:
                            EdgeInsets.only(top: 19.0, bottom: 14.0, left: 20),
                        child: Text(
                          width > 900 && isCollapsed
                              ? navItems[index].separator!.substring(0, 3)
                              : navItems[index].separator!,
                          style: TextStyle(
                              fontSize: 11,
                              color: Color.fromRGBO(131, 132, 132, 1)),
                        ),
                      );
                    return TileModel(
                        leading: Icon(
                          navItems[index].icon!,
                          color: navItems[index].route == _selectedIndex
                              ? Colors.white
                              : Colors.grey[700],
                        ),
                        title: Visibility(
                          visible: !menuVisibility() ? true : !isCollapsed,
                          child: Text(
                            navItems[index].name!,
                            style: TextStyle(
                              color: navItems[index].route == _selectedIndex
                                  ? Colors.white
                                  : Colors.grey[700],
                            ),
                          ),
                        ),
                        selected: navItems[index].route == _selectedIndex,
                        onTap: () {
                          if (_selectedIndex != navItems[index].route ||
                              widget.route.length != 0) {
                            setState(() {
                              _selectedIndex = navItems[index].route!;
                            });
                            Timer(Duration(milliseconds: 1), () {
                              //_selectedIndex = '';
                              Navigator.of(context).pushNamedAndRemoveUntil(
                                  '/' + navItems[index].route!,
                                  (Route<dynamic> route) => false);
                            });
                          }
                        });
                  },
                ),
              ),
              if (menuVisibility())
                Container(
                  alignment: Alignment.topLeft,
                  padding: EdgeInsets.only(top: 10, left: 8),
                  child: FabButtonModel(
                      elevation: 2,
                      hoverElevation: 1,
                      hover: HexColor('#fff'),
                      onPressed: () {
                        collapseState == false
                            ? context.read<CollapseCubit>().collapse()
                            : context.read<CollapseCubit>().expand();
                      },
                      background: Colors.grey[50]!,
                      child: Center(
                          child: Icon(collapse,
                              size: 25, color: Colors.grey[700])),
                      mini: true,
                      tag: 'collapse'),
                )
            ],
          ),
        );
      },
    );
  }
}
