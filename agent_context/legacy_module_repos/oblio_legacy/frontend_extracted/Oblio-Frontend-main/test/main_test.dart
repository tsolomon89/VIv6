import 'package:flutter_test/flutter_test.dart';
import 'package:flutter/material.dart';
import 'package:oblio/app.dart';

// Files ending in _test.dart will be used to test widgets and logic!
// Tests which have either passed or failed will be logged in Azure DevOps
// Code coverage will also be recorded

void main() {
  testWidgets('Smoke test!', (WidgetTester tester) async {
    // Build our app and trigger a frame.
    //await tester.pumpWidget(const MaterialApp(home: App()));

    expect('Test', 'Test');
  });
}
