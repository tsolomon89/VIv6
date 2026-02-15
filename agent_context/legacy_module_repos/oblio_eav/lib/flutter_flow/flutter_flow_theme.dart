// ignore_for_file: overridden_fields, annotate_overrides

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import 'package:shared_preferences/shared_preferences.dart';

const kThemeModeKey = '__theme_mode__';

SharedPreferences? _prefs;

enum DeviceSize {
  mobile,
  tablet,
  desktop,
}

abstract class FlutterFlowTheme {
  static DeviceSize deviceSize = DeviceSize.mobile;

  static Future initialize() async =>
      _prefs = await SharedPreferences.getInstance();

  static ThemeMode get themeMode {
    final darkMode = _prefs?.getBool(kThemeModeKey);
    return darkMode == null
        ? ThemeMode.system
        : darkMode
            ? ThemeMode.dark
            : ThemeMode.light;
  }

  static void saveThemeMode(ThemeMode mode) => mode == ThemeMode.system
      ? _prefs?.remove(kThemeModeKey)
      : _prefs?.setBool(kThemeModeKey, mode == ThemeMode.dark);

  static FlutterFlowTheme of(BuildContext context) {
    deviceSize = getDeviceSize(context);
    return Theme.of(context).brightness == Brightness.dark
        ? DarkModeTheme()
        : LightModeTheme();
  }

  @Deprecated('Use primary instead')
  Color get primaryColor => primary;
  @Deprecated('Use secondary instead')
  Color get secondaryColor => secondary;
  @Deprecated('Use tertiary instead')
  Color get tertiaryColor => tertiary;

  late Color primary;
  late Color secondary;
  late Color tertiary;
  late Color alternate;
  late Color primaryText;
  late Color secondaryText;
  late Color primaryBackground;
  late Color secondaryBackground;
  late Color accent1;
  late Color accent2;
  late Color accent3;
  late Color accent4;
  late Color success;
  late Color warning;
  late Color error;
  late Color info;

  late Color dlButton;
  late Color background;
  late Color foreground;
  late Color navtext;
  late Color subtitle;
  late Color navLabel;
  late Color fieldBackground;
  late Color customColor1;
  late Color purple400;
  late Color purple800;
  late Color pink400;
  late Color pink800;
  late Color teal400;
  late Color teal800;
  late Color divider1;
  late Color fade;

  @Deprecated('Use displaySmallFamily instead')
  String get title1Family => displaySmallFamily;
  @Deprecated('Use displaySmall instead')
  TextStyle get title1 => typography.displaySmall;
  @Deprecated('Use headlineMediumFamily instead')
  String get title2Family => typography.headlineMediumFamily;
  @Deprecated('Use headlineMedium instead')
  TextStyle get title2 => typography.headlineMedium;
  @Deprecated('Use headlineSmallFamily instead')
  String get title3Family => typography.headlineSmallFamily;
  @Deprecated('Use headlineSmall instead')
  TextStyle get title3 => typography.headlineSmall;
  @Deprecated('Use titleMediumFamily instead')
  String get subtitle1Family => typography.titleMediumFamily;
  @Deprecated('Use titleMedium instead')
  TextStyle get subtitle1 => typography.titleMedium;
  @Deprecated('Use titleSmallFamily instead')
  String get subtitle2Family => typography.titleSmallFamily;
  @Deprecated('Use titleSmall instead')
  TextStyle get subtitle2 => typography.titleSmall;
  @Deprecated('Use bodyMediumFamily instead')
  String get bodyText1Family => typography.bodyMediumFamily;
  @Deprecated('Use bodyMedium instead')
  TextStyle get bodyText1 => typography.bodyMedium;
  @Deprecated('Use bodySmallFamily instead')
  String get bodyText2Family => typography.bodySmallFamily;
  @Deprecated('Use bodySmall instead')
  TextStyle get bodyText2 => typography.bodySmall;

