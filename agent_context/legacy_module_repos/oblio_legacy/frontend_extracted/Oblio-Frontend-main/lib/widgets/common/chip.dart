import 'package:flutter/material.dart';
import 'package:oblio/widgets/common/pipeline.dart';

class oblioChip extends StatelessWidget {
  final double percent;
  final String stage;
  const oblioChip({Key? key, required this.percent, required this.stage})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Chip(
      visualDensity: VisualDensity(vertical: -4),
      materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
      padding: const EdgeInsets.only(left: 10.0, right: 10.0),
      backgroundColor: Pipeline.colours[stage]?['background'],
      label: Text('${percent.toString()}% $stage',
          style: TextStyle(
              fontFamily: 'Poppins',
              fontStyle: FontStyle.normal,
              fontWeight: FontWeight.w500,
              fontSize: 13,
              color: Pipeline.colours[stage]?['foreground'])),
    );
  }
}
