import '/bar_side/components/calendar/item_calendar/item_calendar_widget.dart';
import '/flutter_flow/flutter_flow_util.dart';
import 'bar_side_calendar_widget.dart' show BarSideCalendarWidget;
import 'package:flutter/material.dart';

class BarSideCalendarModel extends FlutterFlowModel<BarSideCalendarWidget> {
  ///  Local state fields for this component.

  DateTime? dateSelected;

  DateTime? dateCurrent;

  ///  State fields for stateful widgets in this component.

  DateTime? datePicked;
  // Model for itemCalendar component.
  late ItemCalendarModel itemCalendarModel;

  @override
  void initState(BuildContext context) {
    itemCalendarModel = createModel(context, () => ItemCalendarModel());
  }

  @override
  void dispose() {
    itemCalendarModel.dispose();
  }
}
