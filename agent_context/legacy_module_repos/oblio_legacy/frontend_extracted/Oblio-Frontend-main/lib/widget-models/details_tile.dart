import 'package:flutter/material.dart';
import 'package:oblio/theme/oblioTheme.dart';
import 'package:oblio/theme/oblio_theme.dart';

class DetailsTile extends StatelessWidget {
  final Widget icon;
  final String title;
  final String? content;
  final String? underline;
  final bool? checkbox;
  const DetailsTile(
      {Key? key,
      required this.icon,
      required this.title,
      this.checkbox,
      this.content,
      this.underline})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.start,
        children: [
          if (checkbox != null) SizedBox(width: 15),
          if (checkbox != null)
            Theme(
                data: Theme.of(context).copyWith(
                  unselectedWidgetColor: Colors.white,
                  toggleableActiveColor: Color.fromRGBO(98, 113, 210, 1),
                ),
                child: Checkbox(
                    activeColor: Color.fromRGBO(98, 113, 210, 1),
                    value: checkbox,
                    onChanged: (value) {})),
          icon,
          if (checkbox != null) SizedBox(width: 10),
          if (checkbox == null) SizedBox(width: 20),
          Container(
            padding: EdgeInsets.only(top: checkbox != null ? 10 : 0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.start,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title.toUpperCase(), style: Typeface.tileHeader),
                SizedBox(height: 5),
                if (content != null)
                  Text(content!, style: Typeface.tileSubtitle),
                if (underline != null) SizedBox(height: 5),
                if (underline != null)
                  Text(underline!, style: Typeface.tileBody),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
