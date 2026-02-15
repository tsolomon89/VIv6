import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import 'package:flutter/material.dart';
import 'package:lottie/lottie.dart';
import 'auth_background_model.dart';
export 'auth_background_model.dart';

class AuthBackgroundWidget extends StatefulWidget {
  const AuthBackgroundWidget({super.key});

  @override
  State<AuthBackgroundWidget> createState() => _AuthBackgroundWidgetState();
}

class _AuthBackgroundWidgetState extends State<AuthBackgroundWidget> {
  late AuthBackgroundModel _model;

  @override
  void setState(VoidCallback callback) {
    super.setState(callback);
    _model.onUpdate();
  }

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => AuthBackgroundModel());

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
          alignment: AlignmentDirectional(0.0, -1.0),
          child: Visibility(
            visible: Theme.of(context).brightness == Brightness.dark,
            child: AnimatedContainer(
              duration: Duration(milliseconds: 280),
              curve: Curves.easeInOut,
              width: double.infinity,
              height: double.infinity,
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [Color(0xFF1A083D), Color(0xFF160536)],
                  stops: [0.0, 0.6],
                  begin: AlignmentDirectional(-0.17, 1.0),
                  end: AlignmentDirectional(0.17, -1.0),
                ),
              ),
              alignment: AlignmentDirectional(0.0, -1.0),
            ),
          ),
        ),
        Container(
          decoration: BoxDecoration(),
          child: Lottie.asset(
            'assets/jsons/Comp_4.json',
            width: MediaQuery.sizeOf(context).width * 1.0,
            height: MediaQuery.sizeOf(context).height * 1.0,
            fit: BoxFit.fill,
            animate: true,
          ),
        ),
      ],
    );
  }
}
