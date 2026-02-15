import '/backend/schema/structs/index.dart';
import '/cards/components/filters/list_tile_group/tile_group/list_tiles/tiles/components/expanded_tile_list/expanded_tile_list_widget.dart';
import '/cards/components/filters/list_tile_group/tile_group/list_tiles/tiles/components/scores/score_health_row/score_health_row_widget.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import 'package:expandable/expandable.dart';
import 'package:flutter/material.dart';
import 'package:percent_indicator/percent_indicator.dart';
import 'tile_dynamic_expandable_model.dart';
export 'tile_dynamic_expandable_model.dart';

class TileDynamicExpandableWidget extends StatefulWidget {
  const TileDynamicExpandableWidget({
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
    this.workContactList,
  })  : this.scoreHealth = scoreHealth ?? 100,
        this.textOverline1 = textOverline1 ?? '',
        this.textOverline2 = textOverline2 ?? '',
        this.textOverline3 = textOverline3 ?? 'test',
        this.textOverline4 = textOverline4 ?? '',
        this.scoreProgress = scoreProgress ?? .7;

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
  final List<RecordStruct>? workContactList;

  @override
  State<TileDynamicExpandableWidget> createState() =>
      _TileDynamicExpandableWidgetState();
}

class _TileDynamicExpandableWidgetState
    extends State<TileDynamicExpandableWidget> {
  late TileDynamicExpandableModel _model;

  @override
  void setState(VoidCallback callback) {
    super.setState(callback);
    _model.onUpdate();
  }

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => TileDynamicExpandableModel());

    _model.expandableExpandableController =
        ExpandableController(initialExpanded: false);
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
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: double.infinity,
            decoration: BoxDecoration(),
            child: Container(
              width: double.infinity,
              color: Color(0x00000000),
              child: ExpandableNotifier(
                controller: _model.expandableExpandableController,
                child: ExpandablePanel(
                  header: Container(
                    constraints: BoxConstraints(
                      maxHeight: 120.0,
                    ),
                    decoration: BoxDecoration(),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      mainAxisAlignment: MainAxisAlignment.start,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Padding(
                          padding: EdgeInsetsDirectional.fromSTEB(
                              16.0, 16.0, 0.0, 16.0),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            mainAxisAlignment: MainAxisAlignment.start,
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Column(
                                mainAxisSize: MainAxisSize.min,
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  if (widget.typeLeading ==
                                      FFAppConstants.typeLeadingImageRound)
                                    Container(
                                      width: 42.0,
                                      height: 42.0,
                                      decoration: BoxDecoration(),
                                      child: ClipRRect(
                                        borderRadius:
                                            BorderRadius.circular(100.0),
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
                                            FlutterFlowTheme.of(context)
                                                .primary,
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
                                                color:
                                                    FlutterFlowTheme.of(context)
                                                        .navtext,
                                                fontSize: 14.0,
                                                letterSpacing: 0.0,
                                                fontWeight: FontWeight.w600,
                                                useGoogleFonts:
                                                    !FlutterFlowTheme.of(
                                                            context)
                                                        .headlineSmallIsCustom,
                                              ),
                                        ),
                                        startAngle: 180.0,
                                      ),
                                    ),
                                ],
                              ),
                              Expanded(
                                child: Padding(
                                  padding: EdgeInsetsDirectional.fromSTEB(
                                      0.0, 1.0, 0.0, 0.0),
                                  child: Column(
                                    mainAxisSize: MainAxisSize.min,
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        '${widget.textOverline1}${(widget.textOverline1 != '') && ((widget.textOverline2 != '') || (widget.textOverline3 != '') || (widget.textOverline4 != '')) ? ' • ' : ''}${widget.textOverline2}${(widget.textOverline2 != '') && ((widget.textOverline3 != '') || (widget.textOverline4 != '')) ? ' • ' : ''}${widget.textOverline3}${(widget.textOverline3 != '') && (widget.textOverline4 != '') ? ' • ' : ''}${widget.textOverline4}'
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
                                        '${widget.textTitle1}${(widget.textTitle1 != '') && ((widget.textTitle2 != '') || (widget.textTitle3 != '') || (widget.textTitle4 != '')) ? ' • ' : ''}${widget.textTitle2}${(widget.textTitle2 != '') && ((widget.textTitle3 != '') || (widget.textTitle4 != '')) ? ' • ' : ''}${widget.textTitle3}${(widget.textTitle3 != '') && (widget.textTitle4 != '') ? ' • ' : ''}${widget.textTitle4}'
                                            .maybeHandleOverflow(
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
                                      Text(
                                        '${widget.textBody1}${(widget.textBody1 != '') && ((widget.textBody2 != '') || (widget.textBody3 != '') || (widget.textBody4 != '')) ? ' • ' : ''}${widget.textBody2}${(widget.textBody2 != '') && ((widget.textBody3 != '') || (widget.textBody4 != '')) ? ' • ' : ''}${widget.textBody3}${(widget.textBody3 != '') && (widget.textBody4 != '') ? ' • ' : ''}${widget.textBody4}'
                                            .maybeHandleOverflow(
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
                                              color:
                                                  FlutterFlowTheme.of(context)
                                                      .secondaryText,
                                              fontSize: 10.0,
                                              letterSpacing: 0.0,
                                              lineHeight: 1.7,
                                              useGoogleFonts:
                                                  !FlutterFlowTheme.of(context)
                                                      .bodyMediumIsCustom,
                                            ),
                                      ),
                                      wrapWithModel(
                                        model: _model.scoreHealthRowModel,
                                        updateCallback: () =>
                                            safeSetState(() {}),
                                        child: ScoreHealthRowWidget(
                                          healthScore: widget.scoreHealth,
                                        ),
                                      ),
                                    ].divide(SizedBox(height: 0.0)),
                                  ),
                                ),
                              ),
                            ].divide(SizedBox(
                                width: (widget.typeLeading ==
                                            FFAppConstants.typeLeadingNone) ||
                                        (widget.typeLeading == null ||
                                            widget.typeLeading == '')
                                    ? 0.0
                                    : 16.0)),
                          ),
                        ),
                      ],
                    ),
                  ),
                  collapsed: Container(
                    width: MediaQuery.sizeOf(context).width * 0.0,
                    height: 0.0,
                    decoration: BoxDecoration(),
                  ),
                  expanded: Column(
                    mainAxisSize: MainAxisSize.max,
                    children: [
                      wrapWithModel(
                        model: _model.expandedTileListModel,
                        updateCallback: () => safeSetState(() {}),
                        child: ExpandedTileListWidget(
                          listWorkContactList: widget.workContactList,
                        ),
                      ),
                    ],
                  ),
                  theme: ExpandableThemeData(
                    tapHeaderToExpand: true,
                    tapBodyToExpand: false,
                    tapBodyToCollapse: false,
                    headerAlignment: ExpandablePanelHeaderAlignment.top,
                    hasIcon: true,
                    iconSize: 24.0,
                    iconColor: FlutterFlowTheme.of(context).secondaryText,
                    iconPadding: EdgeInsets.fromLTRB(0.0, 16.0, 16.0, 0.0),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
