import '/backend/backend.dart';
import '/bar_side/bar_side_form/bar_side_form_widget.dart';
import '/bar_side/components/calendar/bar_side_calendar/bar_side_calendar_widget.dart';
import '/bar_side/components/misc/bar_side_button/bar_side_button_widget.dart';
import '/cards/components/filters/list_tile_group/tile_group/list_tiles/tiles/tile_dynamic_expandable/tile_dynamic_expandable_widget.dart';
import '/flutter_flow/flutter_flow_animations.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import '/flutter_flow/random_data_util.dart' as random_data;
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'bar_side_model.dart';
export 'bar_side_model.dart';

class BarSideWidget extends StatefulWidget {
  const BarSideWidget({
    super.key,
    this.documentsField,
  });

  final List<FieldRecord>? documentsField;

  @override
  State<BarSideWidget> createState() => _BarSideWidgetState();
}

class _BarSideWidgetState extends State<BarSideWidget>
    with TickerProviderStateMixin {
  late BarSideModel _model;

  final animationsMap = <String, AnimationInfo>{};

  @override
  void setState(VoidCallback callback) {
    super.setState(callback);
    _model.onUpdate();
  }

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => BarSideModel());

    animationsMap.addAll({
      'rowOnActionTriggerAnimation': AnimationInfo(
        trigger: AnimationTrigger.onActionTrigger,
        applyInitialState: true,
        effectsBuilder: () => [
          MoveEffect(
            curve: Curves.bounceOut,
            delay: 0.0.ms,
            duration: 1290.0.ms,
            begin: Offset(0.0, 0.0),
            end: Offset(0.0, 0.0),
          ),
        ],
      ),
    });
    setupAnimations(
      animationsMap.values.where((anim) =>
          anim.trigger == AnimationTrigger.onActionTrigger ||
          !anim.applyInitialState),
      this,
    );

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

    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        if (responsiveVisibility(
          context: context,
          phone: false,
          tablet: false,
        ))
          Material(
            color: Colors.transparent,
            elevation: 8.0,
            child: AnimatedContainer(
              duration: Duration(milliseconds: 390),
              curve: Curves.bounceOut,
              width: 60.0,
              height: double.infinity,
              decoration: BoxDecoration(
                color: FlutterFlowTheme.of(context).foreground,
                border: Border.all(
                  color: Color(0x00FFFFFF),
                ),
              ),
              child: Padding(
                padding: EdgeInsetsDirectional.fromSTEB(8.0, 0.0, 8.0, 0.0),
                child: Column(
                  mainAxisSize: MainAxisSize.max,
                  children: [
                    wrapWithModel(
                      model: _model.barSideButtonModel1,
                      updateCallback: () => safeSetState(() {}),
                      child: BarSideButtonWidget(
                        iconToggleOff: Icon(
                          Icons.add_task,
                          color: Color(0xFFFA4583),
                        ),
                        iconToggleOn: Icon(
                          Icons.add_task,
                          color:
                              FlutterFlowTheme.of(context).secondaryBackground,
                        ),
                        type: 'activity',
                        color: Color(0xFFFA4583),
                      ),
                    ),
                    wrapWithModel(
                      model: _model.barSideButtonModel2,
                      updateCallback: () => safeSetState(() {}),
                      child: BarSideButtonWidget(
                        iconToggleOff: Icon(
                          Icons.calendar_month,
                          color: FlutterFlowTheme.of(context).primary,
                        ),
                        iconToggleOn: Icon(
                          Icons.calendar_month,
                          color:
                              FlutterFlowTheme.of(context).secondaryBackground,
                        ),
                        type: 'calendar',
                        color: FlutterFlowTheme.of(context).primary,
                      ),
                    ),
                    wrapWithModel(
                      model: _model.barSideButtonModel3,
                      updateCallback: () => safeSetState(() {}),
                      child: BarSideButtonWidget(
                        iconToggleOff: Icon(
                          Icons.person_add_alt_1,
                          color: FlutterFlowTheme.of(context).secondary,
                        ),
                        iconToggleOn: Icon(
                          Icons.person_add_alt_1,
                          color:
                              FlutterFlowTheme.of(context).secondaryBackground,
                        ),
                        type: 'contact',
                        color: FlutterFlowTheme.of(context).secondary,
                      ),
                    ),
                  ]
                      .divide(SizedBox(height: 18.0))
                      .addToStart(SizedBox(height: 24.0)),
                ),
              ),
            ),
          ),
        if ((FFAppState().uiSideBarOpen == true) &&
            responsiveVisibility(
              context: context,
              phone: false,
              tablet: false,
            ))
          Material(
            color: Colors.transparent,
            elevation: 1.0,
            child: AnimatedContainer(
              duration: Duration(milliseconds: 390),
              curve: Curves.bounceOut,
              height: double.infinity,
              decoration: BoxDecoration(
                color: FlutterFlowTheme.of(context).foreground,
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  if (FFAppState().uiSideBarObject == 'calendar')
                    Align(
                      alignment: AlignmentDirectional(0.0, -1.0),
                      child: wrapWithModel(
                        model: _model.barSideCalendarModel,
                        updateCallback: () => safeSetState(() {}),
                        child: BarSideCalendarWidget(),
                      ),
                    ),
                  if (FFAppState().uiSideBarObject == 'activity')
                    Align(
                      alignment: AlignmentDirectional(0.0, -1.0),
                      child: AnimatedContainer(
                        duration: Duration(milliseconds: 740),
                        curve: Curves.bounceOut,
                        constraints: BoxConstraints(
                          maxWidth: 300.0,
                        ),
                        decoration: BoxDecoration(),
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Padding(
                              padding: EdgeInsetsDirectional.fromSTEB(
                                  16.0, 16.0, 0.0, 16.0),
                              child: Row(
                                mainAxisSize: MainAxisSize.max,
                                mainAxisAlignment:
                                    MainAxisAlignment.spaceBetween,
                                children: [
                                  Padding(
                                    padding: EdgeInsetsDirectional.fromSTEB(
                                        8.0, 0.0, 0.0, 0.0),
                                    child: FFButtonWidget(
                                      onPressed: () async {
                                        FFAppState().uiSideBarView = 'update';
                                        FFAppState().update(() {});
                                        if (animationsMap[
                                                'rowOnActionTriggerAnimation'] !=
                                            null) {
                                          await animationsMap[
                                                  'rowOnActionTriggerAnimation']!
                                              .controller
                                              .forward(from: 0.0);
                                        }
                                      },
                                      text: 'ADD ACTIVITY',
                                      icon: Icon(
                                        Icons.add,
                                        size: 15.0,
                                      ),
                                      options: FFButtonOptions(
                                        height: 32.0,
                                        padding: EdgeInsetsDirectional.fromSTEB(
                                            18.0, 0.0, 24.0, 0.0),
                                        iconPadding: EdgeInsets.all(0.0),
                                        color: Color(0xFFFEEBEB),
                                        textStyle: FlutterFlowTheme.of(context)
                                            .titleSmall
                                            .override(
                                              font: GoogleFonts.poppins(
                                                fontWeight:
                                                    FlutterFlowTheme.of(context)
                                                        .titleSmall
                                                        .fontWeight,
                                                fontStyle:
                                                    FlutterFlowTheme.of(context)
                                                        .titleSmall
                                                        .fontStyle,
                                              ),
                                              color:
                                                  FlutterFlowTheme.of(context)
                                                      .tertiary,
                                              fontSize: 13.0,
                                              letterSpacing: 0.0,
                                              fontWeight:
                                                  FlutterFlowTheme.of(context)
                                                      .titleSmall
                                                      .fontWeight,
                                              fontStyle:
                                                  FlutterFlowTheme.of(context)
                                                      .titleSmall
                                                      .fontStyle,
                                            ),
                                        elevation: 0.0,
                                        borderSide: BorderSide(
                                          color: Colors.transparent,
                                          width: 0.0,
                                        ),
                                        borderRadius:
                                            BorderRadius.circular(32.0),
                                        hoverColor: FlutterFlowTheme.of(context)
                                            .tertiary,
                                        hoverTextColor: Colors.white,
                                        hoverElevation: 3.0,
                                      ),
                                    ),
                                  ),
                                  Container(
                                    width: 40.0,
                                    height: 40.0,
                                    decoration: BoxDecoration(),
                                    child: InkWell(
                                      splashColor: Colors.transparent,
                                      focusColor: Colors.transparent,
                                      hoverColor: Colors.transparent,
                                      highlightColor: Colors.transparent,
                                      onTap: () async {
                                        FFAppState().uiSideBarOpen = false;
                                        FFAppState().deleteUiSideBarObject();
                                        FFAppState().uiSideBarObject =
                                            'default';

                                        safeSetState(() {});
                                      },
                                      child: Icon(
                                        Icons.close,
                                        color: FlutterFlowTheme.of(context)
                                            .secondaryText,
                                        size: 24.0,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            Divider(
                              height: 0.0,
                              thickness: 1.0,
                              color: FlutterFlowTheme.of(context).secondaryText,
                            ),
                            ListView(
                              padding: EdgeInsets.zero,
                              shrinkWrap: true,
                              scrollDirection: Axis.vertical,
                              children: [
                                wrapWithModel(
                                  model: _model.tileDynamicExpandableModel1,
                                  updateCallback: () => safeSetState(() {}),
                                  child: TileDynamicExpandableWidget(
                                    scoreHealth:
                                        random_data.randomInteger(0, 100),
                                  ),
                                ),
                                wrapWithModel(
                                  model: _model.tileDynamicExpandableModel2,
                                  updateCallback: () => safeSetState(() {}),
                                  child: TileDynamicExpandableWidget(
                                    scoreHealth:
                                        random_data.randomInteger(0, 100),
                                  ),
                                ),
                                wrapWithModel(
                                  model: _model.tileDynamicExpandableModel3,
                                  updateCallback: () => safeSetState(() {}),
                                  child: TileDynamicExpandableWidget(
                                    scoreHealth:
                                        random_data.randomInteger(0, 100),
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ),
                  if ((FFAppState().uiSideBarObject == 'contact') &&
                      (FFAppState().uiSideBarView == 'read'))
                    Align(
                      alignment: AlignmentDirectional(0.0, -1.0),
                      child: AnimatedContainer(
                        duration: Duration(milliseconds: 740),
                        curve: Curves.bounceOut,
                        width: 300.0,
                        constraints: BoxConstraints(
                          maxWidth: 300.0,
                        ),
                        decoration: BoxDecoration(),
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Padding(
                              padding: EdgeInsetsDirectional.fromSTEB(
                                  16.0, 16.0, 0.0, 16.0),
                              child: Row(
                                mainAxisSize: MainAxisSize.max,
                                mainAxisAlignment:
                                    MainAxisAlignment.spaceBetween,
                                children: [
                                  Padding(
                                    padding: EdgeInsetsDirectional.fromSTEB(
                                        8.0, 0.0, 0.0, 0.0),
                                    child: FFButtonWidget(
                                      onPressed: () async {
                                        FFAppState().uiSideBarView = 'update';
                                        FFAppState().update(() {});
                                        if (animationsMap[
                                                'rowOnActionTriggerAnimation'] !=
                                            null) {
                                          await animationsMap[
                                                  'rowOnActionTriggerAnimation']!
                                              .controller
                                              .forward(from: 0.0);
                                        }
                                      },
                                      text: 'ADD CONTACT',
                                      icon: Icon(
                                        Icons.add,
                                        size: 15.0,
                                      ),
                                      options: FFButtonOptions(
                                        height: 32.0,
                                        padding: EdgeInsetsDirectional.fromSTEB(
                                            18.0, 0.0, 24.0, 0.0),
                                        iconPadding: EdgeInsets.all(0.0),
                                        color: Color(0xFFFEEBEB),
                                        textStyle: FlutterFlowTheme.of(context)
                                            .titleSmall
                                            .override(
                                              font: GoogleFonts.poppins(
                                                fontWeight:
                                                    FlutterFlowTheme.of(context)
                                                        .titleSmall
                                                        .fontWeight,
                                                fontStyle:
                                                    FlutterFlowTheme.of(context)
                                                        .titleSmall
                                                        .fontStyle,
                                              ),
                                              color:
                                                  FlutterFlowTheme.of(context)
                                                      .tertiary,
                                              fontSize: 13.0,
                                              letterSpacing: 0.0,
                                              fontWeight:
                                                  FlutterFlowTheme.of(context)
                                                      .titleSmall
                                                      .fontWeight,
                                              fontStyle:
                                                  FlutterFlowTheme.of(context)
                                                      .titleSmall
                                                      .fontStyle,
                                            ),
                                        elevation: 0.0,
                                        borderSide: BorderSide(
                                          color: Colors.transparent,
                                          width: 0.0,
                                        ),
                                        borderRadius:
                                            BorderRadius.circular(32.0),
                                        hoverColor: FlutterFlowTheme.of(context)
                                            .tertiary,
                                        hoverTextColor: Colors.white,
                                        hoverElevation: 3.0,
                                      ),
                                    ),
                                  ),
                                  Container(
                                    width: 40.0,
                                    height: 40.0,
                                    decoration: BoxDecoration(),
                                    child: InkWell(
                                      splashColor: Colors.transparent,
                                      focusColor: Colors.transparent,
                                      hoverColor: Colors.transparent,
                                      highlightColor: Colors.transparent,
                                      onTap: () async {
                                        FFAppState().uiSideBarOpen = false;
                                        FFAppState().deleteUiSideBarObject();
                                        FFAppState().uiSideBarObject =
                                            'default';

                                        safeSetState(() {});
                                      },
                                      child: Icon(
                                        Icons.close,
                                        color: FlutterFlowTheme.of(context)
                                            .secondaryText,
                                        size: 24.0,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            Divider(
                              height: 0.0,
                              thickness: 1.0,
                              color: FlutterFlowTheme.of(context).secondaryText,
                            ),
                            ListView(
                              padding: EdgeInsets.zero,
                              shrinkWrap: true,
                              scrollDirection: Axis.vertical,
                              children: [
                                wrapWithModel(
                                  model: _model.tileDynamicExpandableModel4,
                                  updateCallback: () => safeSetState(() {}),
                                  child: TileDynamicExpandableWidget(
                                    scoreHealth:
                                        random_data.randomInteger(0, 100),
                                  ),
                                ),
                                wrapWithModel(
                                  model: _model.tileDynamicExpandableModel5,
                                  updateCallback: () => safeSetState(() {}),
                                  child: TileDynamicExpandableWidget(
                                    scoreHealth:
                                        random_data.randomInteger(0, 100),
                                  ),
                                ),
                                wrapWithModel(
                                  model: _model.tileDynamicExpandableModel6,
                                  updateCallback: () => safeSetState(() {}),
                                  child: TileDynamicExpandableWidget(
                                    scoreHealth:
                                        random_data.randomInteger(0, 100),
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ),
                  if ((FFAppState().uiSideBarObject == 'contact') &&
                      ((FFAppState().uiSideBarView == 'update') ||
                          (FFAppState().uiSideBarView == 'create')))
                    wrapWithModel(
                      model: _model.barSideFormModel,
                      updateCallback: () => safeSetState(() {}),
                      updateOnChange: true,
                      child: BarSideFormWidget(
                        confirmButtonText: 'Save Changes',
                        formAction: 'Update',
                        documentsField: widget.documentsField,
                        navigateAction: () async {},
                      ),
                    ),
                ],
              ),
            ),
          ),
      ],
    ).animateOnActionTrigger(
      animationsMap['rowOnActionTriggerAnimation']!,
    );
  }
}
