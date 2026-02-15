import '/cards/components/filters/list_tile_group/tile_group/list_tiles/tiles/components/scores/score_health_row/score_health_row_widget.dart';
import '/cards/components/filters/list_tile_group/tile_group/list_tiles/tiles/components/scores/score_opp_row/score_opp_row_widget.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import 'package:flutter/material.dart';
import 'tile_record_model.dart';
export 'tile_record_model.dart';

class TileRecordWidget extends StatefulWidget {
  const TileRecordWidget({super.key});

  @override
  State<TileRecordWidget> createState() => _TileRecordWidgetState();
}

class _TileRecordWidgetState extends State<TileRecordWidget> {
  late TileRecordModel _model;

  @override
  void setState(VoidCallback callback) {
    super.setState(callback);
    _model.onUpdate();
  }

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => TileRecordModel());

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
      width: double.infinity,
      height: 120.0,
      constraints: BoxConstraints(
        maxWidth: 900.0,
      ),
      decoration: BoxDecoration(
        image: DecorationImage(
          fit: BoxFit.cover,
          image: Image.network(
            '',
          ).image,
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Padding(
            padding: EdgeInsetsDirectional.fromSTEB(0.0, 0.0, 16.0, 0.0),
            child: Column(
              mainAxisSize: MainAxisSize.max,
              children: [
                Container(
                  width: 120.0,
                  height: 120.0,
                  decoration: BoxDecoration(
                    boxShadow: [
                      BoxShadow(
                        blurRadius: 2.0,
                        color: Color(0x33000000),
                        offset: Offset(
                          0.0,
                          0.0,
                        ),
                        spreadRadius: 2.0,
                      )
                    ],
                    shape: BoxShape.circle,
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
              ],
            ),
          ),
          Expanded(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  height: 120.0,
                  decoration: BoxDecoration(),
                  child: Stack(
                    children: [
                      Column(
                        mainAxisSize: MainAxisSize.max,
                        mainAxisAlignment: MainAxisAlignment.start,
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Hello World',
                            style: FlutterFlowTheme.of(context)
                                .labelLarge
                                .override(
                                  fontFamily: FlutterFlowTheme.of(context)
                                      .labelLargeFamily,
                                  color: FlutterFlowTheme.of(context)
                                      .secondaryText,
                                  letterSpacing: 0.0,
                                  useGoogleFonts: !FlutterFlowTheme.of(context)
                                      .labelLargeIsCustom,
                                ),
                          ),
                          Padding(
                            padding: EdgeInsetsDirectional.fromSTEB(
                                0.0, 0.0, 0.0, 6.0),
                            child: Text(
                              'X-X',
                              style: FlutterFlowTheme.of(context)
                                  .titleLarge
                                  .override(
                                    fontFamily: FlutterFlowTheme.of(context)
                                        .titleLargeFamily,
                                    color: FlutterFlowTheme.of(context)
                                        .primaryText,
                                    fontSize: 24.0,
                                    letterSpacing: 0.0,
                                    useGoogleFonts:
                                        !FlutterFlowTheme.of(context)
                                            .titleLargeIsCustom,
                                  ),
                            ),
                          ),
                          Padding(
                            padding: EdgeInsetsDirectional.fromSTEB(
                                0.0, 0.0, 0.0, 6.0),
                            child: Text(
                              'Hello World',
                              maxLines: 2,
                              style: FlutterFlowTheme.of(context)
                                  .bodyLarge
                                  .override(
                                    fontFamily: FlutterFlowTheme.of(context)
                                        .bodyLargeFamily,
                                    color: FlutterFlowTheme.of(context)
                                        .secondaryText,
                                    letterSpacing: 0.0,
                                    useGoogleFonts:
                                        !FlutterFlowTheme.of(context)
                                            .bodyLargeIsCustom,
                                  ),
                            ),
                          ),
                          Text(
                            'Hello World',
                            maxLines: 2,
                            style: FlutterFlowTheme.of(context)
                                .bodyLarge
                                .override(
                                  fontFamily: FlutterFlowTheme.of(context)
                                      .bodyLargeFamily,
                                  color: FlutterFlowTheme.of(context)
                                      .secondaryText,
                                  letterSpacing: 0.0,
                                  useGoogleFonts: !FlutterFlowTheme.of(context)
                                      .bodyLargeIsCustom,
                                ),
                          ),
                          Expanded(
                            child: wrapWithModel(
                              model: _model.scoreOppRowModel,
                              updateCallback: () => safeSetState(() {}),
                              updateOnChange: true,
                              child: ScoreOppRowWidget(
                                isLarge: true,
                              ),
                            ),
                          ),
                        ],
                      ),
                      Align(
                        alignment: AlignmentDirectional(1.0, -1.0),
                        child: wrapWithModel(
                          model: _model.scoreHealthRowModel,
                          updateCallback: () => safeSetState(() {}),
                          child: ScoreHealthRowWidget(
                            healthScore: 100,
                            isLarge: true,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
