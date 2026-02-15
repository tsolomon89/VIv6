import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import 'package:flutter/material.dart';
import 'button_title_expand_model.dart';
export 'button_title_expand_model.dart';

class ButtonTitleExpandWidget extends StatefulWidget {
  const ButtonTitleExpandWidget({super.key});

  @override
  State<ButtonTitleExpandWidget> createState() =>
      _ButtonTitleExpandWidgetState();
}

class _ButtonTitleExpandWidgetState extends State<ButtonTitleExpandWidget> {
  late ButtonTitleExpandModel _model;

  @override
  void setState(VoidCallback callback) {
    super.setState(callback);
    _model.onUpdate();
  }

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => ButtonTitleExpandModel());

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
      decoration: BoxDecoration(),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        mainAxisAlignment: MainAxisAlignment.start,
        children: [
          Icon(
            Icons.expand_more,
            color: FlutterFlowTheme.of(context).secondaryText,
            size: 24.0,
          ),
        ],
      ),
    );
  }
}
