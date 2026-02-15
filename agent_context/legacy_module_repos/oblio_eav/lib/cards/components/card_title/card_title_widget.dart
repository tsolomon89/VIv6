import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import 'package:flutter/material.dart';
import 'card_title_model.dart';
export 'card_title_model.dart';

class CardTitleWidget extends StatefulWidget {
  const CardTitleWidget({
    super.key,
    String? cardTitle,
  }) : this.cardTitle = cardTitle ?? 'CARD TITLE';

  final String cardTitle;

  @override
  State<CardTitleWidget> createState() => _CardTitleWidgetState();
}

class _CardTitleWidgetState extends State<CardTitleWidget> {
  late CardTitleModel _model;

  @override
  void setState(VoidCallback callback) {
    super.setState(callback);
    _model.onUpdate();
  }

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => CardTitleModel());

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
      height: 42.0,
      decoration: BoxDecoration(),
      child: Padding(
        padding: EdgeInsetsDirectional.fromSTEB(16.0, 16.0, 0.0, 0.0),
        child: Text(
          valueOrDefault<String>(
            widget.cardTitle,
            'CARD TITLE',
          ),
          style: FlutterFlowTheme.of(context).titleMedium.override(
                fontFamily: FlutterFlowTheme.of(context).titleMediumFamily,
                color: FlutterFlowTheme.of(context).primaryText,
                fontSize: 15.0,
                letterSpacing: 0.0,
                fontWeight: FontWeight.w500,
                useGoogleFonts:
                    !FlutterFlowTheme.of(context).titleMediumIsCustom,
              ),
        ),
      ),
    );
  }
}
