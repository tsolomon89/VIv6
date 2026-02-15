import 'package:flutter/material.dart';

class TodosScreen extends StatefulWidget {
  const TodosScreen({Key? key}) : super(key: key);

  @override
  _TodosScreenState createState() => _TodosScreenState();
}

class _TodosScreenState extends State<TodosScreen> {
  @override
  Widget build(BuildContext context) {
    return ScrollConfiguration(
      behavior: ScrollConfiguration.of(context).copyWith(scrollbars: false),
      child: Flexible(
        flex: 1,
        child: SingleChildScrollView(
            child: Center(
          child: Text('Todos Screen'),
        )),
      ),
    );
  }
}
