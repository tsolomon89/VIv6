import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:hexcolor/hexcolor.dart';
import 'package:oblio/state/scheduled/scheduled_cubit.dart';
import 'package:oblio/theme/oblio_theme.dart';
import 'package:oblio/widget-models/circular_frame_model.dart';
import 'package:oblio/widget-models/text_model.dart';
import 'package:oblio/widgets/home/scheduled/scheduled_arc.dart';
import 'package:oblio/widgets/home/scheduled/scheduled_numbers.dart';

class ScheduledCircular extends StatefulWidget {
  const ScheduledCircular({Key? key}) : super(key: key);

  @override
  State<ScheduledCircular> createState() => _ScheduledCircularState();
}

class _ScheduledCircularState extends State<ScheduledCircular> {
  int menu = 5;

  @override
  Widget build(BuildContext context) {
    List<IconData> iconItems = [
      Icons.date_range,
      Icons.add_task,
      Icons.perm_media,
      Icons.person_add,
      Icons.add_shopping_cart,
      Icons.email,
      Icons.phone,
    ];

    return BlocBuilder<ScheduledCubit, String>(
      builder: (context, scheduleState) {
        dynamicIcons() {
          if (scheduleState == 'calendar') {
            return iconItems[0];
          } else if (scheduleState == 'task') {
            return iconItems[1];
          } else if (scheduleState == 'image') {
            return iconItems[2];
          } else if (scheduleState == 'account') {
            return iconItems[3];
          } else if (scheduleState == 'cart') {
            return iconItems[4];
          } else if (scheduleState == 'email') {
            return iconItems[5];
          } else if (scheduleState == 'phone') {
            return iconItems[6];
          }
        }

        dynamicColors() {
          if (scheduleState == 'calendar') {
            return HexColor('#435BD9');
          } else if (scheduleState == 'task') {
            return HexColor('#FA4583');
          } else if (scheduleState == 'image') {
            return HexColor('#5F78E4');
          } else if (scheduleState == 'account') {
            return HexColor('#FDC173');
          } else if (scheduleState == 'cart') {
            return HexColor('#0EBB6A');
          } else if (scheduleState == 'email') {
            return HexColor('#711BEF');
          } else if (scheduleState == 'phone') {
            return HexColor('#FDAF4C');
          }
        }

        arcValue() {
          if (scheduleState == 'calendar') {
            return 70.0;
          } else if (scheduleState == 'task') {
            return 50.0;
          } else if (scheduleState == 'image') {
            return 60.0;
          } else if (scheduleState == 'account') {
            return 90.0;
          } else if (scheduleState == 'cart') {
            return 20.0;
          } else if (scheduleState == 'email') {
            return 40.0;
          } else if (scheduleState == 'phone') {
            return 80.0;
          }
        }

        dynamicState() {
          if (menu == 0) {
            return context.read<ScheduledCubit>().calendar();
          } else if (menu == 1) {
            return context.read<ScheduledCubit>().task();
          } else if (menu == 2) {
            return context.read<ScheduledCubit>().image();
          } else if (menu == 3) {
            return context.read<ScheduledCubit>().account();
          } else if (menu == 4) {
            return context.read<ScheduledCubit>().cart();
          } else if (menu == 5) {
            return context.read<ScheduledCubit>().email();
          } else if (menu == 6) {
            return context.read<ScheduledCubit>().phone();
          }
        }

        return Container(
            height: 250,
            child: Stack(alignment: Alignment.bottomCenter, children: [
              ScheduledNumbers(),
              Positioned(
                top: 45,
                child: ScheduledArc(
                  completeColor: dynamicColors()!,
                  completePercent: arcValue()!,
                ),
              ),
              Positioned(
                top: 100,
                width: 350,
                child: Padding(
                  padding: EdgeInsets.only(left: 0, right: 0),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Padding(
                        padding: const EdgeInsets.only(bottom: 8),
                        child: InkWell(
                          onTap: () {
                            if (menu > 0) {
                              setState(() {
                                menu--;
                              });
                            }
                            dynamicState();
                          },
                          hoverColor: Colors.transparent,
                          child: Container(
                            width: 110,
                            padding: const EdgeInsets.all(10),
                            decoration: BoxDecoration(
                                color: Colors.transparent,
                                borderRadius: BorderRadius.circular(20)),
                            child: TextModel(
                              data: 'PREVIOUS',
                              style: oblioTheme.primaryTextTheme.subtitle2!,
                              textAlign: TextAlign.center,
                              textDirection: TextDirection.ltr,
                            ),
                          ),
                        ),
                      ),
                      Padding(
                        padding: const EdgeInsets.only(bottom: 45),
                        child: CircularFrameModel(
                            height: 120,
                            width: 120,
                            padding: EdgeInsets.all(2),
                            child: Center(
                              child: Icon(
                                dynamicIcons(),
                                size: 60,
                                color: Colors.white,
                              ),
                            ),
                            decoration: BoxDecoration(
                                color: dynamicColors(),
                                borderRadius: BorderRadius.circular(100))),
                      ),
                      Padding(
                        padding: const EdgeInsets.only(bottom: 8),
                        child: InkWell(
                          onTap: () {
                            if (menu < 6) {
                              setState(() {
                                menu++;
                              });
                            }
                            dynamicState();
                          },
                          hoverColor: Colors.transparent,
                          child: Container(
                            width: 110,
                            padding: const EdgeInsets.all(10),
                            decoration: BoxDecoration(
                                color: Colors.transparent,
                                borderRadius: BorderRadius.circular(20)),
                            child: TextModel(
                              data: 'NEXT',
                              style: oblioTheme.primaryTextTheme.subtitle2!,
                              textAlign: TextAlign.center,
                              textDirection: TextDirection.ltr,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ]));
      },
    );
  }
}
