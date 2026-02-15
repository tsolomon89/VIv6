import '/backend/backend.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/misc/form_old/form_old_widget.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'bar_side_form_model.dart';
export 'bar_side_form_model.dart';

class BarSideFormWidget extends StatefulWidget {
  const BarSideFormWidget({
    super.key,
    String? confirmButtonText,
    required this.navigateAction,
    String? formAction,
    this.fieldString1,
    this.fieldString2,
    this.fieldString3,
    this.fieldString4,
    this.documentsField,
  })  : this.confirmButtonText = confirmButtonText ?? 'Save Changes',
        this.formAction = formAction ?? 'create';

  final String confirmButtonText;
  final Future Function()? navigateAction;
  final String formAction;
  final String? fieldString1;
  final String? fieldString2;
  final String? fieldString3;
  final String? fieldString4;
  final List<FieldRecord>? documentsField;

  @override
  State<BarSideFormWidget> createState() => _BarSideFormWidgetState();
}

class _BarSideFormWidgetState extends State<BarSideFormWidget> {
  late BarSideFormModel _model;

  @override
  void setState(VoidCallback callback) {
    super.setState(callback);
    _model.onUpdate();
  }

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => BarSideFormModel());

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

    return Visibility(
      visible: FFAppState().uiSideBarObject == 'contact',
      child: Align(
        alignment: AlignmentDirectional(0.0, -1.0),
        child: AnimatedContainer(
          duration: Duration(milliseconds: 740),
          curve: Curves.bounceOut,
          width: 300.0,
          constraints: BoxConstraints(
            minWidth: 300.0,
          ),
          decoration: BoxDecoration(
            color: FlutterFlowTheme.of(context).secondaryBackground,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            mainAxisAlignment: MainAxisAlignment.start,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              if (FFAppState().uiSideBarObject == 'contact')
                wrapWithModel(
                  model: _model.formOldModel,
                  updateCallback: () => safeSetState(() {}),
                  child: FormOldWidget(
                    isUpdateForm: false,
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
