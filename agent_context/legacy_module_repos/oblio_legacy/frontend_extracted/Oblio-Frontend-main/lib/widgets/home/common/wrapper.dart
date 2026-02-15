import 'package:flutter/material.dart';

class Wrapper extends InheritedWidget {
  const Wrapper({
    Key? key,
    required this.parentKey,
    required Widget child,
  }) : super(key: key, child: child);

  final Key parentKey;

  static Wrapper of(BuildContext context) {
    final Wrapper? result =
        context.dependOnInheritedWidgetOfExactType<Wrapper>();
    assert(result != null, 'No expansion found in context');
    return result!;
  }

  @override
  bool updateShouldNotify(Wrapper old) => parentKey != old.parentKey;
}
