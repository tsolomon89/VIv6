import '/bar_nav/bar_nav_item/bar_nav_item_widget.dart';
import '/flutter_flow/flutter_flow_animations.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_toggle_icon.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/index.dart';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:provider/provider.dart';
import 'bar_nav_model.dart';
export 'bar_nav_model.dart';

class BarNavWidget extends StatefulWidget {
  const BarNavWidget({super.key});

  @override
  State<BarNavWidget> createState() => _BarNavWidgetState();
}

class _BarNavWidgetState extends State<BarNavWidget>
    with TickerProviderStateMixin {
  late BarNavModel _model;

  final animationsMap = <String, AnimationInfo>{};

  @override
  void setState(VoidCallback callback) {
    super.setState(callback);
    _model.onUpdate();
  }

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => BarNavModel());

    animationsMap.addAll({
      'toggleIconOnActionTriggerAnimation1': AnimationInfo(
        trigger: AnimationTrigger.onActionTrigger,
        applyInitialState: true,
        effectsBuilder: () => [
          TiltEffect(
            curve: Curves.easeInOut,
            delay: 0.0.ms,
            duration: 600.0.ms,
            begin: Offset(0, 0),
            end: Offset(3.142, 0),
          ),
        ],
      ),
      'toggleIconOnActionTriggerAnimation2': AnimationInfo(
        trigger: AnimationTrigger.onActionTrigger,
        applyInitialState: true,
        effectsBuilder: () => [
          RotateEffect(
            curve: Curves.easeInOut,
            delay: 0.0.ms,
            duration: 600.0.ms,
            begin: 0.0,
            end: 0.25,
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

    return Visibility(
      visible: responsiveVisibility(
        context: context,
        phone: false,
        tablet: false,
      ),
      child: AnimatedContainer(
        duration: Duration(milliseconds: 330),
        curve: Curves.easeIn,
        width: FFAppState().uiNavBarOpen == true ? 238.0 : 72.0,
        height: double.infinity,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(0.0),
        ),
        child: Padding(
          padding: EdgeInsetsDirectional.fromSTEB(0.0, 24.0, 0.0, 16.0),
          child: Column(
            mainAxisSize: MainAxisSize.max,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Column(
                  mainAxisSize: MainAxisSize.max,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    if (FFAppState().uiNavBarOpen == true)
                      Padding(
                        padding:
                            EdgeInsetsDirectional.fromSTEB(16.0, 0.0, 0.0, 0.0),
                        child: Text(
                          'Settings',
                          style: FlutterFlowTheme.of(context)
                              .labelSmall
                              .override(
                                fontFamily: FlutterFlowTheme.of(context)
                                    .labelSmallFamily,
                                letterSpacing: 0.0,
                                useGoogleFonts: !FlutterFlowTheme.of(context)
                                    .labelSmallIsCustom,
                              ),
                        ),
                      ),
                    wrapWithModel(
                      model: _model.barNavItemModel1,
                      updateCallback: () => safeSetState(() {}),
                      child: BarNavItemWidget(
                        type: 'Home',
                        iconActive: Icon(
                          Icons.home,
                          color: Colors.white,
                        ),
                        iconInactive: Icon(
                          Icons.home,
                          color: FlutterFlowTheme.of(context).subtitle,
                        ),
                        action: () async {
                          context.pushNamed(HomePageWidget.routeName);
                        },
                      ),
                    ),
                    wrapWithModel(
                      model: _model.barNavItemModel2,
                      updateCallback: () => safeSetState(() {}),
                      child: BarNavItemWidget(
                        type: 'Dashboard',
                        iconActive: Icon(
                          Icons.dashboard_sharp,
                          color: Colors.white,
                        ),
                        iconInactive: Icon(
                          Icons.dashboard_sharp,
                          color: FlutterFlowTheme.of(context).subtitle,
                        ),
                        action: () async {
                          context.pushNamed(RecordReadViewWidget.routeName);
                        },
                      ),
                    ),
                    if (FFAppState().uiNavBarOpen == true)
                      Padding(
                        padding:
                            EdgeInsetsDirectional.fromSTEB(16.0, 0.0, 0.0, 0.0),
                        child: Text(
                          'Tasks',
                          style: FlutterFlowTheme.of(context)
                              .labelSmall
                              .override(
                                fontFamily: FlutterFlowTheme.of(context)
                                    .labelSmallFamily,
                                letterSpacing: 0.0,
                                useGoogleFonts: !FlutterFlowTheme.of(context)
                                    .labelSmallIsCustom,
                              ),
                        ),
                      ),
                    wrapWithModel(
                      model: _model.barNavItemModel3,
                      updateCallback: () => safeSetState(() {}),
                      child: BarNavItemWidget(
                        type: 'To-Do',
                        iconActive: Icon(
                          Icons.assignment_late,
                          color: Colors.white,
                        ),
                        iconInactive: Icon(
                          Icons.assignment_late,
                          color: FlutterFlowTheme.of(context).subtitle,
                        ),
                        action: () async {},
                      ),
                    ),
                    wrapWithModel(
                      model: _model.barNavItemModel4,
                      updateCallback: () => safeSetState(() {}),
                      child: BarNavItemWidget(
                        type: 'Calendar',
                        iconActive: Icon(
                          Icons.calendar_today,
                          color: Colors.white,
                        ),
                        iconInactive: Icon(
                          Icons.calendar_today,
                          color: FlutterFlowTheme.of(context).subtitle,
                        ),
                        action: () async {},
                      ),
                    ),
                    wrapWithModel(
                      model: _model.barNavItemModel5,
                      updateCallback: () => safeSetState(() {}),
                      child: BarNavItemWidget(
                        type: 'Teams',
                        iconActive: Icon(
                          Icons.assignment_ind,
                          color: Colors.white,
                        ),
                        iconInactive: Icon(
                          Icons.assignment_ind,
                          color: FlutterFlowTheme.of(context).subtitle,
                        ),
                        action: () async {},
                      ),
                    ),
                    if (FFAppState().uiNavBarOpen == true)
                      Padding(
                        padding:
                            EdgeInsetsDirectional.fromSTEB(16.0, 0.0, 0.0, 0.0),
                        child: Text(
                          'Records',
                          style: FlutterFlowTheme.of(context)
                              .labelSmall
                              .override(
                                fontFamily: FlutterFlowTheme.of(context)
                                    .labelSmallFamily,
                                letterSpacing: 0.0,
                                useGoogleFonts: !FlutterFlowTheme.of(context)
                                    .labelSmallIsCustom,
                              ),
                        ),
                      ),
                    wrapWithModel(
                      model: _model.barNavItemModel6,
                      updateCallback: () => safeSetState(() {}),
                      child: BarNavItemWidget(
                        type: 'Opportunites',
                        iconActive: Icon(
                          Icons.attach_money,
                          color: Colors.white,
                        ),
                        iconInactive: Icon(
                          Icons.attach_money,
                          color: FlutterFlowTheme.of(context).subtitle,
                        ),
                        action: () async {},
                      ),
                    ),
                    wrapWithModel(
                      model: _model.barNavItemModel7,
                      updateCallback: () => safeSetState(() {}),
                      child: BarNavItemWidget(
                        type: 'Accounts',
                        iconActive: Icon(
                          Icons.business_sharp,
                          color: Colors.white,
                        ),
                        iconInactive: Icon(
                          Icons.business_sharp,
                          color: FlutterFlowTheme.of(context).subtitle,
                        ),
                        action: () async {},
                      ),
                    ),
                    wrapWithModel(
                      model: _model.barNavItemModel8,
                      updateCallback: () => safeSetState(() {}),
                      child: BarNavItemWidget(
                        type: 'Contacts',
                        iconActive: Icon(
                          Icons.contacts_sharp,
                          color: Colors.white,
                        ),
                        iconInactive: Icon(
                          Icons.contacts_sharp,
                          color: FlutterFlowTheme.of(context).subtitle,
                        ),
                        action: () async {},
                      ),
                    ),
                  ].divide(SizedBox(height: 12.0)),
                ),
              ),
              Divider(
                height: 12.0,
                thickness: 2.0,
                color: Color(0xFFE5E7EB),
              ),
              Row(
                mainAxisSize: MainAxisSize.max,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Expanded(
                    child: Padding(
                      padding:
                          EdgeInsetsDirectional.fromSTEB(16.0, 0.0, 16.0, 0.0),
                      child: Wrap(
                        spacing: 0.0,
                        runSpacing: 8.0,
                        alignment: WrapAlignment.spaceBetween,
                        crossAxisAlignment: WrapCrossAlignment.center,
                        direction: Axis.horizontal,
                        runAlignment: WrapAlignment.center,
                        verticalDirection: VerticalDirection.down,
                        clipBehavior: Clip.none,
                        children: [
                          Material(
                            color: Colors.transparent,
                            elevation: 1.0,
                            shape: const CircleBorder(),
                            child: Container(
                              decoration: BoxDecoration(
                                color: FlutterFlowTheme.of(context).background,
                                shape: BoxShape.circle,
                                border: Border.all(
                                  color: FlutterFlowTheme.of(context).dlButton,
                                ),
                              ),
                              child: ToggleIcon(
                                onPressed: () async {
                                  safeSetState(() => FFAppState().uiDarkMode =
                                      !FFAppState().uiDarkMode);
                                  if ((Theme.of(context).brightness ==
                                          Brightness.dark) ==
                                      true) {
                                    setDarkModeSetting(
                                        context, ThemeMode.light);
                                  } else {
                                    setDarkModeSetting(context, ThemeMode.dark);
                                  }

                                  if (animationsMap[
                                          'toggleIconOnActionTriggerAnimation1'] !=
                                      null) {
                                    await animationsMap[
                                            'toggleIconOnActionTriggerAnimation1']!
                                        .controller
                                        .forward(from: 0.0);
                                  }
                                },
                                value: FFAppState().uiDarkMode,
                                onIcon: Icon(
                                  Icons.wb_sunny_sharp,
                                  color: FlutterFlowTheme.of(context).dlButton,
                                  size: 20.0,
                                ),
                                offIcon: Icon(
                                  Icons.nightlight_round_sharp,
                                  color: FlutterFlowTheme.of(context).dlButton,
                                  size: 20.0,
                                ),
                              ).animateOnActionTrigger(
                                animationsMap[
                                    'toggleIconOnActionTriggerAnimation1']!,
                              ),
                            ),
                          ),
                          ToggleIcon(
                            onPressed: () async {
                              safeSetState(
                                  () => _model.isExpanded = !_model.isExpanded);
                              if ((FFAppState().uiNavBarOpen == false) ||
                                  (FFAppState().uiNavBarOpen == null)) {
                                FFAppState().uiNavBarOpen = true;
                                FFAppState().update(() {});
                                if (animationsMap[
                                        'toggleIconOnActionTriggerAnimation2'] !=
                                    null) {
                                  await animationsMap[
                                          'toggleIconOnActionTriggerAnimation2']!
                                      .controller
                                      .forward(from: 0.0);
                                }
                              } else {
                                FFAppState().uiNavBarOpen = false;
                                FFAppState().update(() {});
                                if (animationsMap[
                                        'toggleIconOnActionTriggerAnimation2'] !=
                                    null) {
                                  await animationsMap[
                                          'toggleIconOnActionTriggerAnimation2']!
                                      .controller
                                      .reverse();
                                }
                              }
                            },
                            value: _model.isExpanded,
                            onIcon: Icon(
                              Icons.menu_open,
                              color: FlutterFlowTheme.of(context).subtitle,
                              size: 32.0,
                            ),
                            offIcon: Icon(
                              Icons.menu_open,
                              color: FlutterFlowTheme.of(context).subtitle,
                              size: 32.0,
                            ),
                          ).animateOnActionTrigger(
                            animationsMap[
                                'toggleIconOnActionTriggerAnimation2']!,
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
