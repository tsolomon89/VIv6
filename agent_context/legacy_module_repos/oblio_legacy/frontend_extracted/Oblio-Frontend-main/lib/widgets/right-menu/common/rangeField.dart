import 'package:flutter/material.dart';
import 'package:oblio/widgets/right-menu/common/inputField.dart';

class RangeField extends StatelessWidget {
  /// Hint text shown on the left field
  final String leftHint;

  /// Hint text shown on the right field
  final String rightHint;

  const RangeField({Key? key, required this.leftHint, required this.rightHint})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    double inputWidth = 80.0;

    return Row(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        Container(
            width: inputWidth,
            child: InputField(hint: 'start', isMinimal: true, isDense: true)),
        Padding(
          padding: const EdgeInsets.only(left: 12.0, right: 12.0),
          child: Text(
            'to',
            style: TextStyle(
                fontFamily: 'Poppins',
                fontSize: 13,
                color: Color.fromARGB(255, 116, 116, 116),
                fontWeight: FontWeight.w400),
          ),
        ),
        Container(
            width: inputWidth,
            child: InputField(hint: 'present', isMinimal: true, isDense: true))
      ],
    );
  }
}
