import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:oblio/widgets/header/header_avatar.dart';
import 'package:oblio/widgets/left-menu/collapsed_left_menu.dart';
import 'package:oblio/widgets/header/header_logo.dart';
import 'package:oblio/widgets/header/header_publish_button.dart';
import 'package:oblio/widgets/header/search.dart';
import 'package:oblio/widgets/header/header_title.dart';

import '../../objects.dart';
import '../../state/collapse/collapse_cubit.dart';
import '../left-menu/left_menu.dart';
import '../right-menu/right_menu.dart';
import '../right-menu/right_window.dart';

class HomeHeader extends StatelessWidget {
  final RegExpMatch? match;
  const HomeHeader({Key? key, this.match}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    var device = MediaQuery.of(context).size;
    var width = device.width;
    var modal = ModalRoute.of(context)!.settings.name!.substring(1);
    menuVisibility() => width < 900 ? true : false;
    logoVisibility() => width > 900 ? true : false;
    titleVisibility() => width > 1300 ? true : false;
    buttonVisibility() => width > 750 ? true : false;
    leading() => width < 500 ? 250.0 : 200.0;
    return Container(
      height: 60,
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Color.fromARGB(162, 194, 194, 194),
            spreadRadius: 2,
            blurRadius: 4,
            offset: Offset(0, 3), // changes position of shadow
          ),
        ],
      ),
      child: Container(
        child: Row(
          children: [
            Container(
              padding: EdgeInsets.only(left: 18, right: 5),
              child: Visibility(
                visible: menuVisibility(),
                child: InkWell(
                  onTap: () {},
                  hoverColor: Colors.transparent,
                  splashColor: Colors.transparent,
                  highlightColor: Colors.transparent,
                  child: InkResponse(
                    onTap: () {
                      showDialog(
                          barrierColor: Colors.transparent,
                          context: context,
                          builder: (BuildContext context) {
                            var device = MediaQuery.of(context).size;
                            var width = device.width;

                            dynamicView() => width < 900 ? true : false;
                            return Container(
                                padding: EdgeInsets.only(top: 60, right: 15),
                                alignment: Alignment.topLeft,
                                child: Material(
                                    elevation: 1,
                                    color: Colors.white,
                                    child: Visibility(
                                      visible: dynamicView(),
                                      child: Container(
                                          width: 225,
                                          height: double.infinity,
                                          padding: EdgeInsets.only(
                                              top: 25, bottom: 10, right: 15),
                                          child: LeftMenu(
                                              modal: modal,
                                              route: match != null &&
                                                      Objects.valid.contains(
                                                          match![1]) &&
                                                      match![2] != null
                                                  ? [match![1]!, match![2]!]
                                                  : [])),
                                    )));
                          });
                    },
                    hoverColor: Colors.transparent,
                    splashColor: Colors.transparent,
                    highlightColor: Colors.transparent,
                    child: Icon(
                      Icons.menu,
                      color: Colors.grey[700],
                      size: 30,
                    ),
                  ),
                ),
              ),
            ),
            Visibility(
              visible: logoVisibility(),
              child: HomeLogo(),
            ),
            Visibility(
              visible: titleVisibility(),
              child: HomeHeaderTitle(),
            ),
            Expanded(
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Flexible(
                    child: ConstrainedBox(
                      constraints: BoxConstraints(maxWidth: 900),
                      child: SearchInput(
                        obscure: false,
                        label: 'search...',
                        prefixIcon: Icon(
                          Icons.search,
                          color: Colors.grey[600],
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            Visibility(
              visible: buttonVisibility(),
              child: PublishButton(onPressed: () {}),
            ),
            Visibility(
              visible: menuVisibility(),
              child: GestureDetector(
                onTap: () {
                  showDialog(
                      barrierColor: Colors.transparent,
                      context: context,
                      builder: (BuildContext context) {
                        return Container(
                          padding: EdgeInsets.only(top: 60, right: 0),
                          child: Material(
                            color: Colors.transparent,
                            child: Container(
                                alignment: Alignment.centerRight,
                                child: activityBar()),
                          ),
                        );
                      });
                },
                child: Container(
                  margin: EdgeInsets.symmetric(horizontal: 10),
                  child: Icon(
                    Icons.view_sidebar_rounded,
                    color: Color.fromARGB(255, 184, 184, 184),
                    size: 30,
                  ),
                ),
              ),
            ),
            HeaderAvatar()
          ],
        ),
      ),
    );
    // return AppBar(
    //   backgroundColor: Colors.white,
    //   toolbarHeight: 60,
    //   leadingWidth: leading(),
    //   leading: Row(
    //     mainAxisAlignment: MainAxisAlignment.spaceAround,
    //     children: [
    //       Visibility(
    //         visible: menuVisibility(),
    //         child: InkWell(
    //           onTap: () {},
    //           hoverColor: Colors.transparent,
    //           splashColor: Colors.transparent,
    //           highlightColor: Colors.transparent,
    //           child: InkResponse(
    //             onTap: () {
    //               showDialog(
    //                   barrierColor: Colors.transparent,
    //                   context: context,
    //                   builder: (BuildContext context) {
    //                     var device = MediaQuery.of(context).size;
    //                     var width = device.width;

    //                     dynamicView() => width < 900 ? true : false;
    //                     return Container(
    //                         padding: EdgeInsets.only(top: 60, right: 15),
    //                         alignment: Alignment.topLeft,
    //                         child: Material(
    //                             elevation: 1,
    //                             color: Colors.white,
    //                             child: Visibility(
    //                               visible: dynamicView(),
    //                               child: Container(
    //                                   width: 225,
    //                                   height: double.infinity,
    //                                   padding: EdgeInsets.only(
    //                                       top: 25, bottom: 10, right: 15),
    //                                   child: LeftMenu(
    //                                       modal: modal,
    //                                       route: match != null &&
    //                                               Objects.valid
    //                                                   .contains(match![1]) &&
    //                                               match![2] != null
    //                                           ? [match![1]!, match![2]!]
    //                                           : [])),
    //                             )));
    //                   });
    //             },
    //             hoverColor: Colors.transparent,
    //             splashColor: Colors.transparent,
    //             highlightColor: Colors.transparent,
    //             child: Icon(
    //               Icons.menu,
    //               color: Colors.grey[700],
    //               size: 30,
    //             ),
    //           ),
    //         ),
    //       ),
    //       Visibility(
    //         visible: logoVisibility(),
    //         child: HomeLogo(),
    //       ),
    //     ],
    //   ),
    //   title: Visibility(
    //     visible: titleVisibility(),
    //     child: HomeHeaderTitle(),
    //   ),
    //   centerTitle: false,
    //   elevation: 4,
    //   actions: [
    //     SearchInput(
    //       obscure: false,
    //       label: 'search...',
    //       prefixIcon: Icon(
    //         Icons.search,
    //         color: Colors.grey[600],
    //       ),
    //     ),
    //     Visibility(
    //       visible: buttonVisibility(),
    //       child: PublishButton(onPressed: () {}),
    //     ),
    //     Visibility(
    //       visible: menuVisibility(),
    //       child: GestureDetector(
    //         onTap: () {
    //           showDialog(
    //               barrierColor: Colors.transparent,
    //               context: context,
    //               builder: (BuildContext context) {
    //                 return Container(
    //                   padding: EdgeInsets.only(top: 60, right: 0),
    //                   child: Material(
    //                     color: Colors.transparent,
    //                     child: Container(
    //                         alignment: Alignment.centerRight,
    //                         child: activityBar()),
    //                   ),
    //                 );
    //               });
    //         },
    //         child: Container(
    //           margin: EdgeInsets.symmetric(horizontal: 10),
    //           child: Icon(
    //             Icons.view_sidebar_rounded,
    //             color: Color.fromARGB(255, 184, 184, 184),
    //             size: 30,
    //           ),
    //         ),
    //       ),
    //     ),
    //     HeaderAvatar(),
    //   ],
    // );
  }

  Widget activityBar() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.end,
      children: [RightMenu(), VerticalDivider(width: 1), RightWindow()],
    );
  }
}
