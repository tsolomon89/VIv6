import 'package:flutter/material.dart';

class DropField extends StatefulWidget {
  final String hint;

  /// Background colour for the input field
  final Color? fillColor;

  /// Explanation for input value underneath the input field
  final String? description;

  /// List of items to display in dropdown
  final List<String> values;

  const DropField(
      {Key? key,
      required this.hint,
      required this.values,
      this.description,
      this.fillColor})
      : super(key: key);

  @override
  State<DropField> createState() => _DropFieldState();
}

class _DropFieldState extends State<DropField> {
  String? selected = null;
  double margin = 8.0;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          color: Color.fromRGBO(244, 243, 243, 1),
          child: Theme(
            data: Theme.of(context).copyWith(
                canvasColor: Colors.blue.shade200,
                focusColor: Color.fromARGB(255, 231, 231, 231)),
            child: DropdownButton<String>(
              isExpanded: true,
              value: selected,
              hint: Padding(
                padding: EdgeInsets.only(left: margin),
                child: Text(
                  widget.hint,
                  style: TextStyle(
                    //TODO:  Sibling: inputField.dart
                    fontSize: 14.0,
                    fontFamily: 'Poppins',
                    fontStyle: FontStyle.normal,
                    fontWeight: FontWeight.w400,
                    color: Color.fromRGBO(116, 116, 116, 1),
                  ),
                ),
              ),
              icon: Padding(
                padding: EdgeInsets.only(right: margin),
                child: const Icon(
                  Icons.arrow_drop_down,
                  color: Color.fromARGB(255, 161, 161, 161),
                ),
              ),
              dropdownColor: Colors.white,
              elevation: 16,
              style: const TextStyle(
                //TODO:  Sibling: inputField.dart
                fontSize: 14.0,
                fontFamily: 'Poppins',
                fontStyle: FontStyle.normal,
                fontWeight: FontWeight.w400,
                color: Colors.black,
              ),
              underline: Container(
                height: 0,
                color: Colors.transparent,
              ),
              onChanged: (String? newValue) {
                setState(() {
                  selected = newValue!;
                });
              },
              items:
                  widget.values.map<DropdownMenuItem<String>>((String value) {
                return DropdownMenuItem<String>(
                  value: value,
                  child: Padding(
                    padding: EdgeInsets.only(left: margin),
                    child: Text(value),
                  ),
                );
              }).toList(),
            ),
          ),
        ),
        if (widget.description != null)
          //TODO: Make this a component + inputField.dart - 77
          Container(
            padding: EdgeInsets.only(top: 5, left: 10),
            child: Text(
              widget.description!,
              style: TextStyle(
                  fontFamily: 'Poppins',
                  fontStyle: FontStyle.normal,
                  fontSize: 12,
                  color: Color.fromARGB(255, 141, 141, 141),
                  fontWeight: FontWeight.w500),
            ),
          )
      ],
    );
  }
}
