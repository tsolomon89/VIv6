import 'package:flutter/material.dart';

class DualButton extends StatelessWidget {
  final String leftLabel;
  final String rightLabel;

  const DualButton(
      {Key? key, required this.leftLabel, required this.rightLabel})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Row(children: [
      Expanded(
        child: Container(
          height: 45,
          decoration: BoxDecoration(
              color: Colors.transparent,
              border: Border.all(color: Color.fromARGB(255, 161, 161, 161)),
              borderRadius: BorderRadius.all(Radius.circular(5))),
          child: Center(
            child: (Text(
              leftLabel,
              style: TextStyle(
                  color: Color.fromARGB(255, 121, 121, 121),
                  fontFamily: 'Poppins',
                  fontSize: 16),
            )),
          ),
        ),
      ),
      Spacer(),
      Expanded(
        child: Container(
          height: 45,
          decoration: BoxDecoration(
              color: Colors.red,
              borderRadius: BorderRadius.all(Radius.circular(5))),
          child: Center(
            child: (Text(
              rightLabel,
              style: TextStyle(
                  color: Colors.white, fontFamily: 'Poppins', fontSize: 16),
            )),
          ),
        ),
      )
    ]);
  }
}
