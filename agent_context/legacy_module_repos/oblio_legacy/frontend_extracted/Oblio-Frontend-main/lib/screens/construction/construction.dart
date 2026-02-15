import 'package:flutter/material.dart';
import 'package:lottie/lottie.dart';

class Construction extends StatelessWidget {
  const Construction({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Flexible(
      flex: 1,
      child: Column(
        children: [
          Container(
              width: 700,
              height: 500,
              child: Lottie.asset('lib/assets/animations/construction.json',
                  height: 900, fit: BoxFit.cover)),
          Container(
            margin: EdgeInsets.only(top: 60),
            child: Text(
              'Currently under construction 🧭',
              style: TextStyle(
                  fontSize: 30,
                  color: Color.fromARGB(255, 92, 92, 92),
                  fontFamily: 'Poppins',
                  fontStyle: FontStyle.normal,
                  fontWeight: FontWeight.w600),
            ),
          )
        ],
      ),
    );
  }
}
