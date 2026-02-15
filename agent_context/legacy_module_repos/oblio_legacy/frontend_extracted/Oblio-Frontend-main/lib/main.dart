import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:oblio/app.dart';
import 'package:oblio/routes/routes.dart';
import 'package:oblio/state/state_provider.dart';
import 'package:oblio/theme/oblio_theme.dart';

class OblioScroll extends MaterialScrollBehavior {
  // Override behavior methods, allowing side scrolling
  @override
  Set<PointerDeviceKind> get dragDevices => {
        PointerDeviceKind.touch,
        PointerDeviceKind.mouse,
        PointerDeviceKind.stylus,
        PointerDeviceKind.unknown
      };
}

void main() {
  runApp(
    stateProvider(
      MaterialApp(
        scrollBehavior: OblioScroll(),
        debugShowCheckedModeBanner: false,
        home: App(),
        theme: oblioTheme,
        onGenerateRoute: Routes.generateRoute,
      ),
    ),
  );
}
