import 'package:flutter/material.dart';

class CreativesScreen extends StatefulWidget {
  const CreativesScreen({Key? key}) : super(key: key);

  @override
  _CreativesScreenState createState() => _CreativesScreenState();
}

class _CreativesScreenState extends State<CreativesScreen> {
  @override
  Widget build(BuildContext context) {
    return ScrollConfiguration(
      behavior: ScrollConfiguration.of(context).copyWith(scrollbars: false),
      child: Flexible(
        flex: 1,
        child: SingleChildScrollView(
            child: Center(
          child: Text('Creatives Screen'),
        )),
      ),
    );
  }
}
