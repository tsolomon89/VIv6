import '/backend/backend.dart';
import '/bar_side/forms/field_group_list/field_group/field_group_item/field_group_item_widget.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/random_data_util.dart' as random_data;
import 'package:flutter/material.dart';
import 'field_group_list_model.dart';
export 'field_group_list_model.dart';

class FieldGroupListWidget extends StatefulWidget {
  const FieldGroupListWidget({
    super.key,
    this.objectDocument,
    this.action,
    this.recordDocument,
    this.fieldGroupDoucmentList,
    this.fieldGroupStructList,
  });

  final ObjectRecord? objectDocument;
  final Future Function()? action;
  final OrganizationRecordRecord? recordDocument;
  final List<FieldGroupRecord>? fieldGroupDoucmentList;
  final List<FieldGroupStruct>? fieldGroupStructList;

  @override
  State<FieldGroupListWidget> createState() => _FieldGroupListWidgetState();
}

class _FieldGroupListWidgetState extends State<FieldGroupListWidget> {
  late FieldGroupListModel _model;

  @override
  void setState(VoidCallback callback) {
    super.setState(callback);
    _model.onUpdate();
  }

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => FieldGroupListModel());

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
      constraints: BoxConstraints(
        minHeight: 300.0,
        maxHeight: 750.0,
      ),
      decoration: BoxDecoration(),
      child: Builder(
        builder: (context) {
          final fieldGroupList = widget.fieldGroupStructList?.toList() ?? [];

          return SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children:
                  List.generate(fieldGroupList.length, (fieldGroupListIndex) {
                final fieldGroupListItem = fieldGroupList[fieldGroupListIndex];
                return wrapWithModel(
                  model: _model.fieldGroupItemModels.getModel(
                    random_data.randomString(
                      50,
                      50,
                      true,
                      true,
                      true,
                    ),
                    fieldGroupListIndex,
                  ),
                  updateCallback: () => safeSetState(() {}),
                  child: FieldGroupItemWidget(
                    key: Key(
                      'Key0hk_${random_data.randomString(
                        50,
                        50,
                        true,
                        true,
                        true,
                      )}',
                    ),
                    objectFieldGroupItem: fieldGroupListItem,
                    recordFieldGroupItem: fieldGroupListItem,
                  ),
                );
              }),
            ),
          );
        },
      ),
    );
  }
}
