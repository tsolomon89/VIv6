import '/bar_side/components/radio/radio/radio_widget.dart';
import '/flutter_flow/flutter_flow_util.dart';
import 'radio_item_widget.dart' show RadioItemWidget;
import 'package:flutter/material.dart';

class RadioItemModel extends FlutterFlowModel<RadioItemWidget> {
  ///  Local state fields for this component.

  String valueString = 'none';

  bool isSelected = false;

  String currentSelection = 'none';

  ///  State fields for stateful widgets in this component.

  // Model for radio component.
  late RadioModel radioModel;

  @override
  void initState(BuildContext context) {
    radioModel = createModel(context, () => RadioModel());
  }

  @override
  void dispose() {
    radioModel.dispose();
  }
}
