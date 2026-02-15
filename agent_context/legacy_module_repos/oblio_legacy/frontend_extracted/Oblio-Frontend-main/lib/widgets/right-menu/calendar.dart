import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:linked_scroll_controller/linked_scroll_controller.dart';

import '../../theme/oblioTheme.dart';

class Calendar extends StatefulWidget {
  const Calendar({Key? key}) : super(key: key);

  @override
  State<Calendar> createState() => _CalendarState();
}

class _CalendarState extends State<Calendar> {
  LinkedScrollControllerGroup? _controllers;

  ScrollController? agenda;
  ScrollController? tasks;

  List<Map> entries = [
    {
      'background': Color.fromRGBO(240, 240, 255, 1),
      'vertical': Color.fromRGBO(149, 116, 255, 1),
      'primary': Color.fromRGBO(107, 67, 235, 1),
      'secondary': Color.fromARGB(255, 132, 111, 199),
      'title': 'Daily Stand up Meeting',
      'start': 0,
      'end': 0
    }
  ];

  @override
  void initState() {
    super.initState();
    _controllers = LinkedScrollControllerGroup();
    agenda = _controllers!.addAndGet();
    tasks = _controllers!.addAndGet();
  }

  @override
  void dispose() {
    agenda!.dispose();
    tasks!.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Stack(
        children: [
          ListView.builder(
            physics: NeverScrollableScrollPhysics(),
            controller: agenda,
            itemCount: 24,
            itemBuilder: (context, index) {
              return Container(
                margin: EdgeInsets.only(top: 30, right: 15, left: 15),
                child: Row(
                  children: [
                    Padding(
                      padding: EdgeInsets.only(right: 18),
                      child: Column(
                        children: [
                          Text(
                            index > 12
                                ? (index - 12).toString()
                                : index.toString(),
                            style: Typeface.calendarDay,
                          ),
                          Text(
                            index > 12 ? 'PM' : 'AM',
                            style: Typeface.calendarDay,
                          )
                        ],
                      ),
                    ),
                    Expanded(
                      child: Divider(
                        height: 0.8,
                        color: Color.fromARGB(255, 216, 216, 216),
                      ),
                    )
                  ],
                ),
              );
            },
          ),
          SingleChildScrollView(
            controller: tasks,
            child: Container(
              height: 1800,
              child: Stack(children: [
                Padding(
                    padding: EdgeInsets.only(top: 626, left: 55, right: 15),
                    child: Container(
                      height: 73,
                      child: Row(
                        children: [
                          VerticalDivider(
                            width: 5,
                            thickness: 9,
                            color: Color.fromRGBO(149, 116, 255, 1),
                          ),
                          Expanded(
                              child: Container(
                            color: Color.fromRGBO(240, 240, 255, 1),
                            child: Padding(
                              padding: EdgeInsets.all(10),
                              child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      'Daily Stand up Meeting',
                                      style: TextStyle(
                                          fontFamily: 'Poppins',
                                          fontSize: 13,
                                          fontWeight: FontWeight.w600,
                                          color:
                                              Color.fromRGBO(107, 67, 235, 1)),
                                    ),
                                    Container(
                                        margin: EdgeInsets.only(top: 5),
                                        child: Text(
                                          '8:00 AM - 9:00AM',
                                          style: TextStyle(
                                              fontFamily: 'Poppins',
                                              fontSize: 13,
                                              fontWeight: FontWeight.w500,
                                              color: Color.fromARGB(
                                                  255, 128, 103, 204)),
                                        ))
                                  ]),
                            ),
                          ))
                        ],
                      ),
                    )),
                Padding(
                    padding: EdgeInsets.only(top: 656, left: 150, right: 15),
                    child: Container(
                      height: 73,
                      child: Row(
                        children: [
                          VerticalDivider(
                            width: 5,
                            thickness: 9,
                            color: Color.fromRGBO(149, 116, 255, 1),
                          ),
                          Expanded(
                              child: Container(
                            color: Color.fromRGBO(240, 240, 255, 1),
                            child: Padding(
                              padding: EdgeInsets.all(10),
                              child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      'Outreach Discussion',
                                      style: TextStyle(
                                          fontFamily: 'Poppins',
                                          fontSize: 13,
                                          fontWeight: FontWeight.w600,
                                          color:
                                              Color.fromRGBO(107, 67, 235, 1)),
                                    ),
                                    Container(
                                        margin: EdgeInsets.only(top: 5),
                                        child: Text(
                                          '8:25 AM - 9:25AM',
                                          style: TextStyle(
                                              fontFamily: 'Poppins',
                                              fontSize: 13,
                                              fontWeight: FontWeight.w500,
                                              color: Color.fromARGB(
                                                  255, 128, 103, 204)),
                                        ))
                                  ]),
                            ),
                          ))
                        ],
                      ),
                    )),
                Padding(
                    padding: EdgeInsets.only(top: 900, left: 55, right: 15),
                    child: Container(
                      height: 120,
                      child: Row(
                        children: [
                          VerticalDivider(
                            width: 5,
                            thickness: 9,
                            color: Color.fromRGBO(255, 60, 158, 1),
                          ),
                          Expanded(
                              child: Container(
                            color: Color.fromRGBO(252, 237, 244, 1),
                            child: Padding(
                              padding: EdgeInsets.all(10),
                              child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      'Team Lunch',
                                      style: TextStyle(
                                          fontFamily: 'Poppins',
                                          fontSize: 13,
                                          fontWeight: FontWeight.w600,
                                          color:
                                              Color.fromRGBO(255, 73, 164, 1)),
                                    ),
                                    Container(
                                        margin: EdgeInsets.only(top: 5),
                                        child: Text(
                                          '12:00 PM - 1:30PM',
                                          style: TextStyle(
                                              fontFamily: 'Poppins',
                                              fontSize: 13,
                                              fontWeight: FontWeight.w500,
                                              color: Color.fromARGB(
                                                  255, 251, 135, 193)),
                                        ))
                                  ]),
                            ),
                          ))
                        ],
                      ),
                    ))
              ]),
            ),
          ),
        ],
      ),
    );
  }
}
