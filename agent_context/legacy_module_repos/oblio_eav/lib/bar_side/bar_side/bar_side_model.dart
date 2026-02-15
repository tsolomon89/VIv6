import '/bar_side/bar_side_form/bar_side_form_widget.dart';
import '/bar_side/components/calendar/bar_side_calendar/bar_side_calendar_widget.dart';
import '/bar_side/components/misc/bar_side_button/bar_side_button_widget.dart';
import '/cards/components/filters/list_tile_group/tile_group/list_tiles/tiles/tile_dynamic_expandable/tile_dynamic_expandable_widget.dart';
import '/flutter_flow/flutter_flow_util.dart';
import 'bar_side_widget.dart' show BarSideWidget;
import 'package:flutter/material.dart';

class BarSideModel extends FlutterFlowModel<BarSideWidget> {
  ///  State fields for stateful widgets in this component.

  // Model for barSideButton component.
  late BarSideButtonModel barSideButtonModel1;
  // Model for barSideButton component.
  late BarSideButtonModel barSideButtonModel2;
  // Model for barSideButton component.
  late BarSideButtonModel barSideButtonModel3;
  // Model for barSideCalendar component.
  late BarSideCalendarModel barSideCalendarModel;
  // Model for tileDynamicExpandable component.
  late TileDynamicExpandableModel tileDynamicExpandableModel1;
  // Model for tileDynamicExpandable component.
  late TileDynamicExpandableModel tileDynamicExpandableModel2;
  // Model for tileDynamicExpandable component.
  late TileDynamicExpandableModel tileDynamicExpandableModel3;
  // Model for tileDynamicExpandable component.
  late TileDynamicExpandableModel tileDynamicExpandableModel4;
  // Model for tileDynamicExpandable component.
  late TileDynamicExpandableModel tileDynamicExpandableModel5;
  // Model for tileDynamicExpandable component.
  late TileDynamicExpandableModel tileDynamicExpandableModel6;
  // Model for barSideForm component.
  late BarSideFormModel barSideFormModel;

  @override
  void initState(BuildContext context) {
    barSideButtonModel1 = createModel(context, () => BarSideButtonModel());
    barSideButtonModel2 = createModel(context, () => BarSideButtonModel());
    barSideButtonModel3 = createModel(context, () => BarSideButtonModel());
    barSideCalendarModel = createModel(context, () => BarSideCalendarModel());
    tileDynamicExpandableModel1 =
        createModel(context, () => TileDynamicExpandableModel());
    tileDynamicExpandableModel2 =
        createModel(context, () => TileDynamicExpandableModel());
    tileDynamicExpandableModel3 =
        createModel(context, () => TileDynamicExpandableModel());
    tileDynamicExpandableModel4 =
        createModel(context, () => TileDynamicExpandableModel());
    tileDynamicExpandableModel5 =
        createModel(context, () => TileDynamicExpandableModel());
    tileDynamicExpandableModel6 =
        createModel(context, () => TileDynamicExpandableModel());
    barSideFormModel = createModel(context, () => BarSideFormModel());
  }

  @override
  void dispose() {
    barSideButtonModel1.dispose();
    barSideButtonModel2.dispose();
    barSideButtonModel3.dispose();
    barSideCalendarModel.dispose();
    tileDynamicExpandableModel1.dispose();
    tileDynamicExpandableModel2.dispose();
    tileDynamicExpandableModel3.dispose();
    tileDynamicExpandableModel4.dispose();
    tileDynamicExpandableModel5.dispose();
    tileDynamicExpandableModel6.dispose();
    barSideFormModel.dispose();
  }
}
