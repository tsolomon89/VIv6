import '/backend/backend.dart';
import '/backend/schema/structs/index.dart';
import '/flutter_flow/flutter_flow_drop_down.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/form_field_controller.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'dropdown_item_default_model.dart';
export 'dropdown_item_default_model.dart';

class DropdownItemDefaultWidget extends StatefulWidget {
  const DropdownItemDefaultWidget({
    super.key,
    this.properties,
    String? fieldName,
    this.filters,
    this.initialValue,
    this.filterField,
    this.action,
  }) : this.fieldName = fieldName ?? 'Default';

  final List<PropertyStruct>? properties;
  final String fieldName;
  final List<PropertyStruct>? filters;
  final PropertyStruct? initialValue;
  final String? filterField;
  final Future Function()? action;

  @override
  State<DropdownItemDefaultWidget> createState() =>
      _DropdownItemDefaultWidgetState();
}

class _DropdownItemDefaultWidgetState extends State<DropdownItemDefaultWidget> {
  late DropdownItemDefaultModel _model;

  @override
  void setState(VoidCallback callback) {
    super.setState(callback);
    _model.onUpdate();
  }

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => DropdownItemDefaultModel());

    WidgetsBinding.instance.addPostFrameCallback((_) => safeSetState(() {}));
  }

  @override
  void dispose() {
    _model.maybeDispose();

    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    context.watch<FFAppState>();

    return FlutterFlowDropDown<String>(
      multiSelectController: _model.dropDownValueController ??=
          FormListFieldController<String>(null),
      options: [widget.properties!.length.toString()],
      width: double.infinity,
      height: 44.0,
      searchHintTextStyle: FlutterFlowTheme.of(context).labelMedium.override(
            fontFamily: FlutterFlowTheme.of(context).labelMediumFamily,
            letterSpacing: 0.0,
            useGoogleFonts: !FlutterFlowTheme.of(context).labelMediumIsCustom,
          ),
      searchTextStyle: FlutterFlowTheme.of(context).bodyMedium.override(
            fontFamily: FlutterFlowTheme.of(context).bodyMediumFamily,
            letterSpacing: 0.0,
            useGoogleFonts: !FlutterFlowTheme.of(context).bodyMediumIsCustom,
          ),
      textStyle: FlutterFlowTheme.of(context).bodyMedium.override(
            fontFamily: FlutterFlowTheme.of(context).bodyMediumFamily,
            letterSpacing: 0.0,
            useGoogleFonts: !FlutterFlowTheme.of(context).bodyMediumIsCustom,
          ),
      hintText: widget.fieldName,
      searchHintText: 'Search for an item...',
      searchCursorColor: FlutterFlowTheme.of(context).secondaryText,
      icon: Icon(
        Icons.keyboard_arrow_down_rounded,
        color: FlutterFlowTheme.of(context).secondaryText,
        size: 24.0,
      ),
      fillColor: Color(0xFFF4F4F4),
      elevation: 2.0,
      borderColor: Colors.transparent,
      borderWidth: 0.5,
      borderRadius: 0.0,
      margin: EdgeInsetsDirectional.fromSTEB(8.0, 4.0, 16.0, 4.0),
      hidesUnderline: true,
      isOverButton: true,
      isSearchable: true,
      isMultiSelect: true,
      onMultiSelectChanged: (val) async {
        safeSetState(() => _model.dropDownValue = val);
        _model.selectedValues = widget.properties!
            .where((e) => widget.properties!.contains(e))
            .toList()
            .cast<PropertyStruct>();
        safeSetState(() {});
        await widget.action?.call();
      },
    );
  }
}
