import '/cards/components/filters/list_tile_group/tile_group/list_tiles/tiles/components/icon_dynamic/icon_dynamic_widget.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import 'package:flutter/material.dart';
import 't_ile_double_line_model.dart';
export 't_ile_double_line_model.dart';

class TIleDoubleLineWidget extends StatefulWidget {
  const TIleDoubleLineWidget({
    super.key,
    this.nameField,
    this.valueProperty,
    bool? inNavable,
  }) : this.inNavable = inNavable ?? false;

  final String? nameField;
  final String? valueProperty;
  final bool inNavable;

  @override
  State<TIleDoubleLineWidget> createState() => _TIleDoubleLineWidgetState();
}

class _TIleDoubleLineWidgetState extends State<TIleDoubleLineWidget> {
  late TIleDoubleLineModel _model;

  @override
  void setState(VoidCallback callback) {
    super.setState(callback);
    _model.onUpdate();
  }

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => TIleDoubleLineModel());

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
      height: 70.0,
      constraints: BoxConstraints(
        maxWidth: 400.0,
      ),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(0.0),
        shape: BoxShape.rectangle,
      ),
      child: Padding(
        padding: EdgeInsets.all(8.0),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Align(
              alignment: AlignmentDirectional(0.0, -1.0),
              child: Padding(
                padding: EdgeInsetsDirectional.fromSTEB(0.0, 8.0, 0.0, 0.0),
                child: wrapWithModel(
                  model: _model.iconDynamicModel,
                  updateCallback: () => safeSetState(() {}),
                  child: IconDynamicWidget(
                    nameFIeld: widget.nameField,
                  ),
                ),
              ),
            ),
            Column(
              mainAxisSize: MainAxisSize.max,
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  valueOrDefault<String>(
                    widget.nameField,
                    'Phone Number',
                  ),
                  style: FlutterFlowTheme.of(context).labelMedium.override(
                        fontFamily:
                            FlutterFlowTheme.of(context).labelMediumFamily,
                        letterSpacing: 0.0,
                        useGoogleFonts:
                            !FlutterFlowTheme.of(context).labelMediumIsCustom,
                      ),
                ),
                Padding(
                  padding: EdgeInsetsDirectional.fromSTEB(0.0, 4.0, 0.0, 0.0),
                  child: Text(
                    valueOrDefault<String>(
                      widget.valueProperty,
                      '(123) 456-7890',
                    ),
                    style: FlutterFlowTheme.of(context).titleMedium.override(
                          fontFamily:
                              FlutterFlowTheme.of(context).titleMediumFamily,
                          letterSpacing: 0.0,
                          useGoogleFonts:
                              !FlutterFlowTheme.of(context).titleMediumIsCustom,
                        ),
                  ),
                ),
              ],
            ),
            if (widget.inNavable)
              Expanded(
                child: Align(
                  alignment: AlignmentDirectional(1.0, 0.0),
                  child: Icon(
                    Icons.arrow_forward_ios,
                    color: FlutterFlowTheme.of(context).secondaryText,
                    size: 18.0,
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
