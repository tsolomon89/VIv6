import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'icon_dynamic_model.dart';
export 'icon_dynamic_model.dart';

class IconDynamicWidget extends StatefulWidget {
  const IconDynamicWidget({
    super.key,
    String? nameFIeld,
  }) : this.nameFIeld = nameFIeld ?? 'none';

  final String nameFIeld;

  @override
  State<IconDynamicWidget> createState() => _IconDynamicWidgetState();
}

class _IconDynamicWidgetState extends State<IconDynamicWidget> {
  late IconDynamicModel _model;

  @override
  void setState(VoidCallback callback) {
    super.setState(callback);
    _model.onUpdate();
  }

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => IconDynamicModel());

    WidgetsBinding.instance.addPostFrameCallback((_) => safeSetState(() {}));
  }

  @override
  void dispose() {
    _model.maybeDispose();

    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        if (widget.nameFIeld == FFAppConstants.iconPhone)
          Container(
            decoration: BoxDecoration(),
            child: Icon(
              Icons.local_phone,
              color: FlutterFlowTheme.of(context).secondaryText,
              size: 24.0,
            ),
          ),
        if (widget.nameFIeld == FFAppConstants.iconEmail)
          Container(
            decoration: BoxDecoration(),
            child: Icon(
              Icons.email,
              color: FlutterFlowTheme.of(context).secondaryText,
              size: 24.0,
            ),
          ),
        if (widget.nameFIeld == FFAppConstants.iconMessanger)
          Container(
            decoration: BoxDecoration(),
            child: Icon(
              Icons.message,
              color: FlutterFlowTheme.of(context).secondaryText,
              size: 24.0,
            ),
          ),
        if (widget.nameFIeld == FFAppConstants.iconX)
          Container(
            width: 24.0,
            height: 24.0,
            decoration: BoxDecoration(
              color: FlutterFlowTheme.of(context).primaryText,
              shape: BoxShape.circle,
            ),
            child: Align(
              alignment: AlignmentDirectional(0.0, 0.0),
              child: Icon(
                FFIcons.kx,
                color: Colors.white,
                size: 10.0,
              ),
            ),
          ),
        if (widget.nameFIeld == FFAppConstants.iconLinkedin)
          Align(
            alignment: AlignmentDirectional(0.0, 0.0),
            child: Container(
              width: 24.0,
              height: 24.0,
              decoration: BoxDecoration(
                color: Color(0xFF2489BE),
                shape: BoxShape.circle,
              ),
              child: Align(
                alignment: AlignmentDirectional(0.0, 0.0),
                child: FaIcon(
                  FontAwesomeIcons.linkedinIn,
                  color: Colors.white,
                  size: 12.0,
                ),
              ),
            ),
          ),
        if (widget.nameFIeld == FFAppConstants.iconFacebook)
          Container(
            decoration: BoxDecoration(),
            child: FaIcon(
              FontAwesomeIcons.facebook,
              color: Color(0xFF1877F2),
              size: 24.0,
            ),
          ),
      ],
    );
  }
}
