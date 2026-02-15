import '/backend/backend.dart';
import '/backend/schema/structs/index.dart';
import '/bar_side/forms/field_group_list/field_group/field_list/field/field_dynamic/field_dynamic_widget.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/random_data_util.dart' as random_data;
import 'package:flutter/material.dart';
import 'field_list_model.dart';
export 'field_list_model.dart';

class FieldListWidget extends StatefulWidget {
  const FieldListWidget({
    super.key,
    this.objectFieldGroupFields,
    this.action,
    this.recordFieldGroupFIelds,
  });

  final List<ObjectStruct>? objectFieldGroupFields;
  final Future Function()? action;
  final List<RecordStruct>? recordFieldGroupFIelds;

  @override
  State<FieldListWidget> createState() => _FieldListWidgetState();
}

class _FieldListWidgetState extends State<FieldListWidget> {
  late FieldListModel _model;

  @override
  void setState(VoidCallback callback) {
    super.setState(callback);
    _model.onUpdate();
  }

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => FieldListModel());

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
      child: Builder(
        builder: (context) {
          final fieldList = widget.recordFieldGroupFIelds
                  ?.map((e) => e)
                  .toList()
                  .toList() ??
              [];

          return Column(
            mainAxisSize: MainAxisSize.min,
            children: List.generate(fieldList.length, (fieldListIndex) {
              final fieldListItem = fieldList[fieldListIndex];
              return wrapWithModel(
                model: _model.fieldDynamicModels.getModel(
                  random_data.randomString(
                    51,
                    51,
                    true,
                    true,
                    true,
                  ),
                  fieldListIndex,
                ),
                updateCallback: () => safeSetState(() {}),
                updateOnChange: true,
                child: FieldDynamicWidget(
                  key: Key(
                    'Key7gm_${random_data.randomString(
                      51,
                      51,
                      true,
                      true,
                      true,
                    )}',
                  ),
                  selectedProperties: _model.selectedProperities,
                  objectField: fieldListItem.objectStruct,
                  recordField: RecordStruct(),
                ),
              );
            }).divide(SizedBox(height: 12.0)),
          );
        },
      ),
    );
  }
}
