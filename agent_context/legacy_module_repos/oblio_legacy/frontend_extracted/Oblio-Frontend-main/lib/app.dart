import 'package:flutter/material.dart';
import 'package:oblio/screens/authentication/authentication_screen.dart';
// import 'package:oblio/screens/home/home.dart';

class App extends StatelessWidget {
  const App({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(body: AuthenticationScreen());
  }
}
