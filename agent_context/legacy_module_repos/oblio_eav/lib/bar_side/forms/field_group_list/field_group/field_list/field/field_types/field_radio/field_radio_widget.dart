import '/backend/schema/structs/index.dart';
import '/bar_side/components/radio/radio_item/radio_item_widget.dart';
import '/flutter_flow/flutter_flow_util.dart';
import 'package:flutter/material.dart';
import 'field_radio_model.dart';
export 'field_radio_model.dart';

class FieldRadioWidget extends StatefulWidget {
  const FieldRadioWidget({
    super.key,
    this.values,
  });

  final List<PropertyStruct>? values;

  @override
  State<FieldRadioWidget> createState() => _FieldRadioWidgetState();
}

class _FieldRadioWidgetState extends State<FieldRadioWidget> {
  late FieldRadioModel _model;

  @override
  void setState(VoidCallback callback) {
    super.setState(callback);
    _model.onUpdate();
  }

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => FieldRadioModel());

    WidgetsBinding.instance.addPostFrameCallback((_) => safeSetState(() {}));
  }

  @override
  void dispose() {
    _model.maybeDispose();

    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: AlignmentDirectional(0.0, 0.0),
      child: Container(
        width: MediaQuery.sizeOf(context).width * 1.0,
        constraints: BoxConstraints(
          maxWidth: 350.0,
        ),
        decoration: BoxDecoration(),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Align(
              alignment: AlignmentDirectional(0.0, 0.0),
              child: Builder(
                builder: (context) {
                  final radios = widget.values?.toList() ?? [];

                  return Wrap(
                    spacing: 8.0,
                    runSpacing: 0.0,
                    alignment: WrapAlignment.spaceAround,
                    crossAxisAlignment: WrapCrossAlignment.start,
                    direction: Axis.horizontal,
                    runAlignment: WrapAlignment.center,
                    verticalDirection: VerticalDirection.down,
                    clipBehavior: Clip.none,
                    children: List.generate(radios.length, (radiosIndex) {
                      final radiosItem = radios[radiosIndex];
                      return InkWell(
                        splashColor: Colors.transparent,
                        focusColor: Colors.transparent,
                        hoverColor: Colors.transparent,
                        highlightColor: Colors.transparent,
                        onTap: () async {},
                        child: RadioItemWidget(
                          key: Key('Keyakw_${radiosIndex}_of_${radios.length}'),
                          value: radiosItem.valueProperty,
                          currentSelection: _model.radioSelected,
                          isSelected: true,
                        ),
                      );
                    }),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}
