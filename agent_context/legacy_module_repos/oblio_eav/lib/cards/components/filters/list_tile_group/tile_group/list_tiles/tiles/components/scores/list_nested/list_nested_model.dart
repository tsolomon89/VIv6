import '/flutter_flow/flutter_flow_util.dart';
import 'list_nested_widget.dart' show ListNestedWidget;
import 'package:expandable/expandable.dart';
import 'package:flutter/material.dart';

class ListNestedModel extends FlutterFlowModel<ListNestedWidget> {
  ///  State fields for stateful widgets in this component.

  // State field(s) for Expandable widget.
  late ExpandableController expandableExpandableController1;

  // State field(s) for Expandable widget.
  late ExpandableController expandableExpandableController2;

  @override
  void initState(BuildContext context) {}

  @override
  void dispose() {
    expandableExpandableController1.dispose();
    expandableExpandableController2.dispose();
  }
}
