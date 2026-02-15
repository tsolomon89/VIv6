import '/backend/backend.dart';
import '/bar_side/components/misc/bar_side_form_label/bar_side_form_label_widget.dart';
import '/bar_side/components/misc/divider/divider_widget.dart';
import '/bar_side/forms/field_group_list/field_group/field_list/field_list/field_list_widget.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import 'package:expandable/expandable.dart';
import 'package:flutter/material.dart';
import 'field_group_item_model.dart';
export 'field_group_item_model.dart';

class FieldGroupItemWidget extends StatefulWidget {
  const FieldGroupItemWidget({
    super.key,
    this.objectFieldGroupItem,
    this.recordFieldGroupItem,
    this.objectFIeldList,
  });

  final FieldGroupStruct? objectFieldGroupItem;
  final FieldGroupStruct? recordFieldGroupItem;
  final List<FieldRecord>? objectFIeldList;

  @override
  State<FieldGroupItemWidget> createState() => _FieldGroupItemWidgetState();
}

class _FieldGroupItemWidgetState extends State<FieldGroupItemWidget> {
  late FieldGroupItemModel _model;

  @override
  void setState(VoidCallback callback) {
    super.setState(callback);
    _model.onUpdate();
  }

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => FieldGroupItemModel());

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
      decoration: BoxDecoration(
        color: FlutterFlowTheme.of(context).secondaryBackground,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            decoration: BoxDecoration(),
            child: Container(
              width: double.infinity,
              color: Colors.white,
              child: ExpandableNotifier(
                controller: _model.expandableExpandableController,
                child: ExpandablePanel(
                  header: Padding(
                    padding:
                        EdgeInsetsDirectional.fromSTEB(24.0, 0.0, 0.0, 0.0),
                    child: wrapWithModel(
                      model: _model.barSideFormLabelModel,
                      updateCallback: () => safeSetState(() {}),
                      child: BarSideFormLabelWidget(
                        textLabel: valueOrDefault<String>(
                          widget.objectFieldGroupItem?.nameFieldGroup,
                          'fieldGroupName',
                        ),
                      ),
                    ),
                  ),
                  collapsed: Container(
                    width: MediaQuery.sizeOf(context).width * 0.0,
                    height: 0.0,
                    decoration: BoxDecoration(
                      color: FlutterFlowTheme.of(context).secondaryBackground,
                    ),
                  ),
                  expanded: wrapWithModel(
                    model: _model.fieldListModel,
                    updateCallback: () => safeSetState(() {}),
                    child: FieldListWidget(
                      action: () async {},
                    ),
                  ),
                  theme: ExpandableThemeData(
                    tapHeaderToExpand: true,
                    tapBodyToExpand: false,
                    tapBodyToCollapse: false,
                    headerAlignment: ExpandablePanelHeaderAlignment.center,
                    hasIcon: true,
                  ),
                ),
              ),
            ),
          ),
          wrapWithModel(
            model: _model.dividerModel,
            updateCallback: () => safeSetState(() {}),
            child: DividerWidget(),
          ),
        ],
      ),
    );
  }
}
