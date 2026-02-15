import '/backend/backend.dart';
import '/bar_side/components/drop_down/dropdown_item_default/dropdown_item_default_widget.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/random_data_util.dart' as random_data;
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'dropdown_list_model.dart';
export 'dropdown_list_model.dart';

class DropdownListWidget extends StatefulWidget {
  const DropdownListWidget({
    super.key,
    this.documentsField,
  });

  final List<FieldRecord>? documentsField;

  @override
  State<DropdownListWidget> createState() => _DropdownListWidgetState();
}

class _DropdownListWidgetState extends State<DropdownListWidget> {
  late DropdownListModel _model;

  @override
  void setState(VoidCallback callback) {
    super.setState(callback);
    _model.onUpdate();
  }

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => DropdownListModel());

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

    return Container(
      decoration: BoxDecoration(
        color: FlutterFlowTheme.of(context).secondaryBackground,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Builder(
            builder: (context) {
              final field = List.generate(
                  random_data.randomInteger(5, 5),
                  (index) => random_data.randomString(
                        0,
                        0,
                        true,
                        false,
                        false,
                      )).toList();

              return Column(
                mainAxisSize: MainAxisSize.min,
                children: List.generate(field.length, (fieldIndex) {
                  final fieldItem = field[fieldIndex];
                  return DropdownItemDefaultWidget(
                    key: Key('Keymoa_${fieldIndex}_of_${field.length}'),
                    filters: _model.selectedProperities,
                    initialValue: PropertyStruct(),
                    action: () async {},
                  );
                }).divide(SizedBox(height: 12.0)),
              );
            },
          ),
        ],
      ),
    );
  }
}
