import '/backend/backend.dart';
import '/backend/schema/structs/index.dart';
import '/bar_side/components/drop_down/dropdown_item/dropdown_item_widget.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import 'package:flutter/material.dart';
import 'field_dropdown_model.dart';
export 'field_dropdown_model.dart';

class FieldDropdownWidget extends StatefulWidget {
  const FieldDropdownWidget({
    super.key,
    this.fieldName,
    this.properties,
    this.selected,
    this.action,
  });

  final String? fieldName;
  final List<PropertyStruct>? properties;
  final List<PropertyStruct>? selected;
  final Future Function()? action;

  @override
  State<FieldDropdownWidget> createState() => _FieldDropdownWidgetState();
}

class _FieldDropdownWidgetState extends State<FieldDropdownWidget> {
  late FieldDropdownModel _model;

  @override
  void setState(VoidCallback callback) {
    super.setState(callback);
    _model.onUpdate();
  }

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => FieldDropdownModel());

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
      decoration: BoxDecoration(
        color: FlutterFlowTheme.of(context).secondaryBackground,
        borderRadius: BorderRadius.only(
          bottomLeft: Radius.circular(0.0),
          bottomRight: Radius.circular(0.0),
          topLeft: Radius.circular(8.0),
          topRight: Radius.circular(8.0),
        ),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          wrapWithModel(
            model: _model.dropdownItemModel,
            updateCallback: () => safeSetState(() {}),
            child: DropdownItemWidget(
              fieldName: widget.fieldName,
              properties: widget.properties,
            ),
          ),
          Divider(
            height: 0.0,
            thickness: 0.5,
            color: FlutterFlowTheme.of(context).secondaryText,
          ),
        ],
      ),
    );
  }
}
