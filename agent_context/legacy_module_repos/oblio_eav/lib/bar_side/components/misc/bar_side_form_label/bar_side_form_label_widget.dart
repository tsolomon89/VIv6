import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import 'package:flutter/material.dart';
import 'bar_side_form_label_model.dart';
export 'bar_side_form_label_model.dart';

class BarSideFormLabelWidget extends StatefulWidget {
  const BarSideFormLabelWidget({
    super.key,
    this.textLabel,
  });

  final String? textLabel;

  @override
  State<BarSideFormLabelWidget> createState() => _BarSideFormLabelWidgetState();
}

class _BarSideFormLabelWidgetState extends State<BarSideFormLabelWidget> {
  late BarSideFormLabelModel _model;

  @override
  void setState(VoidCallback callback) {
    super.setState(callback);
    _model.onUpdate();
  }

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => BarSideFormLabelModel());

    WidgetsBinding.instance.addPostFrameCallback((_) => safeSetState(() {}));
  }

  @override
  void dispose() {
    _model.maybeDispose();

    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: AlignmentDirectional(0.0, 0.0),
      child: Container(
        height: 48.0,
        constraints: BoxConstraints(
          maxWidth: 350.0,
        ),
        decoration: BoxDecoration(),
        child: Align(
          alignment: AlignmentDirectional(-1.0, 0.0),
          child: Text(
            valueOrDefault<String>(
              widget.textLabel,
              'Field Group Label',
            ),
            style: FlutterFlowTheme.of(context).bodyMedium.override(
                  fontFamily: FlutterFlowTheme.of(context).bodyMediumFamily,
                  color: FlutterFlowTheme.of(context).navLabel,
                  letterSpacing: 0.0,
                  useGoogleFonts:
                      !FlutterFlowTheme.of(context).bodyMediumIsCustom,
                ),
          ),
        ),
      ),
    );
  }
}
