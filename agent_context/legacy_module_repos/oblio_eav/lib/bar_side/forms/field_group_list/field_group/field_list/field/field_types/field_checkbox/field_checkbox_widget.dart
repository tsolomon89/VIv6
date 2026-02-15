import '/backend/schema/structs/index.dart';
import '/bar_side/components/radio/radio_item/radio_item_widget.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import 'package:flutter/material.dart';
import 'field_checkbox_model.dart';
export 'field_checkbox_model.dart';

class FieldCheckboxWidget extends StatefulWidget {
  const FieldCheckboxWidget({
    super.key,
    this.values,
  });

  final List<PropertyStruct>? values;

  @override
  State<FieldCheckboxWidget> createState() => _FieldCheckboxWidgetState();
}

class _FieldCheckboxWidgetState extends State<FieldCheckboxWidget> {
  late FieldCheckboxModel _model;

  @override
  void setState(VoidCallback callback) {
    super.setState(callback);
    _model.onUpdate();
  }

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => FieldCheckboxModel());

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
              child: Wrap(
                spacing: 8.0,
                runSpacing: 0.0,
                alignment: WrapAlignment.spaceAround,
                crossAxisAlignment: WrapCrossAlignment.start,
                direction: Axis.horizontal,
                runAlignment: WrapAlignment.center,
                verticalDirection: VerticalDirection.down,
                clipBehavior: Clip.none,
                children: [
                  InkWell(
                    splashColor: Colors.transparent,
                    focusColor: Colors.transparent,
                    hoverColor: Colors.transparent,
                    highlightColor: Colors.transparent,
                    onTap: () async {
                      _model.radioSelected = '';
                      safeSetState(() {});
                      _model.boolean1 = !_model.boolean1;
                      _model.radioSelected = _model.radioSelected ==
                              _model.radioItem1Model1.valueString
                          ? 'none'
                          : _model.radioItem1Model1.valueString;
                      _model.boolean2 = false;
                      _model.boolean3 = false;
                      _model.boolean4 = false;
                      _model.boolean5 = false;
                      _model.boolean6 = false;
                      _model.updatePage(() {});
                    },
                    child: wrapWithModel(
                      model: _model.radioItem1Model1,
                      updateCallback: () => safeSetState(() {}),
                      updateOnChange: true,
                      child: RadioItemWidget(
                        value: 'B2C',
                        currentSelection: _model.radioSelected,
                        isSelected: _model.boolean1,
                      ),
                    ),
                  ),
                  InkWell(
                    splashColor: Colors.transparent,
                    focusColor: Colors.transparent,
                    hoverColor: Colors.transparent,
                    highlightColor: Colors.transparent,
                    onTap: () async {
                      _model.radioSelected = '';
                      safeSetState(() {});
                      _model.boolean1 = false;
                      _model.radioSelected = _model.radioSelected ==
                              _model.radioItem2Model.valueString
                          ? 'none'
                          : _model.radioItem2Model.valueString;
                      _model.boolean2 = true;
                      _model.boolean3 = false;
                      _model.boolean4 = false;
                      _model.boolean5 = false;
                      _model.boolean6 = false;
                      _model.updatePage(() {});
                    },
                    child: wrapWithModel(
                      model: _model.radioItem2Model,
                      updateCallback: () => safeSetState(() {}),
                      updateOnChange: true,
                      child: RadioItemWidget(
                        value: 'B2B',
                        currentSelection: _model.radioSelected,
                        isSelected: _model.boolean2,
                      ),
                    ),
                  ),
                  InkWell(
                    splashColor: Colors.transparent,
                    focusColor: Colors.transparent,
                    hoverColor: Colors.transparent,
                    highlightColor: Colors.transparent,
                    onTap: () async {
                      _model.radioSelected = '';
                      safeSetState(() {});
                      _model.boolean1 = false;
                      _model.radioSelected = _model.radioSelected ==
                              _model.radioItem3Model.valueString
                          ? 'none'
                          : _model.radioItem3Model.valueString;
                      _model.boolean2 = false;
                      _model.boolean3 = !_model.boolean3;
                      _model.boolean4 = false;
                      _model.boolean5 = false;
                      _model.boolean6 = false;
                      _model.updatePage(() {});
                    },
                    child: wrapWithModel(
                      model: _model.radioItem3Model,
                      updateCallback: () => safeSetState(() {}),
                      updateOnChange: true,
                      child: RadioItemWidget(
                        value: 'Reseller',
                        currentSelection: _model.radioSelected,
                        isSelected: _model.boolean3,
                      ),
                    ),
                  ),
                  InkWell(
                    splashColor: Colors.transparent,
                    focusColor: Colors.transparent,
                    hoverColor: Colors.transparent,
                    highlightColor: Colors.transparent,
                    onTap: () async {
                      _model.radioSelected = '';
                      safeSetState(() {});
                      _model.boolean1 = false;
                      _model.radioSelected = _model.radioSelected ==
                              _model.radioItem4Model.valueString
                          ? 'none'
                          : _model.radioItem4Model.valueString;
                      _model.boolean2 = false;
                      _model.boolean3 = false;
                      _model.boolean4 = !_model.boolean4;
                      _model.boolean5 = false;
                      _model.boolean6 = false;
                      _model.updatePage(() {});
                    },
                    child: wrapWithModel(
                      model: _model.radioItem4Model,
                      updateCallback: () => safeSetState(() {}),
                      updateOnChange: true,
                      child: RadioItemWidget(
                        value: 'Partership',
                        currentSelection: _model.radioSelected,
                        isSelected: _model.boolean4,
                      ),
                    ),
                  ),
                  InkWell(
                    splashColor: Colors.transparent,
                    focusColor: Colors.transparent,
                    hoverColor: Colors.transparent,
                    highlightColor: Colors.transparent,
                    onTap: () async {
                      _model.radioSelected = '';
                      safeSetState(() {});
                      _model.boolean1 = false;
                      _model.radioSelected = _model.radioSelected ==
                              _model.radioItem5Model.valueString
                          ? 'none'
                          : _model.radioItem5Model.valueString;
                      _model.boolean2 = false;
                      _model.boolean3 = false;
                      _model.boolean4 = !_model.boolean4;
                      _model.boolean5 = false;
                      _model.boolean6 = false;
                      _model.updatePage(() {});
                    },
                    child: wrapWithModel(
                      model: _model.radioItem5Model,
                      updateCallback: () => safeSetState(() {}),
                      updateOnChange: true,
                      child: RadioItemWidget(
                        value: 'Investment',
                        currentSelection: _model.radioSelected,
                        isSelected: _model.boolean5,
                      ),
                    ),
                  ),
                  InkWell(
                    splashColor: Colors.transparent,
                    focusColor: Colors.transparent,
                    hoverColor: Colors.transparent,
                    highlightColor: Colors.transparent,
                    onTap: () async {
                      _model.radioSelected = '';
                      safeSetState(() {});
                      _model.boolean1 = false;
                      _model.radioSelected = _model.radioSelected ==
                              _model.radioItem6Model.valueString
                          ? 'none'
                          : _model.radioItem6Model.valueString;
                      _model.boolean2 = false;
                      _model.boolean3 = false;
                      _model.boolean4 = false;
                      _model.boolean5 = false;
                      _model.boolean6 = !_model.boolean6;
                      _model.updatePage(() {});
                    },
                    child: wrapWithModel(
                      model: _model.radioItem6Model,
                      updateCallback: () => safeSetState(() {}),
                      updateOnChange: true,
                      child: RadioItemWidget(
                        currentSelection: _model.radioSelected,
                        isSelected: _model.boolean6,
                      ),
                    ),
                  ),
                ],
              ),
            ),
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
                        onTap: () async {
                          _model.radioSelected = '';
                          safeSetState(() {});
                        },
                        child: RadioItemWidget(
                          key: Key('Keyibp_${radiosIndex}_of_${radios.length}'),
                          value: radiosItem.valueProperty,
                          currentSelection: _model.radioSelected,
                          isSelected: false,
                        ),
                      );
                    }),
                  );
                },
              ),
            ),
            Text(
              valueOrDefault<String>(
                _model.radioSelected,
                'selecyed',
              ),
              style: FlutterFlowTheme.of(context).bodyMedium.override(
                    fontFamily: FlutterFlowTheme.of(context).bodyMediumFamily,
                    letterSpacing: 0.0,
                    useGoogleFonts:
                        !FlutterFlowTheme.of(context).bodyMediumIsCustom,
                  ),
            ),
          ],
        ),
      ),
    );
  }
}
