import '/backend/backend.dart';
import '/bar_side/forms/field_group_list/field_group/field_list/field/field_types/field_dropdown/field_dropdown_widget.dart';
import '/bar_side/forms/field_group_list/field_group/field_list/field/field_types/field_image/field_image_widget.dart';
import '/bar_side/forms/field_group_list/field_group/field_list/field/field_types/field_radio/field_radio_widget.dart';
import '/bar_side/forms/field_group_list/field_group/field_list/field/field_types/field_string/field_string_widget.dart';
import '/flutter_flow/flutter_flow_util.dart';
import 'package:flutter/material.dart';
import 'field_dynamic_model.dart';
export 'field_dynamic_model.dart';

class FieldDynamicWidget extends StatefulWidget {
  const FieldDynamicWidget({
    super.key,
    this.properties,
    this.selectedProperties,
    this.field,
    this.objectField,
    this.recordField,
  });

  final List<PropertyStruct>? properties;
  final List<PropertyStruct>? selectedProperties;
  final FieldRecord? field;
  final ObjectStruct? objectField;
  final RecordStruct? recordField;

  @override
  State<FieldDynamicWidget> createState() => _FieldDynamicWidgetState();
}

class _FieldDynamicWidgetState extends State<FieldDynamicWidget> {
  late FieldDynamicModel _model;

  @override
  void setState(VoidCallback callback) {
    super.setState(callback);
    _model.onUpdate();
  }

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => FieldDynamicModel());

    WidgetsBinding.instance.addPostFrameCallback((_) => safeSetState(() {}));
  }

  @override
  void dispose() {
    _model.maybeDispose();

    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(),
      child: Padding(
        padding: EdgeInsetsDirectional.fromSTEB(24.0, 0.0, 24.0, 0.0),
        child: Column(
          mainAxisSize: MainAxisSize.max,
          children: [
            if (true == true)
              Padding(
                padding: EdgeInsetsDirectional.fromSTEB(0.0, 0.0, 0.0, 16.0),
                child: wrapWithModel(
                  model: _model.fieldStringModel,
                  updateCallback: () => safeSetState(() {}),
                  child: FieldStringWidget(
                    fieldName: valueOrDefault<String>(
                      widget.field?.hasDataRecord().toString(),
                      'field name',
                    ),
                  ),
                ),
              ),
            if (true == false)
              Padding(
                padding: EdgeInsetsDirectional.fromSTEB(0.0, 0.0, 0.0, 16.0),
                child: wrapWithModel(
                  model: _model.fieldImageModel,
                  updateCallback: () => safeSetState(() {}),
                  child: FieldImageWidget(),
                ),
              ),
            if (true == false)
              Padding(
                padding: EdgeInsetsDirectional.fromSTEB(0.0, 0.0, 0.0, 16.0),
                child: wrapWithModel(
                  model: _model.fieldRadioBoxModel,
                  updateCallback: () => safeSetState(() {}),
                  child: FieldRadioWidget(
                    values: widget.properties,
                  ),
                ),
              ),
            if (true == false)
              wrapWithModel(
                model: _model.fieldDropdownModel,
                updateCallback: () => safeSetState(() {}),
                child: FieldDropdownWidget(
                  properties: widget.properties,
                  selected: widget.selectedProperties,
                  action: () async {},
                ),
              ),
          ],
        ),
      ),
    );
  }
}
