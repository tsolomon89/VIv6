import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

class healthScore extends StatelessWidget {
  final double score;
  final int date;
  final double? size;

  const healthScore(
      {Key? key, required this.score, required this.date, this.size = 18.0})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    DateTime converted = DateTime.fromMicrosecondsSinceEpoch(date);
    var list = List<double>.generate(score.toInt(), (_) => 1.0);
    if (score - score.toInt() > 0) list.add(score - score.toInt());

    return Row(children: [
      for (var i = 0; i < 5; i++)
        Icon(Icons.favorite,
            size: size,
            color:
                Color.fromRGBO(255, 99, 99, i < list.length ? list[i] : 0.2)),
      SizedBox(width: 10),
      Text(
          DateFormat("MMMM").format(converted).substring(0, 3) +
              ' ' +
              DateFormat("d").format(converted),
          style: new TextStyle(
              color: Color.fromRGBO(132, 130, 135, 1),
              fontStyle: FontStyle.normal,
              fontFamily: "Poppins",
              fontSize: (size! - 3),
              fontWeight: FontWeight.w400))
    ]);
  }
}
