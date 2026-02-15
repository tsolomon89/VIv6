import 'package:flutter/material.dart';
import 'dart:ui';

import 'package:oblio/stop_rebuild.dart';

class WidgetShadow extends StatelessWidget {
  final Widget child;
  final Offset childOffset;

  final double opacity;
  final double spread;
  final double blurRad;
  final double borderRad;

  const WidgetShadow({
    Key? key,
    required this.child,
    this.childOffset = const Offset(0.0, 1.0),
    this.blurRad = 1.0,
    this.borderRad = 0.0,
    this.opacity = 1.0,
    this.spread = 1.0,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    const ColorFilter greyscale = ColorFilter.matrix(<double>[
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      1,
      0,
    ]);

    return ClipRRect(
      child: Stack(
        children: [
          Transform.translate(
            offset: childOffset,
            child: ClipRRect(
              borderRadius: BorderRadius.circular(borderRad),
              child: Opacity(
                opacity: opacity,
                //TODO: Disable animations for this child!
                child: ColorFiltered(colorFilter: greyscale, child: child),
              ),
            ),
          ),
          Positioned.fill(
            child: BackdropFilter(
              filter: ImageFilter.blur(
                sigmaX: blurRad,
                sigmaY: blurRad,
              ),
              child: Container(color: Colors.transparent),
            ),
          ),
          ClipRRect(
            borderRadius: BorderRadius.circular(borderRad),
            child: child,
          ),
        ],
      ),
    );
  }
}