  String get displayLargeFamily => typography.displayLargeFamily;
  bool get displayLargeIsCustom => typography.displayLargeIsCustom;
  TextStyle get displayLarge => typography.displayLarge;
  String get displayMediumFamily => typography.displayMediumFamily;
  bool get displayMediumIsCustom => typography.displayMediumIsCustom;
  TextStyle get displayMedium => typography.displayMedium;
  String get displaySmallFamily => typography.displaySmallFamily;
  bool get displaySmallIsCustom => typography.displaySmallIsCustom;
  TextStyle get displaySmall => typography.displaySmall;
  String get headlineLargeFamily => typography.headlineLargeFamily;
  bool get headlineLargeIsCustom => typography.headlineLargeIsCustom;
  TextStyle get headlineLarge => typography.headlineLarge;
  String get headlineMediumFamily => typography.headlineMediumFamily;
  bool get headlineMediumIsCustom => typography.headlineMediumIsCustom;
  TextStyle get headlineMedium => typography.headlineMedium;
  String get headlineSmallFamily => typography.headlineSmallFamily;
  bool get headlineSmallIsCustom => typography.headlineSmallIsCustom;
  TextStyle get headlineSmall => typography.headlineSmall;
  String get titleLargeFamily => typography.titleLargeFamily;
  bool get titleLargeIsCustom => typography.titleLargeIsCustom;
  TextStyle get titleLarge => typography.titleLarge;
  String get titleMediumFamily => typography.titleMediumFamily;
  bool get titleMediumIsCustom => typography.titleMediumIsCustom;
  TextStyle get titleMedium => typography.titleMedium;
  String get titleSmallFamily => typography.titleSmallFamily;
  bool get titleSmallIsCustom => typography.titleSmallIsCustom;
  TextStyle get titleSmall => typography.titleSmall;
  String get labelLargeFamily => typography.labelLargeFamily;
  bool get labelLargeIsCustom => typography.labelLargeIsCustom;
  TextStyle get labelLarge => typography.labelLarge;
  String get labelMediumFamily => typography.labelMediumFamily;
  bool get labelMediumIsCustom => typography.labelMediumIsCustom;
  TextStyle get labelMedium => typography.labelMedium;
  String get labelSmallFamily => typography.labelSmallFamily;
  bool get labelSmallIsCustom => typography.labelSmallIsCustom;
  TextStyle get labelSmall => typography.labelSmall;
  String get bodyLargeFamily => typography.bodyLargeFamily;
  bool get bodyLargeIsCustom => typography.bodyLargeIsCustom;
  TextStyle get bodyLarge => typography.bodyLarge;
  String get bodyMediumFamily => typography.bodyMediumFamily;
  bool get bodyMediumIsCustom => typography.bodyMediumIsCustom;
  TextStyle get bodyMedium => typography.bodyMedium;
  String get bodySmallFamily => typography.bodySmallFamily;
  bool get bodySmallIsCustom => typography.bodySmallIsCustom;
  TextStyle get bodySmall => typography.bodySmall;

  Typography get typography => {
        DeviceSize.mobile: MobileTypography(this),
        DeviceSize.tablet: TabletTypography(this),
        DeviceSize.desktop: DesktopTypography(this),
      }[deviceSize]!;
}

DeviceSize getDeviceSize(BuildContext context) {
  final width = MediaQuery.sizeOf(context).width;
  if (width < 479) {
    return DeviceSize.mobile;
  } else if (width < 991) {
    return DeviceSize.tablet;
  } else {
    return DeviceSize.desktop;
  }
}

class LightModeTheme extends FlutterFlowTheme {
  @Deprecated('Use primary instead')
  Color get primaryColor => primary;
  @Deprecated('Use secondary instead')
  Color get secondaryColor => secondary;
  @Deprecated('Use tertiary instead')
  Color get tertiaryColor => tertiary;

