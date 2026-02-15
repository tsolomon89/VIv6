import 'package:flutter/material.dart';

class InputField extends StatefulWidget {
  /// Hint text shown inside of Oblio's input field
  final String hint;

  /// Background colour for the input field
  final Color? fillColor;

  /// Default: false; Smaller sized input field, with an underline
  /// and a transparent background.
  final bool isMinimal;

  /// Reduces the overall height of the input field
  final bool isDense;

  /// Explanation for input value underneath the input field
  final String? description;

  /// If a list value is given, the input field is searchable
  final List<String>? searchData;

  const InputField(
      {Key? key,
      required this.hint,
      this.description,
      this.fillColor,
      this.isMinimal = false,
      this.isDense = false,
      this.searchData})
      : super(key: key);

  @override
  State<InputField> createState() => _InputFieldState();
}

class _InputFieldState extends State<InputField> {
  List<String> selected = [];
  TextEditingController textController = new TextEditingController();
  List<String> filtered = [];

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        TextFormField(
            controller: textController,
            onChanged: (value) {
              if (widget.searchData != null)
                setState(() {
                  filtered = widget.searchData!
                      .where((element) =>
                          element.toLowerCase().contains(value.toLowerCase()))
                      .toList();
                });
            },
            style: TextStyle(
                fontSize: 14.0,
                fontFamily: 'Poppins',
                fontStyle: FontStyle.normal,
                fontWeight: FontWeight.w400,
                color: Colors.black),
            decoration: InputDecoration(
              isDense: widget.isDense,
              contentPadding: widget.searchData != null
                  ? EdgeInsets.only(top: 13, bottom: 10)
                  : widget.isDense
                      ? EdgeInsets.only(top: 10, bottom: 10)
                      : widget.isMinimal
                          ? EdgeInsets.only(top: 13)
                          : null,
              prefixIcon: widget.searchData != null
                  ? Icon(Icons.search, size: 19)
                  : null,
              border: InputBorder.none,
              focusedBorder: widget.isMinimal
                  ? UnderlineInputBorder(
                      borderSide:
                          BorderSide(color: Color.fromARGB(255, 189, 189, 189)),
                    )
                  : InputBorder.none,
              enabledBorder: widget.isMinimal
                  ? UnderlineInputBorder(
                      borderSide:
                          BorderSide(color: Color.fromARGB(255, 189, 189, 189)),
                    )
                  : InputBorder.none,
              errorBorder: InputBorder.none,
              disabledBorder: InputBorder.none,
              fillColor: widget.isMinimal
                  ? Colors.transparent
                  : widget.fillColor != null
                      ? widget.fillColor
                      : Color.fromRGBO(244, 243, 243, 1),
              hintText: widget.searchData != null
                  ? 'Search ' + widget.hint
                  : widget.hint,
              hintStyle: widget.isMinimal ? TextStyle(fontSize: 13) : null,
            )),
        if (widget.description != null)
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
          ),
        SizedBox(height: 5),
        if (widget.searchData != null && textController.text != '')
          Row(
            children: [
              for (var item in filtered)
                Container(
                  margin: EdgeInsets.only(right: 5),
                  child: InkWell(
                    onTap: () {
                      setState(() {
                        selected.add(item);
                        textController.value = TextEditingValue.empty;
                      });
                    },
                    child: Container(
                        padding: EdgeInsets.all(10),
                        decoration: BoxDecoration(
                            borderRadius: BorderRadius.all(Radius.circular(5)),
                            border: Border.all(
                                color: Color.fromARGB(255, 175, 175, 175),
                                width: 2)),
                        child: Text(item)),
                  ),
                ),
            ],
          ),
        SizedBox(height: 3),
        if (widget.searchData != null)
          for (var item in selected)
            Chip(
                label: Text(
              item,
              style: TextStyle(
                  fontFamily: 'Poppins',
                  fontStyle: FontStyle.normal,
                  color: Color.fromARGB(255, 80, 80, 80)),
            ))
      ],
    );
  }
}
