import '/cards/card_dynamic/card_dynamic_widget.dart';
import '/cards/card_expandable_campaigns/card_expandable_campaigns_widget.dart';
import '/cards/card_expandable_pipelines/card_expandable_pipelines_widget.dart';
import '/cards/components/filters/list_tile_group/tile_group/list_tiles/tiles/tile_record/tile_record_widget.dart';
import '/flutter_flow/flutter_flow_util.dart';
import 'record_read_container_widget.dart' show RecordReadContainerWidget;
import 'package:flutter/material.dart';

class RecordReadContainerModel
    extends FlutterFlowModel<RecordReadContainerWidget> {
  ///  State fields for stateful widgets in this component.

  // Model for tileRecord component.
  late TileRecordModel tileRecordModel;
  // State field(s) for TabBar widget.
  TabController? tabBarController;
  int get tabBarCurrentIndex =>
      tabBarController != null ? tabBarController!.index : 0;
  int get tabBarPreviousIndex =>
      tabBarController != null ? tabBarController!.previousIndex : 0;

  // Model for cardExpandableCampaigns component.
  late CardExpandableCampaignsModel cardExpandableCampaignsModel;
  // Model for cardDynamic component.
  late CardDynamicModel cardDynamicModel;
  // Model for cardExpandablePipelines component.
  late CardExpandablePipelinesModel cardExpandablePipelinesModel;

  @override
  void initState(BuildContext context) {
    tileRecordModel = createModel(context, () => TileRecordModel());
    cardExpandableCampaignsModel =
        createModel(context, () => CardExpandableCampaignsModel());
    cardDynamicModel = createModel(context, () => CardDynamicModel());
    cardExpandablePipelinesModel =
        createModel(context, () => CardExpandablePipelinesModel());
  }

  @override
  void dispose() {
    tileRecordModel.dispose();
    tabBarController?.dispose();
    cardExpandableCampaignsModel.dispose();
    cardDynamicModel.dispose();
    cardExpandablePipelinesModel.dispose();
  }
}
