import 'package:flutter/material.dart';
import 'package:oblio/theme/oblio_theme.dart';
import '../../../theme/colors.dart';
import 'common_subtitle.dart';
import 'common_title.dart';

class LongCard extends StatefulWidget {
  final Widget child;
  final bool expanded;
  final String title;
  final VoidCallback onPress;
  final String? subtitle;
  final List<String>? dropdownValues;

  const LongCard(
      {Key? key,
      required this.child,
      required this.expanded,
      required this.title,
      required this.onPress,
      this.dropdownValues,
      this.subtitle})
      : super(key: key);

  @override
  _LongCardState createState() => _LongCardState();
}

class _LongCardState extends State<LongCard> {
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
    //RowWrapper.of(context).expandList[0] = true;
    //RowWrapper.of(context).expandList[widget.child.toString()] = false;
    title() => widget.expanded ? 'COLLAPSE' : 'EXPAND';

    return Container(
      //width: responsiveWidth(),
      decoration: BoxDecoration(
        color: oblioTheme.cardColor,
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
          CommonTitle(title: widget.title),
          SizedBox(height: 7),
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
          SizedBox(height: 5),
          widget.child,
          const Divider(
            height: 1,
            thickness: 1,
            indent: 0,
            endIndent: 0,
            color: Color.fromARGB(255, 223, 223, 223),
          ),
          Container(
            height: 50,
            //width: responsiveWidth(),
            child: InkWell(
              hoverColor: Colors.transparent,
              onTap: widget.onPress,
              child: Container(
                margin: const EdgeInsets.only(left: 15),
                alignment: Alignment.centerLeft,
                child: Text(
                  title(),
                  style: TextStyle(
                      fontFamily: 'Poppins',
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                      color: Color.fromRGBO(98, 113, 210, 1)),
                ),
              ),
            ),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.only(
                bottomLeft: Radius.circular(10),
                bottomRight: Radius.circular(10),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
