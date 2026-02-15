import 'package:flutter/material.dart';

class AuthenticationLogo extends StatelessWidget {
  const AuthenticationLogo({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(top: 25, bottom: 15),
      child: Image(
          height: 50,
          image: AssetImage('lib/assets/logo/1.0x/Oblio-Login.png')),
    );
  }
}
