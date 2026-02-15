import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import 'package:flutter/material.dart';
import 'app_background_model.dart';
export 'app_background_model.dart';

class AppBackgroundWidget extends StatefulWidget {
  const AppBackgroundWidget({super.key});

  @override
  State<AppBackgroundWidget> createState() => _AppBackgroundWidgetState();
}

class _AppBackgroundWidgetState extends State<AppBackgroundWidget> {
  late AppBackgroundModel _model;

  @override
  void setState(VoidCallback callback) {
    super.setState(callback);
    _model.onUpdate();
  }

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => AppBackgroundModel());

    WidgetsBinding.instance.addPostFrameCallback((_) => safeSetState(() {}));
  }

  @override
  void dispose() {
    _model.maybeDispose();

    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        Container(
          width: double.infinity,
          height: double.infinity,
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [
                FlutterFlowTheme.of(context).secondary,
                FlutterFlowTheme.of(context).tertiary
              ],
              stops: [0.0, 0.6],
              begin: AlignmentDirectional(-0.17, 1.0),
              end: AlignmentDirectional(0.17, -1.0),
            ),
          ),
          child: Container(
            width: double.infinity,
            height: double.infinity,
            decoration: BoxDecoration(
              color: FlutterFlowTheme.of(context).primaryBackground,
            ),
          ),
        ),
        if (Theme.of(context).brightness == Brightness.dark)
          Container(
            width: double.infinity,
            height: double.infinity,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [Color(0xFF210441), Color(0xFF010001)],
                stops: [0.0, 0.6],
                begin: AlignmentDirectional(-0.17, 1.0),
                end: AlignmentDirectional(0.17, -1.0),
              ),
            ),
            child: Container(
              width: double.infinity,
              height: double.infinity,
              decoration: BoxDecoration(
                color: FlutterFlowTheme.of(context).primaryBackground,
              ),
            ),
          ),
      ],
    );
  }
}