  late Color primary = const Color(0xFF778CE8);
  late Color secondary = const Color(0xFFFDC16D);
  late Color tertiary = const Color(0xFFFF8787);
  late Color alternate = const Color(0xFF34CA87);
  late Color primaryText = const Color(0xE642505C);
  late Color secondaryText = const Color(0xFF79828B);
  late Color primaryBackground = const Color(0xE6FCFAF3);
  late Color secondaryBackground = const Color(0xFFFFFEFE);
  late Color accent1 = const Color(0xFF435BD9);
  late Color accent2 = const Color(0xFFFDAF4C);
  late Color accent3 = const Color(0xFFFF4F4C);
  late Color accent4 = const Color(0xFF09AB55);
  late Color success = const Color(0xFF16857B);
  late Color warning = const Color(0xFFFBD633);
  late Color error = const Color(0xFFC4454D);
  late Color info = const Color(0xFFF4F4F4);

  late Color dlButton = const Color(0xFF4B2C81);
  late Color background = const Color(0xFFFCFAF3);
  late Color foreground = const Color(0xFFFFFEFE);
  late Color navtext = const Color(0xA51E1C24);
  late Color subtitle = const Color(0x981E1C24);
  late Color navLabel = const Color(0xFF838484);
  late Color fieldBackground = const Color(0xFFF4F4F4);
  late Color customColor1 = const Color(0x00A09E9E);
  late Color purple400 = const Color(0xFF863DF1);
  late Color purple800 = const Color(0xFF5E14E8);
  late Color pink400 = const Color(0xFFFB61A5);
  late Color pink800 = const Color(0xFFF82E78);
  late Color teal400 = const Color(0xFF59D8E8);
  late Color teal800 = const Color(0xFF33A79D);
  late Color divider1 = const Color(0xFF78757A);
  late Color fade = const Color(0x19FFFEFE);
}

abstract class Typography {
  String get displayLargeFamily;
  bool get displayLargeIsCustom;
  TextStyle get displayLarge;
  String get displayMediumFamily;
  bool get displayMediumIsCustom;
  TextStyle get displayMedium;
  String get displaySmallFamily;
  bool get displaySmallIsCustom;
  TextStyle get displaySmall;
  String get headlineLargeFamily;
  bool get headlineLargeIsCustom;
  TextStyle get headlineLarge;
  String get headlineMediumFamily;
  bool get headlineMediumIsCustom;
  TextStyle get headlineMedium;
  String get headlineSmallFamily;
  bool get headlineSmallIsCustom;
  TextStyle get headlineSmall;
  String get titleLargeFamily;
  bool get titleLargeIsCustom;
  TextStyle get titleLarge;
  String get titleMediumFamily;
  bool get titleMediumIsCustom;
  TextStyle get titleMedium;
  String get titleSmallFamily;
  bool get titleSmallIsCustom;
  TextStyle get titleSmall;
  String get labelLargeFamily;
  bool get labelLargeIsCustom;
  TextStyle get labelLarge;
  String get labelMediumFamily;
  bool get labelMediumIsCustom;
  TextStyle get labelMedium;
  String get labelSmallFamily;
  bool get labelSmallIsCustom;
  TextStyle get labelSmall;
  String get bodyLargeFamily;
  bool get bodyLargeIsCustom;
  TextStyle get bodyLarge;
  String get bodyMediumFamily;
  bool get bodyMediumIsCustom;
  TextStyle get bodyMedium;
  String get bodySmallFamily;
  bool get bodySmallIsCustom;
  TextStyle get bodySmall;
}

class MobileTypography extends Typography {
  MobileTypography(this.theme);

  final FlutterFlowTheme theme;

