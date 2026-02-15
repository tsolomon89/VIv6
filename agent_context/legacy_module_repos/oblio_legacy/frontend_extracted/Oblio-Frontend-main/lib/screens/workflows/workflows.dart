import 'package:flutter/material.dart';

class WorkflowsScreen extends StatefulWidget {
  const WorkflowsScreen({Key? key}) : super(key: key);

  @override
  _WorkflowsScreenState createState() => _WorkflowsScreenState();
}

class _WorkflowsScreenState extends State<WorkflowsScreen> {
  @override
  Widget build(BuildContext context) {
    return ScrollConfiguration(
      behavior: ScrollConfiguration.of(context).copyWith(scrollbars: false),
      child: Flexible(
        flex: 1,
        child: SingleChildScrollView(
            child: Center(
          child: Text('Workflows Screen'),
        )),
      ),
    );
  }
}
