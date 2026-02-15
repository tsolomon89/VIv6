import 'package:flutter/material.dart';
import 'package:hexcolor/hexcolor.dart';
import 'package:oblio/widget-models/card_model.dart';

class AccountStats extends StatelessWidget {
  final Widget child;
  const AccountStats({Key? key, required this.child}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return CardModel(
      height: 200,
      width: 350,
      decoration: BoxDecoration(
        color: HexColor('#5F78E4'),
        borderRadius: BorderRadius.all(
          Radius.circular(10),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.blueGrey.withOpacity(0.1),
            spreadRadius: 2,
            blurRadius: 5,
            offset: Offset(0, 1),
          ),
        ],
      ),
      child: child,
    );
  }
}
