import '/backend/backend.dart';
import '/backend/schema/structs/index.dart';
import '/bar_side/components/drop_down/dropdown_list/dropdown_list_widget.dart';
import '/bar_side/components/misc/bar_side_form_label/bar_side_form_label_widget.dart';
import '/bar_side/forms/field_group_list/field_group/field_list/field/field_types/field_radio/field_radio_widget.dart';
import '/flutter_flow/flutter_flow_util.dart';
import 'form_old_widget.dart' show FormOldWidget;
import 'package:expandable/expandable.dart';
import 'package:flutter/material.dart';

class FormOldModel extends FlutterFlowModel<FormOldWidget> {
  ///  Local state fields for this component.

  List<PropertyStruct> contactLinksx = [];
  void addToContactLinksx(PropertyStruct item) => contactLinksx.add(item);
  void removeFromContactLinksx(PropertyStruct item) =>
      contactLinksx.remove(item);
  void removeAtIndexFromContactLinksx(int index) =>
      contactLinksx.removeAt(index);
  void insertAtIndexInContactLinksx(int index, PropertyStruct item) =>
      contactLinksx.insert(index, item);
  void updateContactLinksxAtIndex(
          int index, Function(PropertyStruct) updateFn) =>
      contactLinksx[index] = updateFn(contactLinksx[index]);

  ///  State fields for stateful widgets in this component.

  final formKey = GlobalKey<FormState>();
  // State field(s) for Expandable widget.
  late ExpandableController expandableExpandableController1;

  // Model for barSideFormLabel component.
  late BarSideFormLabelModel barSideFormLabelModel1;
  bool isDataUploading_uploadData8z = false;
  FFUploadedFile uploadedLocalFile_uploadData8z =
      FFUploadedFile(bytes: Uint8List.fromList([]));
  String uploadedFileUrl_uploadData8z = '';

  // State field(s) for nameFirst widget.
  FocusNode? nameFirstFocusNode;
  TextEditingController? nameFirstTextController;
  String? Function(BuildContext, String?)? nameFirstTextControllerValidator;
  // State field(s) for nameLast widget.
  FocusNode? nameLastFocusNode;
  TextEditingController? nameLastTextController;
  String? Function(BuildContext, String?)? nameLastTextControllerValidator;
  // State field(s) for Expandable widget.
  late ExpandableController expandableExpandableController2;

  // Model for barSideFormLabel component.
  late BarSideFormLabelModel barSideFormLabelModel2;
  // Model for dropdownList component.
  late DropdownListModel dropdownListModel;
  // State field(s) for Expandable widget.
  late ExpandableController expandableExpandableController3;

  // Model for barSideFormLabel component.
  late BarSideFormLabelModel barSideFormLabelModel3;
  // State field(s) for urlLinkedin widget.
  FocusNode? urlLinkedinFocusNode;
  TextEditingController? urlLinkedinTextController;
  String? Function(BuildContext, String?)? urlLinkedinTextControllerValidator;
  // State field(s) for urlFacebook widget.
  FocusNode? urlFacebookFocusNode;
  TextEditingController? urlFacebookTextController;
  String? Function(BuildContext, String?)? urlFacebookTextControllerValidator;
  // State field(s) for urlX widget.
  FocusNode? urlXFocusNode;
  TextEditingController? urlXTextController;
  String? Function(BuildContext, String?)? urlXTextControllerValidator;
  // State field(s) for Expandable widget.
  late ExpandableController expandableExpandableController4;

  // Model for barSideFormLabel component.
  late BarSideFormLabelModel barSideFormLabelModel4;
  // Model for fieldRadio component.
  late FieldRadioModel fieldRadioModel;

  @override
  void initState(BuildContext context) {
    barSideFormLabelModel1 =
        createModel(context, () => BarSideFormLabelModel());
    barSideFormLabelModel2 =
        createModel(context, () => BarSideFormLabelModel());
    dropdownListModel = createModel(context, () => DropdownListModel());
    barSideFormLabelModel3 =
        createModel(context, () => BarSideFormLabelModel());
    barSideFormLabelModel4 =
        createModel(context, () => BarSideFormLabelModel());
    fieldRadioModel = createModel(context, () => FieldRadioModel());
  }

  @override
  void dispose() {
    expandableExpandableController1.dispose();
    barSideFormLabelModel1.dispose();
    nameFirstFocusNode?.dispose();
    nameFirstTextController?.dispose();

    nameLastFocusNode?.dispose();
    nameLastTextController?.dispose();

    expandableExpandableController2.dispose();
    barSideFormLabelModel2.dispose();
    dropdownListModel.dispose();
    expandableExpandableController3.dispose();
    barSideFormLabelModel3.dispose();
    urlLinkedinFocusNode?.dispose();
    urlLinkedinTextController?.dispose();

    urlFacebookFocusNode?.dispose();
    urlFacebookTextController?.dispose();

    urlXFocusNode?.dispose();
    urlXTextController?.dispose();

    expandableExpandableController4.dispose();
    barSideFormLabelModel4.dispose();
    fieldRadioModel.dispose();
  }
}
