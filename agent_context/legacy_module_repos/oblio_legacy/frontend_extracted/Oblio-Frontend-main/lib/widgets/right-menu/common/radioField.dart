import 'package:flutter/material.dart';

class RadioField extends StatefulWidget {
  /// List of items to display as radio buttons
  final List<String> values;

  const RadioField({
    Key? key,
    required this.values,
  }) : super(key: key);

  @override
  State<RadioField> createState() => _RadioFieldState();
}

class _RadioFieldState extends State<RadioField> {
  String? selected = '';

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: widget.values.length > 5 ? 30.0 : 20.0,
      runSpacing: 10,
      alignment: WrapAlignment.center,
      crossAxisAlignment: WrapCrossAlignment.center,
      runAlignment: WrapAlignment.spaceEvenly,
      children: [
        for (var item in widget.values)
          Container(
            width: 70,
            child: Column(
              children: [
                Radio(
                  activeColor: Color.fromRGBO(255, 83, 83, 1),
                  overlayColor: MaterialStateColor.resolveWith(
                      (states) => Color.fromARGB(8, 0, 0, 0)),
                  value: item,
                  groupValue: selected,
                  onChanged: (String? value) {
                    setState(() {
                      selected = value;
                    });
                  },
                ),
                Text(item)
              ],
            ),
          )
      ],
    );
  }
}
