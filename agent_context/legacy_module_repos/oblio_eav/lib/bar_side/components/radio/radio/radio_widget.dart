import '/flutter_flow/flutter_flow_util.dart';
import 'package:flutter/material.dart';
import 'radio_model.dart';
export 'radio_model.dart';

class RadioWidget extends StatefulWidget {
  const RadioWidget({
    super.key,
    bool? isSelected,
    this.iconSelected,
    this.iconDefault,
  }) : this.isSelected = isSelected ?? false;

  final bool isSelected;
  final Widget? iconSelected;
  final Widget? iconDefault;

  @override
  State<RadioWidget> createState() => _RadioWidgetState();
}

class _RadioWidgetState extends State<RadioWidget> {
  late RadioModel _model;

  @override
  void setState(VoidCallback callback) {
    super.setState(callback);
    _model.onUpdate();
  }

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => RadioModel());

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
        width: 32.0,
        height: 32.0,
        decoration: BoxDecoration(),
        child: Align(
          alignment: AlignmentDirectional(0.0, 0.0),
          child: widget.isSelected == true
              ? widget.iconSelected!
              : widget.iconDefault!,
        ),
      ),
    );
  }
}
