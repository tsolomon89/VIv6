import 'package:flutter/material.dart';
import 'package:oblio/theme/colors.dart';
import 'package:oblio/theme/oblio_theme.dart';
import 'package:oblio/widgets/home/common/common_title.dart';

import 'common_subtitle.dart';

class ShortCard extends StatefulWidget {
  final Widget child;
  final String title;
  final String? subtitle;
  final Color? background;
  final double? height;
  final Color? textColor;
  final IconData? headerIcon;
  final List<String>? dropdownValues;

  const ShortCard(
      {Key? key,
      required this.child,
      required this.title,
      this.textColor,
      this.background,
      this.height,
      this.headerIcon,
      this.dropdownValues,
      this.subtitle})
      : super(key: key);

  @override
  State<ShortCard> createState() => _ShortCardState();
}

class _ShortCardState extends State<ShortCard> {
  late String selectedValue;

  @override
  void initState() {
    if (widget.dropdownValues != null) {
      selectedValue = widget.dropdownValues![0];
    }
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      // TODO: Might need some refactoring
      // width: responsiveWidth(),
      decoration: BoxDecoration(
        color: widget.background != null
            ? widget.background
            : oblioTheme.cardColor,
        borderRadius: BorderRadius.all(
          Radius.circular(10),
        ),
        boxShadow: [
          BoxShadow(
            color: Color.fromARGB(255, 80, 80, 80).withOpacity(0.35),
            spreadRadius: 1,
            blurRadius: 4,
            offset: Offset(0, 3),
          ),
        ],
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(crossAxisAlignment: CrossAxisAlignment.center, children: [
            if (widget.headerIcon != null)
              Container(
                padding: EdgeInsets.only(left: 20, top: 16),
                child: Icon(
                  widget.headerIcon,
                  color: Colors.white,
                  size: 20,
                ),
              ),
            CommonTitle(title: widget.title, color: widget.textColor),
          ]),
          SizedBox(
            height: 4,
          ),
          if (widget.dropdownValues != null && widget.subtitle != null)
            CommonSubtitle(
              subtitle: widget.subtitle!.toUpperCase(),
              dropdown: ButtonTheme(
                alignedDropdown: true,
                child: DropdownButton<String>(
                  isDense: true,
                  focusColor: Color.fromARGB(97, 221, 221, 221),
                  dropdownColor: Colors.white,
                  value: selectedValue,
                  elevation: 1,
                  underline: Container(color: Colors.transparent),
                  style: TextStyle(
                      fontWeight: FontWeight.w600,
                      color: CompanyColors.font_primary[102],
                      fontSize: 12),
                  onChanged: (newValue) {
                    setState(() {
                      selectedValue = newValue!;
                    });
                  },
                  items: widget.dropdownValues!
                      .map<DropdownMenuItem<String>>((value) {
                    return DropdownMenuItem<String>(
                      value: value,
                      child: Text(value),
                    );
                  }).toList(),
                ),
              ),
            ),
          Container(
              height: widget.height != null ? widget.height : 300,
              child: widget.child),
          if (widget.dropdownValues == null && widget.subtitle == null)
            SizedBox(height: 28)
        ],
      ),
    );
  }
}
