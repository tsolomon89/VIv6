import 'package:flutter/material.dart';

typedef WillRebuild<WidgetType> = bool Function(
    WidgetType oldVersion, WidgetType newVersion);

class _StopRebuildState<WidgetType extends Widget> extends State<StopRebuild> {
  @override
  StopRebuild<WidgetType> get widget => super.widget as StopRebuild<WidgetType>;
  WidgetType? oldVersion;

  @override
  Widget build(BuildContext context) {
    final WidgetType newVersion = widget.child;
    if (this.oldVersion == null ||
        (widget.willRebuild == null
            ? true
            : widget.willRebuild!(oldVersion!, newVersion))) {
      this.oldVersion = newVersion;
    }
    return oldVersion as WidgetType;
  }
}

class StopRebuild<WidgetType extends Widget> extends StatefulWidget {
  StopRebuild({required this.child, this.willRebuild});

  final WidgetType child;
  final WillRebuild<WidgetType>? willRebuild;

  @override
  _StopRebuildState createState() => _StopRebuildState<WidgetType>();
}
