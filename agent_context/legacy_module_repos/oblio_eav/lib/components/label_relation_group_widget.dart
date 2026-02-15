import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import 'package:flutter/material.dart';
import 'label_relation_group_model.dart';
export 'label_relation_group_model.dart';

class LabelRelationGroupWidget extends StatefulWidget {
  const LabelRelationGroupWidget({super.key});

  @override
  State<LabelRelationGroupWidget> createState() =>
      _LabelRelationGroupWidgetState();
}

class _LabelRelationGroupWidgetState extends State<LabelRelationGroupWidget> {
  late LabelRelationGroupModel _model;

  @override
  void setState(VoidCallback callback) {
    super.setState(callback);
    _model.onUpdate();
  }

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => LabelRelationGroupModel());

    WidgetsBinding.instance.addPostFrameCallback((_) => safeSetState(() {}));
  }

  @override
  void dispose() {
    _model.maybeDispose();

    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: AlignmentDirectional(-1.0, 0.0),
      child: Container(
        constraints: BoxConstraints(
          maxWidth: 500.0,
          maxHeight: double.infinity,
        ),
        decoration: BoxDecoration(),
        child: Padding(
          padding: EdgeInsetsDirectional.fromSTEB(16.0, 0.0, 0.0, 0.0),
          child: Text(
            'Settings',
            style: FlutterFlowTheme.of(context).labelSmall.override(
                  fontFamily: FlutterFlowTheme.of(context).labelSmallFamily,
                  color: FlutterFlowTheme.of(context).primaryText,
                  letterSpacing: 0.0,
                  useGoogleFonts:
                      !FlutterFlowTheme.of(context).labelSmallIsCustom,
                ),
          ),
        ),
      ),
    );
  }
}
