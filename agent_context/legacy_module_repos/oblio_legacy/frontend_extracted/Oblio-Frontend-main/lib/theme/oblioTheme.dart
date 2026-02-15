import 'package:flutter/material.dart';

class Typeface {
  Typeface._(); // this basically makes it so you can instantiate this class

  static const calendarDay = TextStyle(
      fontFamily: 'Poppins', fontStyle: FontStyle.normal, color: Colors.grey);

  static const tileIndex = TextStyle(
      color: Color.fromARGB(255, 106, 106, 107),
      fontStyle: FontStyle.normal,
      fontFamily: "Poppins",
      fontSize: 18,
      letterSpacing: 1.0,
      fontWeight: FontWeight.w400);

  static const tileHeader = TextStyle(
      color: Color.fromRGBO(121, 130, 139, 1),
      height: 1.153,
      fontStyle: FontStyle.normal,
      fontFamily: "Poppins",
      fontSize: 12,
      letterSpacing: 1.0,
      fontWeight: FontWeight.w500);

  static const tileSubtitle = TextStyle(
      color: Color.fromRGBO(85, 97, 108, 1),
      height: 1.4,
      fontStyle: FontStyle.normal,
      fontFamily: "Poppins",
      fontSize: 14,
      fontWeight: FontWeight.w500);

  static const tileBody = TextStyle(
      color: Color.fromRGBO(120, 119, 124, 1),
      height: 1.214,
      fontStyle: FontStyle.normal,
      fontFamily: "Poppins",
      fontSize: 13,
      fontWeight: FontWeight.w500);

  static const tileActivities = TextStyle(
      color: Color.fromRGBO(99, 123, 228, 1),
      fontStyle: FontStyle.normal,
      fontFamily: "Poppins",
      fontSize: 12.5,
      fontWeight: FontWeight.w600);

  static const tilePercent = TextStyle(
      fontSize: 17,
      color: Color.fromRGBO(68, 68, 68, 1),
      fontFamily: 'Poppins',
      fontStyle: FontStyle.normal,
      fontWeight: FontWeight.w500);

  static const primaryTextButton = TextStyle(
    fontSize: 16,
    fontFamily: 'Poppins',
    fontStyle: FontStyle.normal,
    fontWeight: FontWeight.w500,
    color: Color.fromRGBO(66, 133, 244, 1),
  );

  static const secondaryTextButton = TextStyle(
      fontSize: 18,
      fontStyle: FontStyle.normal,
      fontFamily: 'Poppins',
      color: Color.fromRGBO(110, 110, 110, 1));
}
