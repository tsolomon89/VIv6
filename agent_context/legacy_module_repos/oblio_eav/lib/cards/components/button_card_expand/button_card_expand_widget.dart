import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'button_card_expand_model.dart';
export 'button_card_expand_model.dart';

class ButtonCardExpandWidget extends StatefulWidget {
  const ButtonCardExpandWidget({
    super.key,
    bool? isExpanded,
  }) : this.isExpanded = isExpanded ?? false;

  final bool isExpanded;

  @override
  State<ButtonCardExpandWidget> createState() => _ButtonCardExpandWidgetState();
}

class _ButtonCardExpandWidgetState extends State<ButtonCardExpandWidget> {
  late ButtonCardExpandModel _model;

  @override
  void setState(VoidCallback callback) {
    super.setState(callback);
    _model.onUpdate();
  }

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => ButtonCardExpandModel());

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
      height: 57.0,
      constraints: BoxConstraints(
        maxHeight: 57.0,
      ),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.only(
          bottomLeft: Radius.circular(8.0),
          bottomRight: Radius.circular(8.0),
          topLeft: Radius.circular(0.0),
          topRight: Radius.circular(0.0),
        ),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.max,
        mainAxisAlignment: MainAxisAlignment.start,
        children: [
          Divider(
            height: 1.0,
            thickness: 1.0,
            color: Color(0xFFE3E3E3),
          ),
          Align(
            alignment: AlignmentDirectional(-1.0, 0.0),
            child: Padding(
              padding: EdgeInsetsDirectional.fromSTEB(16.0, 16.0, 0.0, 16.0),
              child: Text(
                widget.isExpanded == true ? 'COLLASPE' : 'EXPAND',
                style: FlutterFlowTheme.of(context).bodyMedium.override(
                      font: GoogleFonts.poppins(
                        fontWeight: FontWeight.w500,
                        fontStyle:
                            FlutterFlowTheme.of(context).bodyMedium.fontStyle,
                      ),
                      color: FlutterFlowTheme.of(context).primary,
                      fontSize: 14.0,
                      letterSpacing: 0.11,
                      fontWeight: FontWeight.w500,
                      fontStyle:
                          FlutterFlowTheme.of(context).bodyMedium.fontStyle,
                    ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
