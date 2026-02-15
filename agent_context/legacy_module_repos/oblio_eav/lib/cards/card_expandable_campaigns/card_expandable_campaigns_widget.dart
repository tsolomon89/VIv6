import '/cards/components/button_card_expand/button_card_expand_widget.dart';
import '/cards/components/card_title/card_title_widget.dart';
import '/cards/components/filter_chips/filter_chips_widget.dart';
import '/cards/components/filters/list_tile_group/tile_group/list_tiles/tiles/components/t_ile_double_line/t_ile_double_line_widget.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'package:percent_indicator/percent_indicator.dart';
import 'card_expandable_campaigns_model.dart';
export 'card_expandable_campaigns_model.dart';

class CardExpandableCampaignsWidget extends StatefulWidget {
  const CardExpandableCampaignsWidget({super.key});

  @override
  State<CardExpandableCampaignsWidget> createState() =>
      _CardExpandableCampaignsWidgetState();
}

class _CardExpandableCampaignsWidgetState
    extends State<CardExpandableCampaignsWidget> {
  late CardExpandableCampaignsModel _model;

  @override
  void setState(VoidCallback callback) {
    super.setState(callback);
    _model.onUpdate();
  }

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => CardExpandableCampaignsModel());

    // On component load action.
    SchedulerBinding.instance.addPostFrameCallback((_) async {
      _model.isExpanded = false;
      safeSetState(() {});
    });

    WidgetsBinding.instance.addPostFrameCallback((_) => safeSetState(() {}));
  }

  @override
  void dispose() {
    _model.maybeDispose();

    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedContainer(
      duration: Duration(milliseconds: 400),
      curve: Curves.easeInOut,
      constraints: BoxConstraints(
        minWidth: 357.0,
        maxHeight: 900.0,
      ),
      decoration: BoxDecoration(),
      child: Card(
        clipBehavior: Clip.antiAliasWithSaveLayer,
        color: FlutterFlowTheme.of(context).foreground,
        elevation: 4.0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8.0),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: double.infinity,
              decoration: BoxDecoration(),
              child: Column(
                mainAxisSize: MainAxisSize.max,
                children: [
                  wrapWithModel(
                    model: _model.cardTitleModel,
                    updateCallback: () => safeSetState(() {}),
                    child: CardTitleWidget(),
                  ),
                  Container(
                    height: 140.0,
                    decoration: BoxDecoration(
                      color: FlutterFlowTheme.of(context).secondaryBackground,
                    ),
                    child: Padding(
                      padding:
                          EdgeInsetsDirectional.fromSTEB(16.0, 0.0, 16.0, 0.0),
                      child: Row(
                        mainAxisSize: MainAxisSize.max,
                        children: [
                          Column(
                            mainAxisSize: MainAxisSize.max,
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              CircularPercentIndicator(
                                percent: 0.5,
                                radius: 50.0,
                                lineWidth: 12.0,
                                animation: true,
                                animateFromLastPercent: true,
                                progressColor:
                                    FlutterFlowTheme.of(context).primary,
                                backgroundColor:
                                    FlutterFlowTheme.of(context).accent4,
                                center: Text(
                                  '50%',
                                  style: FlutterFlowTheme.of(context)
                                      .headlineSmall
                                      .override(
                                        fontFamily: FlutterFlowTheme.of(context)
                                            .headlineSmallFamily,
                                        letterSpacing: 0.0,
                                        useGoogleFonts:
                                            !FlutterFlowTheme.of(context)
                                                .headlineSmallIsCustom,
                                      ),
                                ),
                              ),
                            ],
                          ),
                          Container(
                            width: 100.0,
                            decoration: BoxDecoration(),
                            child: Column(
                              mainAxisSize: MainAxisSize.max,
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                wrapWithModel(
                                  model: _model.tIleDoubleLineModel1,
                                  updateCallback: () => safeSetState(() {}),
                                  child: TIleDoubleLineWidget(
                                    inNavable: false,
                                  ),
                                ),
                                wrapWithModel(
                                  model: _model.tIleDoubleLineModel2,
                                  updateCallback: () => safeSetState(() {}),
                                  child: TIleDoubleLineWidget(
                                    inNavable: false,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          Container(
                            width: 120.0,
                            decoration: BoxDecoration(),
                            child: Column(
                              mainAxisSize: MainAxisSize.max,
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                wrapWithModel(
                                  model: _model.tIleDoubleLineModel3,
                                  updateCallback: () => safeSetState(() {}),
                                  child: TIleDoubleLineWidget(
                                    inNavable: false,
                                  ),
                                ),
                                wrapWithModel(
                                  model: _model.tIleDoubleLineModel4,
                                  updateCallback: () => safeSetState(() {}),
                                  child: TIleDoubleLineWidget(
                                    inNavable: false,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
            if (_model.isExpanded == true)
              Expanded(
                child: Align(
                  alignment: AlignmentDirectional(0.0, -1.0),
                  child: Padding(
                    padding: EdgeInsetsDirectional.fromSTEB(0.0, 8.0, 0.0, 0.0),
                    child: AnimatedContainer(
                      duration: Duration(milliseconds: 730),
                      curve: Curves.bounceOut,
                      width: double.infinity,
                      constraints: BoxConstraints(
                        maxHeight: 430.0,
                      ),
                      decoration: BoxDecoration(
                        color: FlutterFlowTheme.of(context).foreground,
                      ),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          wrapWithModel(
                            model: _model.filterChipsModel,
                            updateCallback: () => safeSetState(() {}),
                            child: FilterChipsWidget(),
                          ),
                          Expanded(
                            child: Padding(
                              padding: EdgeInsetsDirectional.fromSTEB(
                                  0.0, 16.0, 0.0, 0.0),
                              child: ListView(
                                padding: EdgeInsets.zero,
                                scrollDirection: Axis.horizontal,
                                children: [
                                  Container(
                                    height: 140.0,
                                    decoration: BoxDecoration(
                                      color: FlutterFlowTheme.of(context)
                                          .secondaryBackground,
                                    ),
                                    child: Padding(
                                      padding: EdgeInsetsDirectional.fromSTEB(
                                          1.0, 0.0, 0.0, 0.0),
                                      child: Row(
                                        mainAxisSize: MainAxisSize.min,
                                        children: [
                                          Padding(
                                            padding:
                                                EdgeInsetsDirectional.fromSTEB(
                                                    8.0, 0.0, 8.0, 0.0),
                                            child: Container(
                                              width: 100.0,
                                              decoration: BoxDecoration(),
                                              child: Column(
                                                mainAxisSize: MainAxisSize.min,
                                                mainAxisAlignment:
                                                    MainAxisAlignment.center,
                                                crossAxisAlignment:
                                                    CrossAxisAlignment.start,
                                                children: [
                                                  Align(
                                                    alignment:
                                                        AlignmentDirectional(
                                                            0.0, 0.0),
                                                    child:
                                                        CircularPercentIndicator(
                                                      percent: 0.5,
                                                      radius: 40.0,
                                                      lineWidth: 12.0,
                                                      animation: true,
                                                      animateFromLastPercent:
                                                          true,
                                                      progressColor:
                                                          FlutterFlowTheme.of(
                                                                  context)
                                                              .primary,
                                                      backgroundColor:
                                                          FlutterFlowTheme.of(
                                                                  context)
                                                              .accent4,
                                                      center: Text(
                                                        '50%',
                                                        style:
                                                            FlutterFlowTheme.of(
                                                                    context)
                                                                .headlineSmall
                                                                .override(
                                                                  fontFamily: FlutterFlowTheme.of(
                                                                          context)
                                                                      .headlineSmallFamily,
                                                                  letterSpacing:
                                                                      0.0,
                                                                  useGoogleFonts:
                                                                      !FlutterFlowTheme.of(
                                                                              context)
                                                                          .headlineSmallIsCustom,
                                                                ),
                                                      ),
                                                    ),
                                                  ),
                                                  Column(
                                                    mainAxisSize:
                                                        MainAxisSize.max,
                                                    mainAxisAlignment:
                                                        MainAxisAlignment.start,
                                                    crossAxisAlignment:
                                                        CrossAxisAlignment
                                                            .center,
                                                    children: [
                                                      wrapWithModel(
                                                        model: _model
                                                            .tIleDoubleLineModel5,
                                                        updateCallback: () =>
                                                            safeSetState(() {}),
                                                        child:
                                                            TIleDoubleLineWidget(
                                                          inNavable: false,
                                                        ),
                                                      ),
                                                      wrapWithModel(
                                                        model: _model
                                                            .tIleDoubleLineModel6,
                                                        updateCallback: () =>
                                                            safeSetState(() {}),
                                                        child:
                                                            TIleDoubleLineWidget(
                                                          inNavable: false,
                                                        ),
                                                      ),
                                                      wrapWithModel(
                                                        model: _model
                                                            .tIleDoubleLineModel7,
                                                        updateCallback: () =>
                                                            safeSetState(() {}),
                                                        child:
                                                            TIleDoubleLineWidget(
                                                          inNavable: false,
                                                        ),
                                                      ),
                                                      wrapWithModel(
                                                        model: _model
                                                            .tIleDoubleLineModel8,
                                                        updateCallback: () =>
                                                            safeSetState(() {}),
                                                        child:
                                                            TIleDoubleLineWidget(
                                                          inNavable: false,
                                                        ),
                                                      ),
                                                    ],
                                                  ),
                                                ],
                                              ),
                                            ),
                                          ),
                                          SizedBox(
                                            height: 300.0,
                                            child: VerticalDivider(
                                              width: 1.0,
                                              thickness: 1.0,
                                              color:
                                                  FlutterFlowTheme.of(context)
                                                      .navLabel,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ),
                                  Container(
                                    decoration: BoxDecoration(
                                      color: FlutterFlowTheme.of(context)
                                          .secondaryBackground,
                                    ),
                                    child: Padding(
                                      padding: EdgeInsetsDirectional.fromSTEB(
                                          1.0, 0.0, 0.0, 0.0),
                                      child: Row(
                                        mainAxisSize: MainAxisSize.min,
                                        children: [
                                          Padding(
                                            padding:
                                                EdgeInsetsDirectional.fromSTEB(
                                                    8.0, 0.0, 8.0, 0.0),
                                            child: Container(
                                              width: 100.0,
                                              decoration: BoxDecoration(),
                                              child: Column(
                                                mainAxisSize: MainAxisSize.min,
                                                mainAxisAlignment:
                                                    MainAxisAlignment.center,
                                                crossAxisAlignment:
                                                    CrossAxisAlignment.start,
                                                children: [
                                                  Align(
                                                    alignment:
                                                        AlignmentDirectional(
                                                            0.0, 0.0),
                                                    child:
                                                        CircularPercentIndicator(
                                                      percent: 0.5,
                                                      radius: 40.0,
                                                      lineWidth: 12.0,
                                                      animation: true,
                                                      animateFromLastPercent:
                                                          true,
                                                      progressColor:
                                                          FlutterFlowTheme.of(
                                                                  context)
                                                              .primary,
                                                      backgroundColor:
                                                          FlutterFlowTheme.of(
                                                                  context)
                                                              .accent4,
                                                      center: Text(
                                                        '50%',
                                                        style:
                                                            FlutterFlowTheme.of(
                                                                    context)
                                                                .headlineSmall
                                                                .override(
                                                                  fontFamily: FlutterFlowTheme.of(
                                                                          context)
                                                                      .headlineSmallFamily,
                                                                  letterSpacing:
                                                                      0.0,
                                                                  useGoogleFonts:
                                                                      !FlutterFlowTheme.of(
                                                                              context)
                                                                          .headlineSmallIsCustom,
                                                                ),
                                                      ),
                                                    ),
                                                  ),
                                                  Column(
                                                    mainAxisSize:
                                                        MainAxisSize.max,
                                                    mainAxisAlignment:
                                                        MainAxisAlignment.start,
                                                    crossAxisAlignment:
                                                        CrossAxisAlignment
                                                            .center,
                                                    children: [
                                                      wrapWithModel(
                                                        model: _model
                                                            .tIleDoubleLineModel9,
                                                        updateCallback: () =>
                                                            safeSetState(() {}),
                                                        child:
                                                            TIleDoubleLineWidget(
                                                          inNavable: false,
                                                        ),
                                                      ),
                                                      wrapWithModel(
                                                        model: _model
                                                            .tIleDoubleLineModel10,
                                                        updateCallback: () =>
                                                            safeSetState(() {}),
                                                        child:
                                                            TIleDoubleLineWidget(
                                                          inNavable: false,
                                                        ),
                                                      ),
                                                      wrapWithModel(
                                                        model: _model
                                                            .tIleDoubleLineModel11,
                                                        updateCallback: () =>
                                                            safeSetState(() {}),
                                                        child:
                                                            TIleDoubleLineWidget(
                                                          inNavable: false,
                                                        ),
                                                      ),
                                                      wrapWithModel(
                                                        model: _model
                                                            .tIleDoubleLineModel12,
                                                        updateCallback: () =>
                                                            safeSetState(() {}),
                                                        child:
                                                            TIleDoubleLineWidget(
                                                          inNavable: false,
                                                        ),
                                                      ),
                                                    ],
                                                  ),
                                                ],
                                              ),
                                            ),
                                          ),
                                          SizedBox(
                                            height: 300.0,
                                            child: VerticalDivider(
                                              width: 1.0,
                                              thickness: 1.0,
                                              color:
                                                  FlutterFlowTheme.of(context)
                                                      .navLabel,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ),
                                  Container(
                                    height: 140.0,
                                    decoration: BoxDecoration(
                                      color: FlutterFlowTheme.of(context)
                                          .secondaryBackground,
                                    ),
                                    child: Padding(
                                      padding: EdgeInsetsDirectional.fromSTEB(
                                          1.0, 0.0, 0.0, 0.0),
                                      child: Row(
                                        mainAxisSize: MainAxisSize.min,
                                        children: [
                                          Padding(
                                            padding:
                                                EdgeInsetsDirectional.fromSTEB(
                                                    8.0, 0.0, 8.0, 0.0),
                                            child: Container(
                                              width: 100.0,
                                              decoration: BoxDecoration(),
                                              child: Column(
                                                mainAxisSize: MainAxisSize.min,
                                                mainAxisAlignment:
                                                    MainAxisAlignment.center,
                                                crossAxisAlignment:
                                                    CrossAxisAlignment.start,
                                                children: [
                                                  Align(
                                                    alignment:
                                                        AlignmentDirectional(
                                                            0.0, 0.0),
                                                    child:
                                                        CircularPercentIndicator(
                                                      percent: 0.5,
                                                      radius: 40.0,
                                                      lineWidth: 12.0,
                                                      animation: true,
                                                      animateFromLastPercent:
                                                          true,
                                                      progressColor:
                                                          FlutterFlowTheme.of(
                                                                  context)
                                                              .primary,
                                                      backgroundColor:
                                                          FlutterFlowTheme.of(
                                                                  context)
                                                              .accent4,
                                                      center: Text(
                                                        '50%',
                                                        style:
                                                            FlutterFlowTheme.of(
                                                                    context)
                                                                .headlineSmall
                                                                .override(
                                                                  fontFamily: FlutterFlowTheme.of(
                                                                          context)
                                                                      .headlineSmallFamily,
                                                                  letterSpacing:
                                                                      0.0,
                                                                  useGoogleFonts:
                                                                      !FlutterFlowTheme.of(
                                                                              context)
                                                                          .headlineSmallIsCustom,
                                                                ),
                                                      ),
                                                    ),
                                                  ),
                                                  Column(
                                                    mainAxisSize:
                                                        MainAxisSize.max,
                                                    mainAxisAlignment:
                                                        MainAxisAlignment.start,
                                                    crossAxisAlignment:
                                                        CrossAxisAlignment
                                                            .center,
                                                    children: [
                                                      wrapWithModel(
                                                        model: _model
                                                            .tIleDoubleLineModel13,
                                                        updateCallback: () =>
                                                            safeSetState(() {}),
                                                        child:
                                                            TIleDoubleLineWidget(
                                                          inNavable: false,
                                                        ),
                                                      ),
                                                      wrapWithModel(
                                                        model: _model
                                                            .tIleDoubleLineModel14,
                                                        updateCallback: () =>
                                                            safeSetState(() {}),
                                                        child:
                                                            TIleDoubleLineWidget(
                                                          inNavable: false,
                                                        ),
                                                      ),
                                                      wrapWithModel(
                                                        model: _model
                                                            .tIleDoubleLineModel15,
                                                        updateCallback: () =>
                                                            safeSetState(() {}),
                                                        child:
                                                            TIleDoubleLineWidget(
                                                          inNavable: false,
                                                        ),
                                                      ),
                                                      wrapWithModel(
                                                        model: _model
                                                            .tIleDoubleLineModel16,
                                                        updateCallback: () =>
                                                            safeSetState(() {}),
                                                        child:
                                                            TIleDoubleLineWidget(
                                                          inNavable: false,
                                                        ),
                                                      ),
                                                    ],
                                                  ),
                                                ],
                                              ),
                                            ),
                                          ),
                                          SizedBox(
                                            height: 300.0,
                                            child: VerticalDivider(
                                              width: 1.0,
                                              thickness: 1.0,
                                              color:
                                                  FlutterFlowTheme.of(context)
                                                      .navLabel,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            InkWell(
              splashColor: Colors.transparent,
              focusColor: Colors.transparent,
              hoverColor: Colors.transparent,
              highlightColor: Colors.transparent,
              onTap: () async {
                _model.isExpanded = !_model.isExpanded;
                safeSetState(() {});
              },
              child: wrapWithModel(
                model: _model.buttonCardExpandModel,
                updateCallback: () => safeSetState(() {}),
                updateOnChange: true,
                child: ButtonCardExpandWidget(
                  isExpanded: _model.isExpanded == true,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
