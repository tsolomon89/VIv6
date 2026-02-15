import 'package:bloc/bloc.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
//import 'package:flutter_bloc/flutter_bloc.dart';
//import 'package:oblio/state/right-menu/right_menu_cubit.dart';
import 'package:oblio/widgets/home/common/long-card.dart';
import 'package:oblio/widgets/home/owned/owned_opp_widgets.dart';
import 'package:oblio/widgets/home/performers/performers_widgets.dart';
import 'package:oblio/widgets/home/pipeline/pipeline_widgets.dart';
import 'package:oblio/widgets/home/scheduled/scheduled_widgets.dart';
import 'package:oblio/widgets/home/stats/stats_widgets.dart';
import 'package:oblio/widgets/home/wins/wins_widgets.dart';

class HomeWidgets extends StatefulWidget {
  final double width;
  const HomeWidgets({Key? key, required this.width}) : super(key: key);

  @override
  State<HomeWidgets> createState() => _HomeWidgetsState();
}

class _HomeWidgetsState extends State<HomeWidgets> {
  @override
  Widget build(BuildContext context) {
    final List<Widget> widgets = [
      StatsWidgets(),
      PerformersWidgets(),
      ScheduledWidets(),
      PipelineWidets(),
      WinsWidets(),
      OwnedOppWidets()
    ];

    //TODO: Clean this up
    int columns = int.parse((widget.width / 460).toStringAsFixed(0));
    columns = columns > 4 ? 4 : columns;

    return Scaffold(
        backgroundColor: Colors.transparent,
        body: Align(
            alignment: Alignment.topCenter,
            child: columns == 1
                ? ListView.builder(
                    itemCount: widgets.length,
                    itemBuilder: (context, i) {
                      return Padding(
                          padding:
                              EdgeInsets.only(top: 10, left: 10, right: 10),
                          child: widgets[i]);
                    })
                : viewPort(columns, widgets)));
  }

  Widget viewPort(int columns, List<Widget> widgets) {
    return SingleChildScrollView(
      controller: ScrollController(),
      child: Padding(
        padding: const EdgeInsets.all(10.0),
        child: Builder(builder: (BuildContext innerContext) {
          return Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              for (var index = 1; index <= columns; index++)
                // TODO: Fix unnecessary widget re-builds when moved around
                Expanded(
                  child: Column(children: [
                    for (var i = index - 1; i < widgets.length; i += columns)
                      Padding(
                        padding: EdgeInsets.all(widget.width < 1200 ? 7 : 10),
                        child: widgets[i],
                      ),
                  ]),
                )
            ],
          );
        }),
      ),
    );
  }
}
