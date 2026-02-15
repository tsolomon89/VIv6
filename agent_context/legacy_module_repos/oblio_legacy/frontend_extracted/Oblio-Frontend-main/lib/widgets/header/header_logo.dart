import 'package:flutter/material.dart';

class HomeLogo extends StatelessWidget {
  const HomeLogo({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    var device = MediaQuery.of(context).size;
    var width = device.width;
    height() => width < 500 ? 35.0 : 40.0;
    return Container(
      alignment: Alignment.center,
      width: 100,
      child: Image(
        height: height(),
        filterQuality: FilterQuality.high,
        image: AssetImage('lib/assets/logo/1.0x/Oblio-Header.png'),
      ),
    );
  }
}
