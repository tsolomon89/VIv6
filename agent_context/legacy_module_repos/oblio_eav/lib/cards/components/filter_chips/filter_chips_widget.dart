import '/flutter_flow/flutter_flow_choice_chips.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/form_field_controller.dart';
import 'package:flutter/material.dart';
import 'filter_chips_model.dart';
export 'filter_chips_model.dart';

class FilterChipsWidget extends StatefulWidget {
  const FilterChipsWidget({super.key});

  @override
  State<FilterChipsWidget> createState() => _FilterChipsWidgetState();
}

class _FilterChipsWidgetState extends State<FilterChipsWidget> {
  late FilterChipsModel _model;

  @override
  void setState(VoidCallback callback) {
    super.setState(callback);
    _model.onUpdate();
  }

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => FilterChipsModel());

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
      constraints: BoxConstraints(
        maxWidth: 500.0,
        maxHeight: 50.0,
      ),
      decoration: BoxDecoration(),
      child: Stack(
        alignment: AlignmentDirectional(0.0, 0.0),
        children: [
          Padding(
            padding: EdgeInsetsDirectional.fromSTEB(16.0, 0.0, 16.0, 0.0),
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                mainAxisSize: MainAxisSize.max,
                children: [
                  FlutterFlowChoiceChips(
                    options: [
                      ChipData('Option 1'),
                      ChipData('some text'),
                      ChipData('some text'),
                      ChipData('some text'),
                      ChipData('some text'),
                      ChipData('some text')
                    ],
                    onChanged: (val) =>
                        safeSetState(() => _model.choiceChipsValues = val),
                    selectedChipStyle: ChipStyle(
                      backgroundColor: FlutterFlowTheme.of(context).accent1,
                      textStyle: FlutterFlowTheme.of(context)
                          .bodyMedium
                          .override(
                            fontFamily:
                                FlutterFlowTheme.of(context).bodyMediumFamily,
                            color: FlutterFlowTheme.of(context)
                                .secondaryBackground,
                            letterSpacing: 0.0,
                            useGoogleFonts: !FlutterFlowTheme.of(context)
                                .bodyMediumIsCustom,
                          ),
                      iconColor: Color(0xE6FFFFFF),
                      iconSize: 18.0,
                      elevation: 4.0,
                      borderRadius: BorderRadius.circular(16.0),
                    ),
                    unselectedChipStyle: ChipStyle(
                      backgroundColor: Color(0xFFB6BBDB),
                      textStyle: FlutterFlowTheme.of(context)
                          .bodyMedium
                          .override(
                            fontFamily:
                                FlutterFlowTheme.of(context).bodyMediumFamily,
                            color: FlutterFlowTheme.of(context).secondaryText,
                            letterSpacing: 0.0,
                            useGoogleFonts: !FlutterFlowTheme.of(context)
                                .bodyMediumIsCustom,
                          ),
                      iconColor: Color(0x00000000),
                      iconSize: 18.0,
                      elevation: 0.0,
                      borderRadius: BorderRadius.circular(16.0),
                    ),
                    chipSpacing: 8.0,
                    rowSpacing: 12.0,
                    multiselect: true,
                    initialized: _model.choiceChipsValues != null,
                    alignment: WrapAlignment.start,
                    controller: _model.choiceChipsValueController ??=
                        FormFieldController<List<String>>(
                      [],
                    ),
                    wrapped: false,
                  ),
                ],
              ),
            ),
          ),
          Row(
            mainAxisSize: MainAxisSize.max,
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                width: 32.0,
                height: 50.0,
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [
                      FlutterFlowTheme.of(context).secondaryBackground,
                      FlutterFlowTheme.of(context).fade
                    ],
                    stops: [0.5, 1.0],
                    begin: AlignmentDirectional(-1.0, 0.0),
                    end: AlignmentDirectional(1.0, 0),
                  ),
                ),
              ),
              Container(
                width: 32.0,
                height: 50.0,
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [
                      FlutterFlowTheme.of(context).secondaryBackground,
                      FlutterFlowTheme.of(context).fade
                    ],
                    stops: [0.5, 1.0],
                    begin: AlignmentDirectional(1.0, 0.0),
                    end: AlignmentDirectional(-1.0, 0),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
