import '/backend/schema/structs/index.dart';
import '/cards/components/button_title_expand/button_title_expand_widget.dart';
import '/cards/components/filters/list_tile_group/tile_group/list_tiles/tiles/components/icon_dynamic/icon_dynamic_widget.dart';
import '/cards/components/filters/list_tile_group/tile_group/list_tiles/tiles/components/scores/score_health_row/score_health_row_widget.dart';
import '/cards/components/filters/list_tile_group/tile_group/list_tiles/tiles/components/scores/score_opp_row/score_opp_row_widget.dart';
import '/flutter_flow/flutter_flow_animations.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/custom_functions.dart' as functions;
import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:percent_indicator/percent_indicator.dart';
import 'tile_dynamic_model.dart';
export 'tile_dynamic_model.dart';

class TileDynamicWidget extends StatefulWidget {
  const TileDynamicWidget({
    super.key,
    int? scoreHealth,
    String? textOverline1,
    String? textOverline2,
    String? textOverline3,
    String? textOverline4,
    double? scoreProgress,
    this.typeLeading,
    this.textTitle1,
    this.textTitle2,
    this.textTitle3,
    this.textTitle4,
    this.textBody1,
    this.textBody2,
    this.textBody3,
    this.textBody4,
    bool? leadingVisible,
    bool? isExpandable,
    this.value1,
    this.value2,
    this.value3,
    this.value4,
    this.dataListOverlineProperty,
    this.dataListTitleProperty,
    this.dataListBodyProperty,
  })  : this.scoreHealth = scoreHealth ?? 100,
        this.textOverline1 = textOverline1 ?? '',
        this.textOverline2 = textOverline2 ?? '',
        this.textOverline3 = textOverline3 ?? '',
        this.textOverline4 = textOverline4 ?? '',
        this.scoreProgress = scoreProgress ?? .7,
        this.leadingVisible = leadingVisible ?? true,
        this.isExpandable = isExpandable ?? false;

  final int scoreHealth;
  final String textOverline1;
  final String textOverline2;
  final String textOverline3;
  final String textOverline4;
  final double scoreProgress;
  final String? typeLeading;
  final String? textTitle1;
  final String? textTitle2;
  final String? textTitle3;
  final String? textTitle4;
  final String? textBody1;
  final String? textBody2;
  final String? textBody3;
  final String? textBody4;
  final bool leadingVisible;
  final bool isExpandable;
  final double? value1;
  final double? value2;
  final double? value3;
  final double? value4;
  final List<PropertyStruct>? dataListOverlineProperty;
  final List<PropertyStruct>? dataListTitleProperty;
  final List<PropertyStruct>? dataListBodyProperty;

  @override
  State<TileDynamicWidget> createState() => _TileDynamicWidgetState();
}