  String get displayLargeFamily => 'Poppins';
  bool get displayLargeIsCustom => false;
  TextStyle get displayLarge => GoogleFonts.poppins(
        color: theme.primaryText,
        fontWeight: FontWeight.w300,
        fontSize: 52.0,
      );
  String get displayMediumFamily => 'Poppins';
  bool get displayMediumIsCustom => false;
  TextStyle get displayMedium => GoogleFonts.poppins(
        color: theme.primaryText,
        fontWeight: FontWeight.w500,
        fontSize: 44.0,
      );
  String get displaySmallFamily => 'Poppins';
  bool get displaySmallIsCustom => false;
  TextStyle get displaySmall => GoogleFonts.poppins(
        color: theme.primaryText,
        fontWeight: FontWeight.w500,
        fontSize: 36.0,
      );
  String get headlineLargeFamily => 'Poppins';
  bool get headlineLargeIsCustom => false;
  TextStyle get headlineLarge => GoogleFonts.poppins(
        color: theme.primaryText,
        fontWeight: FontWeight.normal,
        fontSize: 32.0,
      );
  String get headlineMediumFamily => 'Poppins';
  bool get headlineMediumIsCustom => false;
  TextStyle get headlineMedium => GoogleFonts.poppins(
        color: theme.primaryText,
        fontWeight: FontWeight.normal,
        fontSize: 28.0,
      );
  String get headlineSmallFamily => 'Poppins';
  bool get headlineSmallIsCustom => false;
  TextStyle get headlineSmall => GoogleFonts.poppins(
        color: theme.primaryText,
        fontWeight: FontWeight.normal,
        fontSize: 24.0,
      );
  String get titleLargeFamily => 'Poppins';
  bool get titleLargeIsCustom => false;
  TextStyle get titleLarge => GoogleFonts.poppins(
        color: Color(0xE642505C),
        fontWeight: FontWeight.w500,
        fontSize: 24.0,
      );
  String get titleMediumFamily => 'Poppins';
  bool get titleMediumIsCustom => false;
  TextStyle get titleMedium => GoogleFonts.poppins(
        color: Color(0xE642505C),
        fontWeight: FontWeight.w500,
        fontSize: 12.0,
      );
  String get titleSmallFamily => 'Poppins';
  bool get titleSmallIsCustom => false;
  TextStyle get titleSmall => GoogleFonts.poppins(
        color: Color(0xE642505C),
        fontWeight: FontWeight.w500,
        fontSize: 11.0,
      );
  String get labelLargeFamily => 'Poppins';
  bool get labelLargeIsCustom => false;
  TextStyle get labelLarge => GoogleFonts.poppins(
        color: Color(0xFF79828B),
        fontWeight: FontWeight.w500,
        fontSize: 12.0,
      );
  String get labelMediumFamily => 'Poppins';
  bool get labelMediumIsCustom => false;
  TextStyle get labelMedium => GoogleFonts.poppins(
        color: Color(0xFF79828B),
        fontWeight: FontWeight.w500,
        fontSize: 10.0,
      );
  String get labelSmallFamily => 'Poppins';
  bool get labelSmallIsCustom => false;
  TextStyle get labelSmall => GoogleFonts.poppins(
        color: Color(0xFF79828B),
        fontWeight: FontWeight.w500,
        fontSize: 8.0,
      );
  String get bodyLargeFamily => 'Poppins';
  bool get bodyLargeIsCustom => false;
  TextStyle get bodyLarge => GoogleFonts.poppins(
        color: Color(0xFF79828B),
        fontSize: 15.0,
      );
  String get bodyMediumFamily => 'Poppins';
  bool get bodyMediumIsCustom => false;
  TextStyle get bodyMedium => GoogleFonts.poppins(
        color: Color(0xFF79828B),
        fontWeight: FontWeight.normal,
        fontSize: 11.0,
      );
  String get bodySmallFamily => 'Poppins';
  bool get bodySmallIsCustom => false;
  TextStyle get bodySmall => GoogleFonts.poppins(
        color: Color(0xFF79828B),
        fontWeight: FontWeight.normal,
        fontSize: 10.0,
      );
}

class TabletTypography extends Typography {
  TabletTypography(this.theme);

  final FlutterFlowTheme theme;

