import '/backend/schema/structs/index.dart';
import '/cards/components/filters/list_tile_group/tile_group/list_tiles/tiles/components/t_ile_double_line/t_ile_double_line_widget.dart';
import '/flutter_flow/flutter_flow_util.dart';
import 'package:flutter/material.dart';
import 'expanded_tile_list_model.dart';
export 'expanded_tile_list_model.dart';

class ExpandedTileListWidget extends StatefulWidget {
  const ExpandedTileListWidget({
    super.key,
    this.listWorkContactList,
  });

  final List<RecordStruct>? listWorkContactList;

  @override
  State<ExpandedTileListWidget> createState() => _ExpandedTileListWidgetState();
}

class _ExpandedTileListWidgetState extends State<ExpandedTileListWidget> {
  late ExpandedTileListModel _model;

  @override
  void setState(VoidCallback callback) {
    super.setState(callback);
    _model.onUpdate();
  }

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => ExpandedTileListModel());

    WidgetsBinding.instance.addPostFrameCallback((_) => safeSetState(() {}));
  }

  @override
  void dispose() {
    _model.maybeDispose();

    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Builder(
      builder: (context) {
        final workContactList =
            widget.listWorkContactList?.map((e) => e).toList().toList() ?? [];

        return ListView.builder(
          padding: EdgeInsets.zero,
          scrollDirection: Axis.vertical,
          itemCount: workContactList.length,
          itemBuilder: (context, workContactListIndex) {
            final workContactListItem = workContactList[workContactListIndex];
            return TIleDoubleLineWidget(
              key: Key(
                  'Keyv1f_${workContactListIndex}_of_${workContactList.length}'),
              nameField: '',
              valueProperty: '',
              inNavable: false,
            );
          },
        );
      },
    );
  }
}
