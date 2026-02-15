import '/flutter_flow/flutter_flow_icon_button.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'bar_side_button_model.dart';
export 'bar_side_button_model.dart';

class BarSideButtonWidget extends StatefulWidget {
  const BarSideButtonWidget({
    super.key,
    required this.iconToggleOff,
    required this.iconToggleOn,
    required this.type,
    Color? color,
  }) : this.color = color ?? const Color(0xFCE20E0E);

  final Widget? iconToggleOff;
  final Widget? iconToggleOn;
  final String? type;
  final Color color;

  @override
  State<BarSideButtonWidget> createState() => _BarSideButtonWidgetState();
}

class _BarSideButtonWidgetState extends State<BarSideButtonWidget> {
  late BarSideButtonModel _model;

  @override
  void setState(VoidCallback callback) {
    super.setState(callback);
    _model.onUpdate();
  }

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => BarSideButtonModel());

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

    return AnimatedContainer(
      duration: Duration(milliseconds: 330),
      curve: Curves.bounceOut,
      decoration: BoxDecoration(
        boxShadow: [
          BoxShadow(
            blurRadius: 2.0,
            color: Color(0x184B4B4B),
            offset: Offset(
              0.0,
              0.0,
            ),
            spreadRadius: 2.0,
          )
        ],
        borderRadius: BorderRadius.circular(100.0),
      ),
      child: FlutterFlowIconButton(
        borderColor: (FFAppState().uiSideBarOpen == true) &&
                (FFAppState().uiSideBarObject == widget.type)
            ? widget.color
            : Color(0xFFCCCCCC),
        borderRadius: 100.0,
        borderWidth: 2.0,
        buttonSize: 42.0,
        fillColor: (FFAppState().uiSideBarOpen == true) &&
                (FFAppState().uiSideBarObject == widget.type)
            ? widget.color
            : FlutterFlowTheme.of(context).foreground,
        hoverColor: valueOrDefault<Color>(
          widget.color,
          FlutterFlowTheme.of(context).foreground,
        ),
        hoverIconColor: FlutterFlowTheme.of(context).subtitle,
        icon: FFAppState().uiSideBarObject == widget.type
            ? widget.iconToggleOn!
            : widget.iconToggleOff!,
        onPressed: () async {
          if (FFAppState().uiSideBarOpen == true) {
            if (FFAppState().uiSideBarObject == widget.type) {
              // close sidebar
              FFAppState().uiSideBarOpen = false;
              // unset sidebarview
              FFAppState().uiSideBarObject = 'default';
              FFAppState().update(() {});
            } else {
              // set sidebarview
              FFAppState().uiSideBarObject = widget.type!;
              FFAppState().update(() {});
            }
          } else {
            // set sidebarview
            FFAppState().uiSideBarObject = widget.type!;
            // open sidebar
            FFAppState().uiSideBarOpen = true;
            FFAppState().update(() {});
          }
        },
      ),
    );
  }
}