  String get displayLargeFamily => 'Poppins';
  bool get displayLargeIsCustom => false;
  TextStyle get displayLarge => GoogleFonts.poppins(
        color: theme.primaryText,
        fontWeight: FontWeight.w300,
        fontSize: 52.0,
      );
  String get displayMediumFamily => 'Poppins';
  bool get displayMediumIsCustom => false;
  TextStyle get displayMedium => GoogleFonts.poppins(
        color: theme.primaryText,
        fontWeight: FontWeight.w500,
        fontSize: 44.0,
      );
  String get displaySmallFamily => 'Poppins';
  bool get displaySmallIsCustom => false;
  TextStyle get displaySmall => GoogleFonts.poppins(
        color: theme.primaryText,
        fontWeight: FontWeight.w500,
        fontSize: 36.0,
      );
  String get headlineLargeFamily => 'Poppins';
  bool get headlineLargeIsCustom => false;
  TextStyle get headlineLarge => GoogleFonts.poppins(
        color: theme.primaryText,
        fontWeight: FontWeight.normal,
        fontSize: 32.0,
      );
  String get headlineMediumFamily => 'Poppins';
  bool get headlineMediumIsCustom => false;
  TextStyle get headlineMedium => GoogleFonts.poppins(
        color: theme.primaryText,
        fontWeight: FontWeight.normal,
        fontSize: 28.0,
      );
  String get headlineSmallFamily => 'Poppins';
  bool get headlineSmallIsCustom => false;
  TextStyle get headlineSmall => GoogleFonts.poppins(
        color: theme.primaryText,
        fontWeight: FontWeight.normal,
        fontSize: 24.0,
      );
  String get titleLargeFamily => 'Roboto';
  bool get titleLargeIsCustom => false;
  TextStyle get titleLarge => GoogleFonts.roboto(
        color: theme.primaryText,
        fontWeight: FontWeight.w500,
        fontSize: 22.0,
      );
  String get titleMediumFamily => 'Roboto';
  bool get titleMediumIsCustom => false;
  TextStyle get titleMedium => GoogleFonts.roboto(
        color: Color(0xE642505C),
        fontWeight: FontWeight.w500,
        fontSize: 12.0,
      );
  String get titleSmallFamily => 'Roboto';
  bool get titleSmallIsCustom => false;
  TextStyle get titleSmall => GoogleFonts.roboto(
        color: theme.info,
        fontWeight: FontWeight.w500,
        fontSize: 16.0,
      );
  String get labelLargeFamily => 'Roboto';
  bool get labelLargeIsCustom => false;
  TextStyle get labelLarge => GoogleFonts.roboto(
        color: theme.secondaryText,
        fontWeight: FontWeight.w500,
        fontSize: 16.0,
      );
  String get labelMediumFamily => 'Roboto';
  bool get labelMediumIsCustom => false;
  TextStyle get labelMedium => GoogleFonts.roboto(
        color: Color(0xFF79828B),
        fontWeight: FontWeight.w500,
        fontSize: 10.0,
      );
  String get labelSmallFamily => 'Roboto';
  bool get labelSmallIsCustom => false;
  TextStyle get labelSmall => GoogleFonts.roboto(
        color: theme.secondaryText,
        fontWeight: FontWeight.w500,
        fontSize: 12.0,
      );
  String get bodyLargeFamily => 'Roboto';
  bool get bodyLargeIsCustom => false;
  TextStyle get bodyLarge => GoogleFonts.roboto(
        color: theme.primaryText,
        fontSize: 16.0,
      );
  String get bodyMediumFamily => 'Roboto';
  bool get bodyMediumIsCustom => false;
  TextStyle get bodyMedium => GoogleFonts.roboto(
        color: Color(0x981E1C24),
        fontWeight: FontWeight.normal,
        fontSize: 12.0,
      );
  String get bodySmallFamily => 'Roboto';
  bool get bodySmallIsCustom => false;
  TextStyle get bodySmall => GoogleFonts.roboto(
        color: theme.primaryText,
        fontWeight: FontWeight.normal,
        fontSize: 12.0,
      );
}

