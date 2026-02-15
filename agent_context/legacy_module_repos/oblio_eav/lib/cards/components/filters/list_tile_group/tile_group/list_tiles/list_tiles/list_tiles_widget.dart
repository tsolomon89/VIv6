import '/backend/schema/structs/index.dart';
import '/cards/components/filters/list_tile_group/tile_group/list_tiles/tiles/tile_dynamic/tile_dynamic_widget.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/random_data_util.dart' as random_data;
import 'package:flutter/material.dart';
import 'list_tiles_model.dart';
export 'list_tiles_model.dart';

class ListTilesWidget extends StatefulWidget {
  const ListTilesWidget({
    super.key,
    this.dataListProperty,
    this.dataListField,
    this.dataFieldGroup,
  });

  final List<PropertyStruct>? dataListProperty;
  final List<PropertyStruct>? dataListField;
  final PropertyStruct? dataFieldGroup;

  @override
  State<ListTilesWidget> createState() => _ListTilesWidgetState();
}

class _ListTilesWidgetState extends State<ListTilesWidget> {
  late ListTilesModel _model;

  @override
  void setState(VoidCallback callback) {
    super.setState(callback);
    _model.onUpdate();
  }

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => ListTilesModel());

    WidgetsBinding.instance.addPostFrameCallback((_) => safeSetState(() {}));
  }

  @override
  void dispose() {
    _model.maybeDispose();

    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        wrapWithModel(
          model: _model.tileDynamicModel,
          updateCallback: () => safeSetState(() {}),
          child: TileDynamicWidget(
            scoreHealth: random_data.randomInteger(0, 100),
            typeLeading: FFAppConstants.typeLeadingImageRound,
            textTitle1: 'title',
            textBody1: 'body',
            leadingVisible: true,
            isExpandable: true,
            dataListOverlineProperty: widget.dataListProperty,
            dataListTitleProperty: widget.dataListField,
            dataListBodyProperty: widget.dataListField,
          ),
        ),
      ],
    );
  }
}