class _TileDynamicWidgetState extends State<TileDynamicWidget>
    with TickerProviderStateMixin {
  late TileDynamicModel _model;

  var hasButtonTitleExpandTriggered = false;
  final animationsMap = <String, AnimationInfo>{};

  @override
  void setState(VoidCallback callback) {
    super.setState(callback);
    _model.onUpdate();
  }

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => TileDynamicModel());

    animationsMap.addAll({
      'buttonTitleExpandOnActionTriggerAnimation': AnimationInfo(
        trigger: AnimationTrigger.onActionTrigger,
        applyInitialState: false,
        effectsBuilder: () => [
          RotateEffect(
            curve: Curves.easeInOut,
            delay: 0.0.ms,
            duration: 600.0.ms,
            begin: 0.0,
            end: -0.5,
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
    return Container(
      decoration: BoxDecoration(
        color: FlutterFlowTheme.of(context).secondaryBackground,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        mainAxisAlignment: MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            decoration: BoxDecoration(),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                if ((widget.typeLeading == 'above') &&
                    (widget.leadingVisible == true))
                  Align(
                    alignment: AlignmentDirectional(0.0, 0.0),
                    child: Container(
                      width: double.infinity,
                      height: 116.0,
                      decoration: BoxDecoration(),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Expanded(
                            child: Padding(
                              padding: EdgeInsets.all(16.0),
                              child: Container(
                                constraints: BoxConstraints(
                                  maxHeight: 80.0,
                                ),
                                decoration: BoxDecoration(
                                  shape: BoxShape.rectangle,
                                ),
                                child: ClipRRect(
                                  borderRadius: BorderRadius.circular(0.0),
                                  child: Image.asset(
                                    'assets/images/800px-IBM_logo.png',
                                    width: 300.0,
                                    height: 200.0,
                                    fit: BoxFit.contain,
                                  ),
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                Padding(
                  padding:
                      EdgeInsetsDirectional.fromSTEB(16.0, 16.0, 16.0, 16.0),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    mainAxisAlignment: MainAxisAlignment.start,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      if (widget.leadingVisible == true)
                        Padding(
                          padding: EdgeInsetsDirectional.fromSTEB(
                              0.0, 0.0, 16.0, 0.0),
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              if (widget.typeLeading ==
                                  FFAppConstants.typeLeadingImageSquare)
                                Container(
                                  width: 42.0,
                                  height: 42.0,
                                  decoration: BoxDecoration(
                                    border: Border.all(
                                      color: FlutterFlowTheme.of(context)
                                          .secondaryBackground,
                                    ),
                                  ),
                                  child: Image.network(
                                    'https://picsum.photos/seed/458/600',
                                    width: 300.0,
                                    height: 200.0,
                                    fit: BoxFit.cover,
                                  ),
                                ),
                              if (widget.typeLeading ==
                                  FFAppConstants.typeLeadingImageRound)
                                Container(
                                  width: 42.0,
                                  height: 42.0,
                                  decoration: BoxDecoration(
                                    border: Border.all(
                                      color: FlutterFlowTheme.of(context)
                                          .secondaryBackground,
                                    ),
                                  ),
                                  child: ClipRRect(
                                    borderRadius: BorderRadius.circular(100.0),
                                    child: Image.network(
                                      'https://picsum.photos/seed/458/600',
                                      width: 300.0,
                                      height: 200.0,
                                      fit: BoxFit.cover,
                                    ),
                                  ),
                                ),
                              if (widget.typeLeading ==
                                  FFAppConstants.typeLeadingProgress)
                                Container(
                                  decoration: BoxDecoration(),
                                  child: CircularPercentIndicator(
                                    percent: valueOrDefault<double>(
                                      widget.scoreProgress,
                                      .2,
                                    ),
                                    radius: 32.0,
                                    lineWidth: 8.0,
                                    animation: true,
                                    animateFromLastPercent: true,
                                    progressColor:
                                        FlutterFlowTheme.of(context).primary,
                                    center: Text(
                                      formatNumber(
                                        widget.scoreProgress,
                                        formatType: FormatType.percent,
                                      ),
                                      style: FlutterFlowTheme.of(context)
                                          .headlineSmall
                                          .override(
                                            fontFamily:
                                                FlutterFlowTheme.of(context)
                                                    .headlineSmallFamily,
                                            color: FlutterFlowTheme.of(context)
                                                .navtext,
                                            fontSize: 14.0,
                                            letterSpacing: 0.0,
                                            fontWeight: FontWeight.w600,
                                            useGoogleFonts:
                                                !FlutterFlowTheme.of(context)
                                                    .headlineSmallIsCustom,
                                          ),
                                    ),
                                    startAngle: 180.0,
                                  ),
                                ),
                              if (widget.typeLeading ==
                                  FFAppConstants.typeLeadingIcon)
                                Container(
                                  decoration: BoxDecoration(
                                    color: FlutterFlowTheme.of(context)
                                        .secondaryBackground,
                                  ),
                                  child: wrapWithModel(
                                    model: _model.iconDynamicModel,
                                    updateCallback: () => safeSetState(() {}),
                                    child: IconDynamicWidget(),
                                  ),
                                ),
                            ],
                          ),
                        ),
                      Expanded(
                        child: Padding(
                          padding: EdgeInsetsDirectional.fromSTEB(
                              0.0, 1.0, 0.0, 0.0),
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            mainAxisAlignment: MainAxisAlignment.center,
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisSize: MainAxisSize.max,
                                mainAxisAlignment:
                                    MainAxisAlignment.spaceBetween,
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Column(
                                    mainAxisSize: MainAxisSize.max,
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        functions
                                            .stringToUpperCase(
                                                valueOrDefault<String>(
                                              functions
                                                  .stringListToStringDotDelimiter(
                                                      widget
                                                          .dataListOverlineProperty
                                                          ?.map((e) =>
                                                              e.valueProperty)
                                                          .toList()
                                                          .toList()),
                                              'Overline Text',
                                            ))
                                            .maybeHandleOverflow(
                                              maxChars: 90,
                                              replacement: '…',
                                            ),
                                        maxLines: 1,
                                        style: FlutterFlowTheme.of(context)
                                            .labelMedium
                                            .override(
                                              fontFamily:
                                                  FlutterFlowTheme.of(context)
                                                      .labelMediumFamily,
                                              color:
                                                  FlutterFlowTheme.of(context)
                                                      .secondaryText,
                                              fontSize: 9.0,
                                              letterSpacing: 0.6,
                                              fontWeight: FontWeight.w500,
                                              useGoogleFonts:
                                                  !FlutterFlowTheme.of(context)
                                                      .labelMediumIsCustom,
                                            ),
                                      ),
                                      Text(
                                        valueOrDefault<String>(
                                          functions
                                              .stringListToStringDotDelimiter(
                                                  widget.dataListTitleProperty
                                                      ?.map((e) =>
                                                          e.valueProperty)
                                                      .toList()
                                                      .toList()),
                                          'Title Text',
                                        ).maybeHandleOverflow(
                                          maxChars: 75,
                                          replacement: '…',
                                        ),
                                        maxLines: 1,
                                        style: FlutterFlowTheme.of(context)
                                            .titleMedium
                                            .override(
                                              fontFamily:
                                                  FlutterFlowTheme.of(context)
                                                      .titleMediumFamily,
                                              color:
                                                  FlutterFlowTheme.of(context)
                                                      .primaryText,
                                              letterSpacing: 0.0,
                                              lineHeight: 1.2,
                                              useGoogleFonts:
                                                  !FlutterFlowTheme.of(context)
                                                      .titleMediumIsCustom,
                                            ),
                                      ),
                                    ],
                                  ),
                                  if (widget.isExpandable == true)
                                    Column(
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        InkWell(
                                          splashColor: Colors.transparent,
                                          focusColor: Colors.transparent,
                                          hoverColor: Colors.transparent,
                                          highlightColor: Colors.transparent,
                                          onTap: () async {
                                            _model.isExpanded =
                                                !_model.isExpanded;
                                            safeSetState(() {});
                                            if (_model.isExpanded) {
                                              if (animationsMap[
                                                      'buttonTitleExpandOnActionTriggerAnimation'] !=
                                                  null) {
                                                await animationsMap[
                                                        'buttonTitleExpandOnActionTriggerAnimation']!
                                                    .controller
                                                    .reverse();
                                              }
                                            } else {
                                              if (animationsMap[
                                                      'buttonTitleExpandOnActionTriggerAnimation'] !=
                                                  null) {
                                                safeSetState(() =>
                                                    hasButtonTitleExpandTriggered =
                                                        true);
                                                SchedulerBinding.instance
                                                    .addPostFrameCallback(
                                                        (_) async =>
                                                            await animationsMap[
                                                                    'buttonTitleExpandOnActionTriggerAnimation']!
                                                                .controller
                                                                .forward(
                                                                    from: 0.0));
                                              }
                                            }
                                          },
                                          child: wrapWithModel(
                                            model:
                                                _model.buttonTitleExpandModel,
                                            updateCallback: () =>
                                                safeSetState(() {}),
                                            child: ButtonTitleExpandWidget(),
                                          ),
                                        ).animateOnActionTrigger(
                                            animationsMap[
                                                'buttonTitleExpandOnActionTriggerAnimation']!,
                                            hasBeenTriggered:
                                                hasButtonTitleExpandTriggered),
                                      ],
                                    ),
                                ],
                              ),
                              Column(
                                mainAxisSize: MainAxisSize.min,
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    valueOrDefault<String>(
                                      functions.stringListToStringDotDelimiter(
                                          widget.dataListBodyProperty
                                              ?.map((e) => e.valueProperty)
                                              .toList()
                                              .toList()),
                                      'Body Text',
                                    ).maybeHandleOverflow(
                                      maxChars: 125,
                                      replacement: '…',
                                    ),
                                    maxLines: 2,
                                    style: FlutterFlowTheme.of(context)
                                        .bodyMedium
                                        .override(
                                          fontFamily:
                                              FlutterFlowTheme.of(context)
                                                  .bodyMediumFamily,
                                          color: FlutterFlowTheme.of(context)
                                              .secondaryText,
                                          fontSize: 10.0,
                                          letterSpacing: 0.0,
                                          lineHeight: 1.7,
                                          useGoogleFonts:
                                              !FlutterFlowTheme.of(context)
                                                  .bodyMediumIsCustom,
                                        ),
                                  ),
                                  Row(
                                    mainAxisSize: MainAxisSize.max,
                                    children: [
                                      wrapWithModel(
                                        model: _model.scoreHealthRowModel,
                                        updateCallback: () =>
                                            safeSetState(() {}),
                                        child: ScoreHealthRowWidget(
                                          healthScore: widget.scoreHealth,
                                          isLarge: false,
                                        ),
                                      ),
                                      if ((widget.value1 != null) ||
                                          (widget.value2 != null) ||
                                          (widget.value3 != null) ||
                                          (widget.value4 != null))
                                        Expanded(
                                          child: wrapWithModel(
                                            model: _model.scoreOppRowModel,
                                            updateCallback: () =>
                                                safeSetState(() {}),
                                            child: ScoreOppRowWidget(
                                              isLarge: false,
                                              lable1: 'MQL',
                                              lable2: 'SQL',
                                              lable3: 'FTP',
                                              lable4: 'RTP',
                                            ),
                                          ),
                                        ),
                                    ],
                                  ),
                                ],
                              ),
                            ].divide(SizedBox(height: 0.0)),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          if (_model.isExpanded)
            Container(
              height: 100.0,
              decoration: BoxDecoration(),
            ),
        ].divide(SizedBox(height: 0.0)).addToStart(SizedBox(height: 0.0)),
      ),
    );
  }
}