class DesktopTypography extends Typography {
  DesktopTypography(this.theme);

  final FlutterFlowTheme theme;

  String get displayLargeFamily => 'Poppins';
  bool get displayLargeIsCustom => false;
  TextStyle get displayLarge => GoogleFonts.poppins(
        color: theme.primaryText,
        fontWeight: FontWeight.w300,
        fontSize: 52.0,
      );
  String get displayMediumFamily => 'Poppins';
  bool get displayMediumIsCustom => false;
  TextStyle get displayMedium => GoogleFonts.poppins(
        color: theme.primaryText,
        fontWeight: FontWeight.w500,
        fontSize: 44.0,
      );
  String get displaySmallFamily => 'Poppins';
  bool get displaySmallIsCustom => false;
  TextStyle get displaySmall => GoogleFonts.poppins(
        color: theme.primaryText,
        fontWeight: FontWeight.w500,
        fontSize: 36.0,
      );
  String get headlineLargeFamily => 'Poppins';
  bool get headlineLargeIsCustom => false;
  TextStyle get headlineLarge => GoogleFonts.poppins(
        color: theme.primaryText,
        fontWeight: FontWeight.normal,
        fontSize: 32.0,
      );
  String get headlineMediumFamily => 'Poppins';
  bool get headlineMediumIsCustom => false;
  TextStyle get headlineMedium => GoogleFonts.poppins(
        color: theme.primaryText,
        fontWeight: FontWeight.normal,
        fontSize: 28.0,
      );
  String get headlineSmallFamily => 'Poppins';
  bool get headlineSmallIsCustom => false;
  TextStyle get headlineSmall => GoogleFonts.poppins(
        color: theme.primaryText,
        fontWeight: FontWeight.normal,
        fontSize: 24.0,
      );
  String get titleLargeFamily => 'Roboto';
  bool get titleLargeIsCustom => false;
  TextStyle get titleLarge => GoogleFonts.roboto(
        color: theme.primaryText,
        fontWeight: FontWeight.w500,
        fontSize: 22.0,
      );
  String get titleMediumFamily => 'Roboto';
  bool get titleMediumIsCustom => false;
  TextStyle get titleMedium => GoogleFonts.roboto(
        color: Color(0xE642505C),
        fontWeight: FontWeight.w500,
        fontSize: 12.0,
      );
  String get titleSmallFamily => 'Roboto';
  bool get titleSmallIsCustom => false;
  TextStyle get titleSmall => GoogleFonts.roboto(
        color: theme.info,
        fontWeight: FontWeight.w500,
        fontSize: 16.0,
      );
  String get labelLargeFamily => 'Roboto';
  bool get labelLargeIsCustom => false;
  TextStyle get labelLarge => GoogleFonts.roboto(
        color: theme.secondaryText,
        fontWeight: FontWeight.w500,
        fontSize: 16.0,
      );
  String get labelMediumFamily => 'Roboto';
  bool get labelMediumIsCustom => false;
  TextStyle get labelMedium => GoogleFonts.roboto(
        color: Color(0xFF79828B),
        fontWeight: FontWeight.w500,
        fontSize: 10.0,
      );
  String get labelSmallFamily => 'Roboto';
  bool get labelSmallIsCustom => false;
  TextStyle get labelSmall => GoogleFonts.roboto(
        color: theme.secondaryText,
        fontWeight: FontWeight.w500,
        fontSize: 12.0,
      );
  String get bodyLargeFamily => 'Roboto';
  bool get bodyLargeIsCustom => false;
  TextStyle get bodyLarge => GoogleFonts.roboto(
        color: theme.primaryText,
        fontSize: 16.0,
      );
  String get bodyMediumFamily => 'Roboto';
  bool get bodyMediumIsCustom => false;
  TextStyle get bodyMedium => GoogleFonts.roboto(
        color: Color(0x981E1C24),
        fontWeight: FontWeight.normal,
        fontSize: 12.0,
      );
  String get bodySmallFamily => 'Roboto';
  bool get bodySmallIsCustom => false;
  TextStyle get bodySmall => GoogleFonts.roboto(
        color: theme.primaryText,
        fontWeight: FontWeight.normal,
        fontSize: 12.0,
      );
}

