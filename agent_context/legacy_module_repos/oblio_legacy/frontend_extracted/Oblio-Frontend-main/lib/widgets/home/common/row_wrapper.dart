import 'package:flutter/material.dart';

class MyWidget extends StatefulWidget {
  const MyWidget({Key? key, required this.child}) : super(key: key);
  final Widget child;

  @override
  MyState createState() => MyState();
}

class MyState extends State<MyWidget> {
  Map expandList = {
    'PipelineWidets': false,
    'WinsWidets': false,
    'OwnedOppWidets': false
  };

  void control(index) {
    setState(() {
      expandList[index] = !expandList[index];
    });
  }

  @override
  Widget build(BuildContext context) {
    return RowWrapper(
      expandList: expandList,
      child: widget.child,
    );
  }
}

class RowWrapper extends InheritedWidget {
  const RowWrapper({
    Key? key,
    required this.expandList,
    required Widget child,
  }) : super(key: key, child: child);

  final Map expandList;

  static RowWrapper of(BuildContext context) {
    final RowWrapper? result =
        context.dependOnInheritedWidgetOfExactType<RowWrapper>();
    assert(result != null, 'No row found in context');
    return result!;
  }

  @override
  bool updateShouldNotify(RowWrapper old) => expandList != old.expandList;
}
