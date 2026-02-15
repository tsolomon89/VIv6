import '/backend/backend.dart';
import '/backend/schema/structs/index.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import 'package:expandable/expandable.dart';
import 'package:flutter/material.dart';
import 'dropdown_item_model.dart';
export 'dropdown_item_model.dart';

class DropdownItemWidget extends StatefulWidget {
  const DropdownItemWidget({
    super.key,
    this.fieldName,
    this.properties,
    this.filters,
  });

  final String? fieldName;
  final List<PropertyStruct>? properties;
  final List<FieldStruct>? filters;

  @override
  State<DropdownItemWidget> createState() => _DropdownItemWidgetState();
}

class _DropdownItemWidgetState extends State<DropdownItemWidget> {
  late DropdownItemModel _model;

  @override
  void setState(VoidCallback callback) {
    super.setState(callback);
    _model.onUpdate();
  }

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => DropdownItemModel());

    _model.expandableExpandableController =
        ExpandableController(initialExpanded: false);
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
      color: FlutterFlowTheme.of(context).fieldBackground,
      child: ExpandableNotifier(
        controller: _model.expandableExpandableController,
        child: ExpandablePanel(
          header: Padding(
            padding: EdgeInsets.all(16.0),
            child: Row(
              mainAxisSize: MainAxisSize.max,
              children: [
                Expanded(
                  child: Column(
                    mainAxisSize: MainAxisSize.max,
                    mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        '(123) 456-7890',
                        style:
                            FlutterFlowTheme.of(context).titleMedium.override(
                                  fontFamily: FlutterFlowTheme.of(context)
                                      .titleMediumFamily,
                                  letterSpacing: 0.0,
                                  useGoogleFonts: !FlutterFlowTheme.of(context)
                                      .titleMediumIsCustom,
                                ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          collapsed: Container(
            width: MediaQuery.sizeOf(context).width * 0.0,
            height: 0.0,
            decoration: BoxDecoration(
              color: FlutterFlowTheme.of(context).secondaryBackground,
            ),
          ),
          expanded: Container(
            decoration: BoxDecoration(),
          ),
          theme: ExpandableThemeData(
            tapHeaderToExpand: true,
            tapBodyToExpand: true,
            tapBodyToCollapse: true,
            headerAlignment: ExpandablePanelHeaderAlignment.center,
            hasIcon: true,
          ),
        ),
      ),
    );
  }
}
