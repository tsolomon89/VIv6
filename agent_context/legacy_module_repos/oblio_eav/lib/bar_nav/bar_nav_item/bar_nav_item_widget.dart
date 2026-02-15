import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'bar_nav_item_model.dart';
export 'bar_nav_item_model.dart';

class BarNavItemWidget extends StatefulWidget {
  const BarNavItemWidget({
    super.key,
    String? type,
    required this.iconActive,
    required this.iconInactive,
    this.action,
  }) : this.type = type ?? 'Default';

  final String type;
  final Widget? iconActive;
  final Widget? iconInactive;
  final Future Function()? action;

  @override
  State<BarNavItemWidget> createState() => _BarNavItemWidgetState();
}

class _BarNavItemWidgetState extends State<BarNavItemWidget> {
  late BarNavItemModel _model;

  @override
  void setState(VoidCallback callback) {
    super.setState(callback);
    _model.onUpdate();
  }

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => BarNavItemModel());

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

    return InkWell(
      splashColor: Colors.transparent,
      focusColor: Colors.transparent,
      hoverColor: Colors.transparent,
      highlightColor: Colors.transparent,
      onTap: () async {
        _model.isActive = !_model.isActive;
        _model.updatePage(() {});
        await widget.action?.call();
      },
      child: AnimatedContainer(
        duration: Duration(milliseconds: 200),
        curve: Curves.easeInOut,
        width: double.infinity,
        height: 40.0,
        constraints: BoxConstraints(
          maxWidth: 236.0,
        ),
        decoration: BoxDecoration(
          color: _model.isActive == true
              ? FlutterFlowTheme.of(context).primary
              : Color(0x00FFFFFF),
          borderRadius: BorderRadius.only(
            bottomLeft: Radius.circular(0.0),
            bottomRight: Radius.circular(42.0),
            topLeft: Radius.circular(0.0),
            topRight: Radius.circular(42.0),
          ),
          shape: BoxShape.rectangle,
        ),
        child: Padding(
          padding: EdgeInsetsDirectional.fromSTEB(16.0, 0.0, 0.0, 0.0),
          child: Row(
            mainAxisSize: MainAxisSize.max,
            children: [
              _model.isActive == true
                  ? widget.iconActive!
                  : widget.iconInactive!,
              if (FFAppState().uiNavBarOpen == true)
                Expanded(
                  child: Padding(
                    padding:
                        EdgeInsetsDirectional.fromSTEB(12.0, 0.0, 0.0, 0.0),
                    child: Text(
                      widget.type,
                      style: FlutterFlowTheme.of(context).bodyMedium.override(
                            font: GoogleFonts.roboto(
                              fontWeight: FontWeight.w600,
                              fontStyle: FlutterFlowTheme.of(context)
                                  .bodyMedium
                                  .fontStyle,
                            ),
                            color: valueOrDefault<Color>(
                              _model.isActive == true
                                  ? Colors.white
                                  : FlutterFlowTheme.of(context).subtitle,
                              FlutterFlowTheme.of(context).subtitle,
                            ),
                            fontSize: 14.0,
                            letterSpacing: 0.3,
                            fontWeight: FontWeight.w600,
                            fontStyle: FlutterFlowTheme.of(context)
                                .bodyMedium
                                .fontStyle,
                          ),
                    ),
                  ),
                ),
              if ((FFAppState().uiNavBarOpen == true) && (true == false))
                Container(
                  height: 32.0,
                  decoration: BoxDecoration(
                    color: Color(0x88FFFFFF),
                    borderRadius: BorderRadius.circular(8.0),
                  ),
                  child: Align(
                    alignment: AlignmentDirectional(0.0, 0.0),
                    child: Padding(
                      padding:
                          EdgeInsetsDirectional.fromSTEB(8.0, 4.0, 8.0, 4.0),
                      child: Text(
                        '12',
                        style: FlutterFlowTheme.of(context).bodyMedium.override(
                              font: GoogleFonts.plusJakartaSans(
                                fontWeight: FontWeight.w500,
                                fontStyle: FlutterFlowTheme.of(context)
                                    .bodyMedium
                                    .fontStyle,
                              ),
                              color: Colors.white,
                              fontSize: 14.0,
                              letterSpacing: 0.0,
                              fontWeight: FontWeight.w500,
                              fontStyle: FlutterFlowTheme.of(context)
                                  .bodyMedium
                                  .fontStyle,
                            ),
                      ),
                    ),
                  ),
                ),
              if (FFAppState().uiNavBarOpen == true)
                Container(
                  width: 24.0,
                  decoration: BoxDecoration(),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
