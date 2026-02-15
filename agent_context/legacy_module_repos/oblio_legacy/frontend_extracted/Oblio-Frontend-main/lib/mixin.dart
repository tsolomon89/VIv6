import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

class OblioFunctions {
  static void visitURL(url) async {
    if (await canLaunch(url)) {
      await launch(url);
    } else {
      throw 'Could not launch $url';
    }
  }
}

mixin VisitURL on StatelessWidget {
  void visitURL(url) async {
    if (await canLaunch(url)) {
      await launch(url);
    } else {
      throw 'Could not launch $url';
    }
  }
}
