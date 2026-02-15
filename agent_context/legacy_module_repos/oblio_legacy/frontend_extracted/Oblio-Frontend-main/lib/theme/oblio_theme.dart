import 'package:flutter/material.dart';
import './colors.dart';

final ThemeData oblioTheme = ThemeData(
  brightness: Brightness.light,
  primaryColor: CompanyColors.red[500],
  primaryColorLight: CompanyColors.primary[500],
  primaryColorDark: CompanyColors.font_primary[500],
  canvasColor: CompanyColors.primary[500],
  scaffoldBackgroundColor: CompanyColors.secondary[500],
  bottomAppBarColor: CompanyColors.font_secondary[100],
  cardColor: CompanyColors.primary[50],
  dividerColor: CompanyColors.font_secondary[2],
  splashColor: Colors.transparent,
  highlightColor: Colors.transparent,
  // hoverColor: Colors.transparent,
  selectedRowColor: CompanyColors.font_secondary[87],
  unselectedWidgetColor: CompanyColors.font_secondary[87],
  disabledColor: CompanyColors.font_secondary[87],
  toggleableActiveColor: CompanyColors.font_secondary[87],
  secondaryHeaderColor: CompanyColors.font_secondary[87],
  backgroundColor: CompanyColors.primary[500],
  dialogBackgroundColor: CompanyColors.font_secondary[87],
  indicatorColor: CompanyColors.font_secondary[87],
  hintColor: CompanyColors.font_secondary[87],
  errorColor: CompanyColors.font_secondary[87],
  textSelectionTheme: TextSelectionThemeData(
    cursorColor: CompanyColors.red[500],
  ),

  // Button Theme
  textButtonTheme: TextButtonThemeData(
    style: ButtonStyle(
        overlayColor: MaterialStateProperty.resolveWith(
            (states) => CompanyColors.primary[50]),
        textStyle: MaterialStateProperty.all(
          TextStyle(
            fontSize: 14,
            fontFamily: 'Poppins',
            fontWeight: FontWeight.normal,
            color: CompanyColors.font_primary[100],
          ),
        ),
        side: MaterialStateProperty.resolveWith(
          (states) => BorderSide(
              color: CompanyColors.font_primary[50]!,
              width: 1,
              style: BorderStyle.solid),
        ),
        backgroundColor: MaterialStateProperty.resolveWith(
            (states) => CompanyColors.primary[50]),
        splashFactory: NoSplash.splashFactory),
  ),

  //button theme
  elevatedButtonTheme: ElevatedButtonThemeData(
    style: ButtonStyle(
        elevation: MaterialStateProperty.resolveWith((states) => 0),
        textStyle: MaterialStateProperty.all(
          TextStyle(
            fontSize: 14,
            fontFamily: 'Poppins',
            fontWeight: FontWeight.normal,
            color: CompanyColors.font_primary[100],
          ),
        ),
        backgroundColor: MaterialStateProperty.resolveWith(
            (states) => CompanyColors.red[500]),
        splashFactory: NoSplash.splashFactory),
  ),
  //button theme
  outlinedButtonTheme: OutlinedButtonThemeData(
    style: ButtonStyle(
        elevation: MaterialStateProperty.resolveWith((states) => 0),
        textStyle: MaterialStateProperty.all(
          TextStyle(
            fontSize: 14,
            fontFamily: 'Poppins',
            fontWeight: FontWeight.normal,
            color: CompanyColors.font_primary[100],
          ),
        ),
        shape: MaterialStateProperty.all<RoundedRectangleBorder>(
            RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(50.0),
        )),
        backgroundColor: MaterialStateProperty.resolveWith((states) =>
            Color.fromRGBO(255, 130, 130, 1)), // CompanyColors.red[500]
        splashFactory: NoSplash.splashFactory),
  ),
  // Fab Button Theme
  floatingActionButtonTheme: FloatingActionButtonThemeData(
      backgroundColor: Colors.white,
      focusColor: Colors.transparent,
      hoverColor: Colors.transparent,
      splashColor: Colors.transparent),

  // Divider Theme
  dividerTheme: DividerThemeData(
      color: Color.fromARGB(255, 231, 230, 230), thickness: 1.5),

  //Text Theme
  textTheme: TextTheme(
    headline1: TextStyle(
        color: Color(0xFF42505C),
        fontStyle: FontStyle.normal,
        fontSize: 16.0,
        fontWeight: FontWeight.w500,
        fontFamily: "Poppins"),
    headline2: TextStyle(
        color: CompanyColors.font_primary[87],
        fontSize: 20.0,
        fontWeight: FontWeight.w500,
        fontFamily: "Poppins"),
    headline3: TextStyle(
        color: CompanyColors.font_primary[101],
        fontSize: 22.0,
        fontWeight: FontWeight.w500,
        fontFamily: "Poppins"),
    headline4: TextStyle(
      color: CompanyColors.font_primary[60],
      fontSize: 13,
      fontFamily: "Poppins",
      fontWeight: FontWeight.w500,
      fontStyle: FontStyle.normal,
    ),
    headline5: TextStyle(
      color: CompanyColors.font_secondary[87],
      fontSize: 16,
      fontWeight: FontWeight.normal,
      fontStyle: FontStyle.normal,
    ),
    headline6: TextStyle(
      color: CompanyColors.font_primary[80],
      fontSize: 40,
      fontWeight: FontWeight.bold,
      fontStyle: FontStyle.normal,
    ),
    subtitle1: TextStyle(
      color: CompanyColors.font_primary[40],
      fontSize: 16,
      fontFamily: 'Poppins',
      fontWeight: FontWeight.w500,
      fontStyle: FontStyle.normal,
    ),
    subtitle2: TextStyle(
      color: CompanyColors.font_primary[60],
      fontSize: 11,
      fontFamily: "Poppins",
      fontWeight: FontWeight.w500,
      fontStyle: FontStyle.normal,
    ),
    caption: TextStyle(
      color: CompanyColors.font_primary[60],
      fontSize: 11,
      fontFamily: "Poppins",
      fontWeight: FontWeight.w400,
      fontStyle: FontStyle.normal,
    ),
    button: TextStyle(
      color: CompanyColors.font_primary[85],
      fontSize: 13,
      fontFamily: 'Poppins',
      letterSpacing: 0.2,
      fontWeight: FontWeight.w500,
      fontStyle: FontStyle.normal,
    ),
    overline: TextStyle(
      color: CompanyColors.font_primary[60],
      fontSize: 12,
      letterSpacing: 0.2,
      fontFamily: 'Poppins',
      fontWeight: FontWeight.w500,
      fontStyle: FontStyle.normal,
    ),
  ),

  // primary text theme
  primaryTextTheme: TextTheme(
    headline1: TextStyle(
        color: CompanyColors.font_primary[87],
        fontSize: 30.0,
        fontWeight: FontWeight.normal,
        fontFamily: "Poppins"),
    headline2: TextStyle(
      color: CompanyColors.font_primary[65],
      fontSize: 13,
      fontFamily: "Poppins",
      fontWeight: FontWeight.w500,
      fontStyle: FontStyle.normal,
    ),
    headline3: TextStyle(
        color: CompanyColors.font_primary[101],
        fontSize: 16.0,
        fontWeight: FontWeight.w500,
        fontStyle: FontStyle.normal,
        fontFamily: "Poppins"),
    headline4: TextStyle(
      color: CompanyColors.font_primary[60],
      fontSize: 14,
      fontFamily: "Poppins",
      fontWeight: FontWeight.w500,
      fontStyle: FontStyle.normal,
    ),
    headline5: TextStyle(
      color: CompanyColors.font_secondary[50],
      fontSize: 14,
      fontWeight: FontWeight.w500,
      fontStyle: FontStyle.normal,
      fontFamily: "Poppins",
    ),
    headline6: TextStyle(
      color: CompanyColors.font_secondary[85],
      fontSize: 12,
      fontWeight: FontWeight.w500,
      fontStyle: FontStyle.normal,
      fontFamily: "Poppins",
    ),
    subtitle1: TextStyle(
      color: CompanyColors.font_primary[60],
      fontSize: 17,
      fontFamily: "Poppins",
      fontWeight: FontWeight.normal,
      fontStyle: FontStyle.normal,
    ),
    subtitle2: TextStyle(
      color: CompanyColors.font_primary[102],
      fontSize: 17,
      fontFamily: 'Poppins',
      fontWeight: FontWeight.w500,
      fontStyle: FontStyle.normal,
    ),
    caption: TextStyle(
      color: CompanyColors.secondary[50],
      fontSize: 11,
      fontFamily: "Poppins",
      fontWeight: FontWeight.w400,
      fontStyle: FontStyle.normal,
    ),
    button: TextStyle(
      color: CompanyColors.primary[50],
      fontSize: 14,
      fontFamily: 'Poppins',
      fontWeight: FontWeight.w500,
      fontStyle: FontStyle.normal,
    ),
    overline: TextStyle(
      color: CompanyColors.primary[50],
      fontSize: 12,
      letterSpacing: 0.2,
      fontFamily: 'Poppins',
      fontWeight: FontWeight.w500,
      fontStyle: FontStyle.normal,
    ),
  ),

  //input theme
  inputDecorationTheme: InputDecorationTheme(
    labelStyle: TextStyle(
        color: CompanyColors.font_primary[60],
        fontSize: 14,
        fontWeight: FontWeight.w500,
        fontStyle: FontStyle.normal,
        fontFamily: "Poppins"),
    filled: true,
    fillColor: CompanyColors.secondary[50],
    border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(5),
        borderSide: BorderSide(
            color: CompanyColors.font_primary[50]!,
            width: 1,
            style: BorderStyle.solid)),
    focusedErrorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(5),
        borderSide: BorderSide(
            color: CompanyColors.font_primary[50]!,
            width: 1,
            style: BorderStyle.solid)),
    focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(5),
        borderSide: BorderSide(
            color: CompanyColors.font_primary[50]!,
            width: 1,
            style: BorderStyle.solid)),
    enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(5),
        borderSide: BorderSide(
            color: CompanyColors.font_primary[50]!,
            width: 1,
            style: BorderStyle.solid)),
    errorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(5),
        borderSide: BorderSide(
            color: CompanyColors.red[500]!,
            width: 1,
            style: BorderStyle.solid)),
    contentPadding: EdgeInsets.all(10),
    errorStyle: TextStyle(
        backgroundColor: CompanyColors.secondary[50],
        color: CompanyColors.red[500]!,
        fontSize: 12,
        fontFamily: 'Poppins',
        fontWeight: FontWeight.w300),
  ),

  // checkbox theme

  checkboxTheme: CheckboxThemeData(
      fillColor:
          MaterialStateColor.resolveWith((states) => CompanyColors.red[500]!),
      side: BorderSide(
          color: CompanyColors.red[500]!, width: 1, style: BorderStyle.solid)),

  // icon theme
  iconTheme: IconThemeData(
    color: CompanyColors.font_secondary[54],
    opacity: 1,
    size: 24,
  ),
  primaryIconTheme: IconThemeData(
    color: CompanyColors.font_secondary[54],
    opacity: 1,
    size: 24,
  ),

  sliderTheme: SliderThemeData(
    activeTrackColor: null,
    inactiveTrackColor: null,
    disabledActiveTrackColor: null,
    disabledInactiveTrackColor: null,
    activeTickMarkColor: null,
    inactiveTickMarkColor: null,
    disabledActiveTickMarkColor: null,
    disabledInactiveTickMarkColor: null,
    thumbColor: null,
    disabledThumbColor: null,
    overlayColor: null,
    valueIndicatorColor: null,
    showValueIndicator: null,
    valueIndicatorTextStyle: TextStyle(
      color: CompanyColors.font_primary[50],
      fontSize: null,
      fontWeight: FontWeight.w400,
      fontStyle: FontStyle.normal,
    ),
  ),
  tabBarTheme: TabBarTheme(
    indicatorSize: TabBarIndicatorSize.tab,
    labelColor: CompanyColors.font_primary[100],
    unselectedLabelColor: CompanyColors.font_primary[54],
  ),
  chipTheme: ChipThemeData(
    backgroundColor: Color.fromARGB(255, 243, 243, 243),
    brightness: Brightness.light,
    deleteIconColor: CompanyColors.primary[50],
    disabledColor: CompanyColors.primary[50]!,
    labelPadding: EdgeInsets.fromLTRB(00.0, 0.0, 00.0, 0.0),
    labelStyle: TextStyle(
      color: CompanyColors.font_primary[38],
      fontSize: 14,
      fontWeight: FontWeight.normal,
      fontStyle: FontStyle.normal,
    ),
    padding: EdgeInsets.fromLTRB(15.0, 8.0, 15.0, 8.0),
    secondaryLabelStyle: TextStyle(
      color: Color(0x3d6100ED),
      fontSize: 14,
      fontWeight: FontWeight.normal,
      fontStyle: FontStyle.normal,
    ),
    secondarySelectedColor: Color(0x3d2196f3),
    selectedColor: Color(0xddD6C4F9),
    shape: StadiumBorder(
        side: BorderSide(
      color: CompanyColors.primary[50]!,
      width: 0,
      style: BorderStyle.none,
    )),
  ),
  dialogTheme: DialogTheme(
      shape: RoundedRectangleBorder(
    side: BorderSide(
      color: CompanyColors.primary[50]!,
      width: 0,
      style: BorderStyle.none,
    ),
    borderRadius: BorderRadius.all(Radius.circular(0.0)),
  )),
  cardTheme: CardTheme(
    color: CompanyColors.primary[50],
    shadowColor: Colors.transparent,
  ),
);
