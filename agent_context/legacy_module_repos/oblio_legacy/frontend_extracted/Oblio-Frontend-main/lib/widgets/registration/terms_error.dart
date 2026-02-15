import 'package:flutter/material.dart';
import 'package:oblio/widget-models/alert_model.dart';

class TermsError extends StatelessWidget {
  const TermsError({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return AlertModel(
      padding: EdgeInsets.all(10),
      data: 'Please Accept Terms and Conditions!',
      height: 200,
      width: 300,
    );
  }
}