class DarkModeTheme extends FlutterFlowTheme {
  @Deprecated('Use primary instead')
  Color get primaryColor => primary;
  @Deprecated('Use secondary instead')
  Color get secondaryColor => secondary;
  @Deprecated('Use tertiary instead')
  Color get tertiaryColor => tertiary;

  late Color primary = const Color(0xFF778CE8);
  late Color secondary = const Color(0xFFFDC16D);
  late Color tertiary = const Color(0xFFFF8787);
  late Color alternate = const Color(0xFF34CA87);
  late Color primaryText = const Color(0xFFFCFAF3);
  late Color secondaryText = const Color(0xFFFFFEFE);
  late Color primaryBackground = const Color(0xE50B120B);
  late Color secondaryBackground = const Color(0xFF292B29);
  late Color accent1 = const Color(0xFF435BD9);
  late Color accent2 = const Color(0xFFFDAF4C);
  late Color accent3 = const Color(0xFFFF4F4C);
  late Color accent4 = const Color(0xFF09AB55);
  late Color success = const Color(0xFF16857B);
  late Color warning = const Color(0xFFFBD633);
  late Color error = const Color(0xFFC4454D);
  late Color info = const Color(0xFFF4F4F4);

  late Color dlButton = const Color(0xFFE8C7A3);
  late Color background = const Color(0xFF0B120B);
  late Color foreground = const Color(0xFF292B29);
  late Color navtext = const Color(0xEFFFFFFF);
  late Color subtitle = const Color(0xF8FFFFFF);
  late Color navLabel = const Color(0xFFC7C6C6);
  late Color fieldBackground = const Color(0xFFF4F4F4);
  late Color customColor1 = const Color(0x81FFFFFF);
  late Color purple400 = const Color(0xFF863DF1);
  late Color purple800 = const Color(0xFF5E14E8);
  late Color pink400 = const Color(0xFFFB61A5);
  late Color pink800 = const Color(0xFFF82E78);
  late Color teal400 = const Color(0xFF59D8E8);
  late Color teal800 = const Color(0xFF33A79D);
  late Color divider1 = const Color(0xFF1220B5);
  late Color fade = const Color(0x19292B29);
}

extension TextStyleHelper on TextStyle {
  TextStyle override({
    TextStyle? font,
    String? fontFamily,
    Color? color,
    double? fontSize,
    FontWeight? fontWeight,
    double? letterSpacing,
    FontStyle? fontStyle,
    bool useGoogleFonts = false,
    TextDecoration? decoration,
    double? lineHeight,
    List<Shadow>? shadows,
    String? package,
  }) {
    if (useGoogleFonts && fontFamily != null) {
      font = GoogleFonts.getFont(fontFamily,
          fontWeight: fontWeight ?? this.fontWeight,
          fontStyle: fontStyle ?? this.fontStyle);
    }

    return font != null
        ? font.copyWith(
            color: color ?? this.color,
            fontSize: fontSize ?? this.fontSize,
            letterSpacing: letterSpacing ?? this.letterSpacing,
            fontWeight: fontWeight ?? this.fontWeight,
            fontStyle: fontStyle ?? this.fontStyle,
            decoration: decoration,
            height: lineHeight,
            shadows: shadows,
          )
        : copyWith(
            fontFamily: fontFamily,
            package: package,
            color: color,
            fontSize: fontSize,
            letterSpacing: letterSpacing,
            fontWeight: fontWeight,
            fontStyle: fontStyle,
            decoration: decoration,
            height: lineHeight,
            shadows: shadows,
          );
  }
}
