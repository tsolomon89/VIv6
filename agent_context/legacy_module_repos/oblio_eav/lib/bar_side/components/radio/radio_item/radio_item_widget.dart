import '/bar_side/components/radio/radio/radio_widget.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'radio_item_model.dart';
export 'radio_item_model.dart';

class RadioItemWidget extends StatefulWidget {
  const RadioItemWidget({
    super.key,
    this.value,
    String? currentSelection,
    bool? isSelected,
  })  : this.currentSelection = currentSelection ?? 'none',
        this.isSelected = isSelected ?? false;

  final String? value;
  final String currentSelection;
  final bool isSelected;

  @override
  State<RadioItemWidget> createState() => _RadioItemWidgetState();
}

class _RadioItemWidgetState extends State<RadioItemWidget> {
  late RadioItemModel _model;

  @override
  void setState(VoidCallback callback) {
    super.setState(callback);
    _model.onUpdate();
  }

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => RadioItemModel());

    // On component load action.
    SchedulerBinding.instance.addPostFrameCallback((_) async {
      _model.valueString = widget.value!;
      _model.updatePage(() {});
    });

    WidgetsBinding.instance.addPostFrameCallback((_) => safeSetState(() {}));
  }

  @override
  void dispose() {
    _model.maybeDispose();

    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Visibility(
      visible: widget.value != null && widget.value != '',
      child: Container(
        decoration: BoxDecoration(),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Align(
              alignment: AlignmentDirectional(0.0, 0.0),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  wrapWithModel(
                    model: _model.radioModel,
                    updateCallback: () => safeSetState(() {}),
                    child: RadioWidget(
                      isSelected: widget.isSelected,
                      iconSelected: Icon(
                        Icons.radio_button_checked,
                        color: FlutterFlowTheme.of(context).primary,
                        size: 24.0,
                      ),
                      iconDefault: Icon(
                        Icons.radio_button_off,
                        color: FlutterFlowTheme.of(context).secondaryText,
                        size: 24.0,
                      ),
                    ),
                  ),
                  Text(
                    valueOrDefault<String>(
                      widget.value,
                      'radioValue',
                    ),
                    style: FlutterFlowTheme.of(context).bodyMedium.override(
                          fontFamily:
                              FlutterFlowTheme.of(context).bodyMediumFamily,
                          letterSpacing: 0.0,
                          useGoogleFonts:
                              !FlutterFlowTheme.of(context).bodyMediumIsCustom,
                        ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
