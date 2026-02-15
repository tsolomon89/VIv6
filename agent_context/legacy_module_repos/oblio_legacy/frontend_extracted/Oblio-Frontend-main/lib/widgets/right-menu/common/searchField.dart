import 'package:flutter/material.dart';

class SearchField extends StatefulWidget {
  /// List of items in search
  final List<String> values;

  const SearchField({
    Key? key,
    required this.values,
  }) : super(key: key);

  @override
  State<SearchField> createState() => _SearchFieldState();
}

class _SearchFieldState extends State<SearchField> {
  String? selected = '';

  @override
  Widget build(BuildContext context) {
    return Container();
  }
}
