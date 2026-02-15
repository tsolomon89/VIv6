import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:oblio/objects.dart';
import 'package:oblio/state/right-menu/right_menu_cubit.dart';
import 'package:oblio/state/right-window/right_window_cubit.dart';
import 'package:oblio/theme/oblio_theme.dart';
import 'package:oblio/widget-models/fab_button_model.dart';

class RightMenu extends StatefulWidget {
  const RightMenu({Key? key}) : super(key: key);

  @override
  State<RightMenu> createState() => _RightMenuState();
}

class _RightMenuState extends State<RightMenu> {
  @override
  Widget build(BuildContext context) {
    var keys = Objects.crudItems.keys;
    getKey(index) => keys.elementAt(index);

    var values = Objects.crudItems.values;
    getValue(index) => values.elementAt(index);

    return BlocBuilder<RightMenuCubit, String>(
      builder: (context, menuState) {
        return Material(
          elevation: 4,
          color: Colors.white,
          child: Container(
            width: 75,
            padding: EdgeInsets.only(top: 20),
            child: ListView.builder(
              itemCount: Objects.crudItems.length,
              itemBuilder: (context, index) {
                return GestureDetector(
                  onTap: () {
                    context.read<RightWindowCubit>().show();
                    context
                        .read<RightMenuCubit>()
                        .setValue(Objects.crudItems.keys.elementAt(index));
                  },
                  child: Container(
                    width: 50,
                    height: 50,
                    margin: EdgeInsets.only(bottom: 20),
                    decoration: BoxDecoration(
                      color: menuState == getKey(index)
                          ? getValue(index)['color']
                          : Colors.white,
                      shape: BoxShape.circle,
                      border: Border.all(
                          width: 1.3,
                          color: menuState == getKey(index)
                              ? Colors.transparent
                              : Color.fromRGBO(204, 204, 204, 1)),
                      boxShadow: [
                        menuState == getKey(index)
                            ? BoxShadow(
                                color: Color.fromARGB(123, 90, 90, 90),
                                offset: Offset(0, 2),
                                blurRadius: 5,
                                spreadRadius: 2)
                            : BoxShadow(
                                color: Color.fromRGBO(243, 243, 243, 1),
                                blurRadius: 5,
                                spreadRadius: 5)
                      ],

                      // gradient: RadialGradient(
                      //   radius: 0.89,
                      //   colors: [
                      //     Colors.transparent,
                      //     Colors.transparent,
                      //     Color.fromARGB(29, 163, 163, 163),
                      //     Color.fromARGB(255, 228, 228, 228),
                      //   ],
                      // ),

                      // shape: BoxShape.circle,
                      // border: Border.all(width: 2.0, color: Colors.black),
                      // boxShadow: [
                      //   BoxShadow(
                      //     color: Color.fromARGB(90, 255, 255, 255),
                      //   ),
                      //   BoxShadow(
                      //     color: Color.fromARGB(255, 204, 204, 204),
                      //     spreadRadius: -12.0,
                      //     blurRadius: 12.0,
                      //   ),
                      // ],
                    ),
                    child: Container(
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        gradient: menuState == getKey(index)
                            ? null
                            : RadialGradient(
                                radius: 1,
                                colors: [
                                  Colors.transparent,
                                  Color.fromARGB(115, 85, 85, 85),
                                ],
                                stops: <double>[0.4, 1.0],
                              ),
                      ),
                      child: Icon(getValue(index)['icon'],
                          color: menuState == getKey(index)
                              ? Colors.white
                              : getValue(index)['color']),
                    ),
                  ),
                );
                // child: FabButtonModel(
                //   tag: getKey(index),
                //   hover: menuState == getKey(index)
                //       ? getValue(index)['color']
                //       : Colors.grey[100],
                //   elevation: 3.0,
                //   hoverElevation: 0.0,
                //   mini: true,
                //   background: menuState == getKey(index)
                //       ? getValue(index)['color']
                //       : oblioTheme.backgroundColor,
                //   child: Icon(getValue(index)['icon'],
                //       color: menuState == getKey(index)
                //           ? Colors.white
                //           : getValue(index)['color']),
                //   onPressed: () {
                //     context.read<RightWindowCubit>().show();
                //     context
                //         .read<RightMenuCubit>()
                //         .setValue(Objects.crudItems.keys.elementAt(index));
                //   },
                // ));
              },
            ),
          ),
        );
      },
    );
  }
}
