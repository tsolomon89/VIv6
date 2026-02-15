import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'field_relation_object_model.dart';
export 'field_relation_object_model.dart';

class FieldRelationObjectWidget extends StatefulWidget {
  const FieldRelationObjectWidget({
    super.key,
    this.propertyValue,
    this.fieldName,
  });

  final String? propertyValue;
  final String? fieldName;

  @override
  State<FieldRelationObjectWidget> createState() =>
      _FieldRelationObjectWidgetState();
}

class _FieldRelationObjectWidgetState extends State<FieldRelationObjectWidget> {
  late FieldRelationObjectModel _model;

  @override
  void setState(VoidCallback callback) {
    super.setState(callback);
    _model.onUpdate();
  }

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => FieldRelationObjectModel());

    _model.listTextFieldTextController ??= TextEditingController(
        text: widget.propertyValue != null && widget.propertyValue != ''
            ? widget.propertyValue
            : 'Enter ${widget.fieldName}');
    _model.listTextFieldFocusNode ??= FocusNode();

    WidgetsBinding.instance.addPostFrameCallback((_) => safeSetState(() {}));
  }

  @override
  void dispose() {
    _model.maybeDispose();

    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return TextFormField(
      controller: _model.listTextFieldTextController,
      focusNode: _model.listTextFieldFocusNode,
      onFieldSubmitted: (_) async {
        _model.fieldName = widget.fieldName!;
        _model.valueEntered = _model.listTextFieldTextController.text;
        safeSetState(() {});
      },
      autofillHints: [AutofillHints.name],
      textCapitalization: TextCapitalization.words,
      obscureText: false,
      decoration: InputDecoration(
        labelText: widget.fieldName,
        labelStyle: FlutterFlowTheme.of(context).labelMedium.override(
              fontFamily: FlutterFlowTheme.of(context).labelMediumFamily,
              color: FlutterFlowTheme.of(context).secondaryText,
              letterSpacing: 0.0,
              useGoogleFonts: !FlutterFlowTheme.of(context).labelMediumIsCustom,
            ),
        hintText: 'The Contact\'s ${widget.fieldName}',
        hintStyle: FlutterFlowTheme.of(context).labelMedium.override(
              fontFamily: FlutterFlowTheme.of(context).labelMediumFamily,
              color: FlutterFlowTheme.of(context).secondaryText,
              letterSpacing: 0.0,
              useGoogleFonts: !FlutterFlowTheme.of(context).labelMediumIsCustom,
            ),
        errorStyle: FlutterFlowTheme.of(context).bodyMedium.override(
              fontFamily: FlutterFlowTheme.of(context).bodyMediumFamily,
              color: FlutterFlowTheme.of(context).error,
              letterSpacing: 0.0,
              useGoogleFonts: !FlutterFlowTheme.of(context).bodyMediumIsCustom,
            ),
        enabledBorder: UnderlineInputBorder(
          borderSide: BorderSide(
            color: FlutterFlowTheme.of(context).secondaryText,
            width: 1.0,
          ),
          borderRadius: BorderRadius.only(
            bottomLeft: Radius.circular(0.0),
            bottomRight: Radius.circular(0.0),
            topLeft: Radius.circular(8.0),
            topRight: Radius.circular(8.0),
          ),
        ),
        focusedBorder: UnderlineInputBorder(
          borderSide: BorderSide(
            color: FlutterFlowTheme.of(context).primary,
            width: 1.0,
          ),
          borderRadius: BorderRadius.only(
            bottomLeft: Radius.circular(0.0),
            bottomRight: Radius.circular(0.0),
            topLeft: Radius.circular(8.0),
            topRight: Radius.circular(8.0),
          ),
        ),
        errorBorder: UnderlineInputBorder(
          borderSide: BorderSide(
            color: FlutterFlowTheme.of(context).error,
            width: 1.0,
          ),
          borderRadius: BorderRadius.only(
            bottomLeft: Radius.circular(0.0),
            bottomRight: Radius.circular(0.0),
            topLeft: Radius.circular(8.0),
            topRight: Radius.circular(8.0),
          ),
        ),
        focusedErrorBorder: UnderlineInputBorder(
          borderSide: BorderSide(
            color: FlutterFlowTheme.of(context).error,
            width: 1.0,
          ),
          borderRadius: BorderRadius.only(
            bottomLeft: Radius.circular(0.0),
            bottomRight: Radius.circular(0.0),
            topLeft: Radius.circular(8.0),
            topRight: Radius.circular(8.0),
          ),
        ),
        filled: true,
        fillColor: FlutterFlowTheme.of(context).fieldBackground,
        contentPadding: EdgeInsetsDirectional.fromSTEB(16.0, 12.0, 0.0, 12.0),
      ),
      style: FlutterFlowTheme.of(context).bodyMedium.override(
            fontFamily: FlutterFlowTheme.of(context).bodyMediumFamily,
            color: FlutterFlowTheme.of(context).secondaryText,
            letterSpacing: 0.0,
            useGoogleFonts: !FlutterFlowTheme.of(context).bodyMediumIsCustom,
          ),
      cursorColor: FlutterFlowTheme.of(context).primary,
      validator:
          _model.listTextFieldTextControllerValidator.asValidator(context),
      inputFormatters: [
        if (!isAndroid && !isiOS)
          TextInputFormatter.withFunction((oldValue, newValue) {
            return TextEditingValue(
              selection: newValue.selection,
              text: newValue.text.toCapitalization(TextCapitalization.words),
            );
          }),
      ],
    );
  }
}
