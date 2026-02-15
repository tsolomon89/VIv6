import '/cards/card_dynamic/card_dynamic_widget.dart';
import '/cards/card_expandable_campaigns/card_expandable_campaigns_widget.dart';
import '/cards/card_expandable_pipelines/card_expandable_pipelines_widget.dart';
import '/cards/components/filters/list_tile_group/tile_group/list_tiles/tiles/tile_record/tile_record_widget.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import 'package:flutter/material.dart';
import 'package:flutter_staggered_grid_view/flutter_staggered_grid_view.dart';
import 'package:provider/provider.dart';
import 'record_read_container_model.dart';
export 'record_read_container_model.dart';

class RecordReadContainerWidget extends StatefulWidget {
  const RecordReadContainerWidget({super.key});

  @override
  State<RecordReadContainerWidget> createState() =>
      _RecordReadContainerWidgetState();
}

class _RecordReadContainerWidgetState extends State<RecordReadContainerWidget>
    with TickerProviderStateMixin {
  late RecordReadContainerModel _model;

  @override
  void setState(VoidCallback callback) {
    super.setState(callback);
    _model.onUpdate();
  }

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => RecordReadContainerModel());

    _model.tabBarController = TabController(
      vsync: this,
      length: 3,
      initialIndex: 0,
    )..addListener(() => safeSetState(() {}));

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

    return Container(
      width: double.infinity,
      decoration: BoxDecoration(),
      child: Column(
        mainAxisSize: MainAxisSize.max,
        children: [
          Padding(
            padding: EdgeInsetsDirectional.fromSTEB(16.0, 16.0, 0.0, 0.0),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Flexible(
                  flex: 2,
                  child: Padding(
                    padding:
                        EdgeInsetsDirectional.fromSTEB(0.0, 0.0, 16.0, 0.0),
                    child: wrapWithModel(
                      model: _model.tileRecordModel,
                      updateCallback: () => safeSetState(() {}),
                      child: TileRecordWidget(),
                    ),
                  ),
                ),
                if (FFAppState().uiSideBarOpen == false)
                  Flexible(
                    child: Align(
                      alignment: AlignmentDirectional(1.0, 0.0),
                      child: Padding(
                        padding:
                            EdgeInsetsDirectional.fromSTEB(0.0, 0.0, 16.0, 0.0),
                        child: Container(
                          height: 120.0,
                          constraints: BoxConstraints(
                            minWidth: 274.0,
                            maxWidth: 357.0,
                          ),
                          decoration: BoxDecoration(),
                          child: Card(
                            clipBehavior: Clip.antiAliasWithSaveLayer,
                            color: FlutterFlowTheme.of(context).foreground,
                            elevation: 4.0,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(8.0),
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
              ],
            ),
          ),
          Expanded(
            child: Container(
              width: double.infinity,
              height: double.infinity,
              decoration: BoxDecoration(),
              child: Column(
                children: [
                  Align(
                    alignment: Alignment(0.0, 0),
                    child: TabBar(
                      labelColor: FlutterFlowTheme.of(context).primary,
                      unselectedLabelColor:
                          FlutterFlowTheme.of(context).subtitle,
                      labelPadding:
                          EdgeInsetsDirectional.fromSTEB(10.0, 0.0, 10.0, 0.0),
                      labelStyle: FlutterFlowTheme.of(context)
                          .labelSmall
                          .override(
                            fontFamily:
                                FlutterFlowTheme.of(context).labelSmallFamily,
                            letterSpacing: 0.0,
                            useGoogleFonts: !FlutterFlowTheme.of(context)
                                .labelSmallIsCustom,
                          ),
                      unselectedLabelStyle: TextStyle(),
                      indicatorColor: FlutterFlowTheme.of(context).primary,
                      padding: EdgeInsets.all(4.0),
                      tabs: [
                        Tab(
                          text: 'Example 1',
                        ),
                        Tab(
                          text: 'Example 2',
                        ),
                        Tab(
                          text: 'Example 3',
                        ),
                      ],
                      controller: _model.tabBarController,
                      onTap: (i) async {
                        [() async {}, () async {}, () async {}][i]();
                      },
                    ),
                  ),
                  Expanded(
                    child: TabBarView(
                      controller: _model.tabBarController,
                      children: [
                        Padding(
                          padding: EdgeInsetsDirectional.fromSTEB(
                              16.0, 16.0, 16.0, 0.0),
                          child: Container(
                            decoration: BoxDecoration(),
                            child: MasonryGridView.builder(
                              gridDelegate:
                                  SliverSimpleGridDelegateWithFixedCrossAxisCount(
                                crossAxisCount: () {
                                  if ((MediaQuery.sizeOf(context).width >=
                                          kBreakpointLarge) &&
                                      (FFAppState().uiSideBarOpen == true) &&
                                      (FFAppState().uiNavBarOpen == true)) {
                                    return 2;
                                  } else if ((MediaQuery.sizeOf(context)
                                              .width >=
                                          kBreakpointLarge) &&
                                      ((FFAppState().uiNavBarOpen == true) ||
                                          (FFAppState().uiSideBarOpen ==
                                              true))) {
                                    return 3;
                                  } else if ((MediaQuery.sizeOf(context)
                                              .width >=
                                          kBreakpointLarge) &&
                                      (FFAppState().uiSideBarOpen == false) &&
                                      (FFAppState().uiNavBarOpen == false)) {
                                    return 3;
                                  } else if (MediaQuery.sizeOf(context).width <=
                                      kBreakpointSmall) {
                                    return 1;
                                  } else if ((MediaQuery.sizeOf(context).width <
                                          kBreakpointLarge) &&
                                      (FFAppState().uiSideBarOpen == true) &&
                                      (FFAppState().uiNavBarOpen == true)) {
                                    return 1;
                                  } else if ((MediaQuery.sizeOf(context).width <
                                          kBreakpointLarge) &&
                                      ((FFAppState().uiNavBarOpen == true) ||
                                          (FFAppState().uiSideBarOpen ==
                                              true))) {
                                    return 1;
                                  } else if ((MediaQuery.sizeOf(context).width <
                                          kBreakpointLarge) &&
                                      (FFAppState().uiSideBarOpen == false) &&
                                      (FFAppState().uiNavBarOpen == false)) {
                                    return 2;
                                  } else {
                                    return 3;
                                  }
                                }(),
                              ),
                              crossAxisSpacing: 16.0,
                              mainAxisSpacing: 16.0,
                              itemCount: 3,
                              itemBuilder: (context, index) {
                                return [
                                  () => wrapWithModel(
                                        model:
                                            _model.cardExpandableCampaignsModel,
                                        updateCallback: () =>
                                            safeSetState(() {}),
                                        child: CardExpandableCampaignsWidget(),
                                      ),
                                  () => wrapWithModel(
                                        model: _model.cardDynamicModel,
                                        updateCallback: () =>
                                            safeSetState(() {}),
                                        child: CardDynamicWidget(),
                                      ),
                                  () => wrapWithModel(
                                        model:
                                            _model.cardExpandablePipelinesModel,
                                        updateCallback: () =>
                                            safeSetState(() {}),
                                        child: CardExpandablePipelinesWidget(),
                                      ),
                                ][index]();
                              },
                            ),
                          ),
                        ),
                        Padding(
                          padding: EdgeInsetsDirectional.fromSTEB(
                              16.0, 16.0, 16.0, 0.0),
                          child: Container(
                            decoration: BoxDecoration(),
                          ),
                        ),
                        Container(),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
