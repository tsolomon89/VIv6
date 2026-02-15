import '/bar_side/components/radio/radio_item/radio_item_widget.dart';
import '/flutter_flow/flutter_flow_util.dart';
import 'field_checkbox_widget.dart' show FieldCheckboxWidget;
import 'package:flutter/material.dart';

class FieldCheckboxModel extends FlutterFlowModel<FieldCheckboxWidget> {
  ///  Local state fields for this component.

  String? radioSelected = '';

  bool boolean1 = false;

  bool boolean2 = false;

  bool boolean3 = false;

  bool boolean4 = false;

  bool boolean5 = false;

  bool boolean6 = false;

  String? string1 = '';

  String? string2 = '';

  String? string3 = '';

  String? string4 = '';

  String? string5 = '';

  String? string6 = '';

  ///  State fields for stateful widgets in this component.

  // Model for radioItem1.
  late RadioItemModel radioItem1Model1;
  // Model for radioItem2.
  late RadioItemModel radioItem2Model;
  // Model for radioItem3.
  late RadioItemModel radioItem3Model;
  // Model for radioItem4.
  late RadioItemModel radioItem4Model;
  // Model for radioItem5.
  late RadioItemModel radioItem5Model;
  // Model for radioItem6.
  late RadioItemModel radioItem6Model;

  @override
  void initState(BuildContext context) {
    radioItem1Model1 = createModel(context, () => RadioItemModel());
    radioItem2Model = createModel(context, () => RadioItemModel());
    radioItem3Model = createModel(context, () => RadioItemModel());
    radioItem4Model = createModel(context, () => RadioItemModel());
    radioItem5Model = createModel(context, () => RadioItemModel());
    radioItem6Model = createModel(context, () => RadioItemModel());
  }

  @override
  void dispose() {
    radioItem1Model1.dispose();
    radioItem2Model.dispose();
    radioItem3Model.dispose();
    radioItem4Model.dispose();
    radioItem5Model.dispose();
    radioItem6Model.dispose();
  }
}
