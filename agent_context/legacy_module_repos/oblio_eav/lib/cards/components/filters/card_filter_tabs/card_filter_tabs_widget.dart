import '/cards/components/filters/list_tile_group/tile_group/list_tiles/list_tiles/list_tiles_widget.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import 'package:flutter/material.dart';
import 'card_filter_tabs_model.dart';
export 'card_filter_tabs_model.dart';

class CardFilterTabsWidget extends StatefulWidget {
  const CardFilterTabsWidget({
    super.key,
    bool? parameter1,
  }) : this.parameter1 = parameter1 ?? false;

  final bool parameter1;

  @override
  State<CardFilterTabsWidget> createState() => _CardFilterTabsWidgetState();
}

class _CardFilterTabsWidgetState extends State<CardFilterTabsWidget>
    with TickerProviderStateMixin {
  late CardFilterTabsModel _model;

  @override
  void setState(VoidCallback callback) {
    super.setState(callback);
    _model.onUpdate();
  }

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => CardFilterTabsModel());

    _model.tabBarController = TabController(
      vsync: this,
      length: 2,
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
    return AnimatedContainer(
      duration: Duration(milliseconds: 960),
      curve: Curves.bounceOut,
      decoration: BoxDecoration(
        color: FlutterFlowTheme.of(context).foreground,
      ),
      child: Column(
        children: [
          Align(
            alignment: Alignment(0.0, 0),
            child: TabBar(
              labelColor: FlutterFlowTheme.of(context).accent1,
              unselectedLabelColor: FlutterFlowTheme.of(context).secondaryText,
              labelStyle: FlutterFlowTheme.of(context).titleMedium.override(
                    fontFamily: FlutterFlowTheme.of(context).titleMediumFamily,
                    fontSize: 11.0,
                    letterSpacing: 0.0,
                    fontWeight: FontWeight.w500,
                    useGoogleFonts:
                        !FlutterFlowTheme.of(context).titleMediumIsCustom,
                  ),
              unselectedLabelStyle: FlutterFlowTheme.of(context)
                  .titleMedium
                  .override(
                    fontFamily: FlutterFlowTheme.of(context).titleMediumFamily,
                    fontSize: 11.0,
                    letterSpacing: 0.0,
                    fontWeight: FontWeight.normal,
                    useGoogleFonts:
                        !FlutterFlowTheme.of(context).titleMediumIsCustom,
                  ),
              indicatorColor: FlutterFlowTheme.of(context).accent1,
              padding: EdgeInsets.all(4.0),
              tabs: [
                Tab(
                  text: 'SCHEDULED',
                ),
                Tab(
                  text: 'COMPLETED',
                ),
              ],
              controller: _model.tabBarController,
              onTap: (i) async {
                [() async {}, () async {}][i]();
              },
            ),
          ),
          Expanded(
            child: TabBarView(
              controller: _model.tabBarController,
              children: [
                wrapWithModel(
                  model: _model.listTilesModel1,
                  updateCallback: () => safeSetState(() {}),
                  child: ListTilesWidget(),
                ),
                wrapWithModel(
                  model: _model.listTilesModel2,
                  updateCallback: () => safeSetState(() {}),
                  child: ListTilesWidget(),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
