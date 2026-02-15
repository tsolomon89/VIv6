import 'package:flutter/material.dart';
import 'dart:math' as math;

import 'package:hexcolor/hexcolor.dart';

class ScheduledArc extends StatefulWidget {
  final HexColor completeColor;
  final double completePercent;
  ScheduledArc(
      {Key? key, required this.completeColor, required this.completePercent})
      : super(key: key);

  @override
  _ScheduledArcState createState() => _ScheduledArcState();
}

class _ScheduledArcState extends State<ScheduledArc>
    with SingleTickerProviderStateMixin {
  AnimationController? animationController;
  CurvedAnimation? curve;

  var completeValue = Tween<double>(
    begin: 0,
    end: 100,
  );

  @override
  void initState() {
    super.initState();

    animationController = AnimationController(
      vsync: this,
      duration: Duration(seconds: 3),
    );

    curve = CurvedAnimation(parent: animationController!, curve: Curves.linear);
  }

  @override
  void dispose() {
    animationController!.dispose();

    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.start,
      crossAxisAlignment: CrossAxisAlignment.center,
      children: <Widget>[
        SizedBox(
          height: 240,
          width: 200,
          child: AnimatedBuilder(
            animation: animationController!,
            builder: (context, child) {
              return CustomPaint(
                painter: ProgressPainter(
                  lineColor: Colors.grey[300]!,
                  completeColor: widget.completeColor,
                  completePercent: widget.completePercent,
                  strokeWidth: 50,
                ),
                child: Visibility(
                  visible: false,
                  child: Center(
                    child: Padding(
                      padding: EdgeInsets.all(8.0),
                      child: Text(
                        "${completeValue.evaluate(curve!).toStringAsFixed(0)}",
                        style: TextStyle(
                          fontSize: 64,
                          fontWeight: FontWeight.bold,
                          color: widget.completeColor,
                        ),
                      ),
                    ),
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }
}

class ProgressPainter extends CustomPainter {
  final Color lineColor;
  final HexColor completeColor;
  final double completePercent;
  final double strokeWidth;

  ProgressPainter({
    required this.lineColor,
    required this.completeColor,
    required this.completePercent,
    this.strokeWidth = 60,
    // ignore: unnecessary_null_comparison
  })  : assert(lineColor != null),
        // ignore: unnecessary_null_comparison
        assert(completeColor != null),
        // ignore: unnecessary_null_comparison
        assert(completePercent != null);

  @override
  void paint(Canvas canvas, Size size) {
    var center =
        size.center(Offset.zero); // Offset(size.width / 2, size.height / 2);
    var radius =
        math.min(center.dx, center.dy); // min(size.width / 2, size.height / 2);

    var rect = Rect.fromCircle(center: center, radius: 120);

    var startAngle = 1 * math.pi / 1;
    var sweepAngle = 1 * math.pi / 1;
    var sweepAngleComplete = sweepAngle * (completePercent / 100);

    var progressLine = Paint()
      ..color = lineColor
      ..strokeWidth = strokeWidth
      ..strokeCap = StrokeCap.round
      ..style = PaintingStyle.stroke;

    var completeProgressLine = Paint()
      ..color = completeColor
      ..strokeWidth = strokeWidth
      ..strokeCap = StrokeCap.round
      ..style = PaintingStyle.stroke;

    canvas.drawArc(
      rect,
      startAngle,
      sweepAngle,
      false,
      progressLine,
    );

    canvas.drawArc(
      rect,
      startAngle,
      sweepAngleComplete,
      false,
      completeProgressLine,
    );
  }

  @override
  bool shouldRepaint(CustomPainter oldDelegate) {
    final oldPainter = (oldDelegate as ProgressPainter);
    return oldPainter.lineColor != this.lineColor ||
        oldPainter.completeColor != this.completeColor ||
        oldPainter.completePercent != this.completePercent ||
        oldPainter.strokeWidth != this.strokeWidth;
  }
}
