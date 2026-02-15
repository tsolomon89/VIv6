import 'package:flutter/material.dart';
import 'package:universal_html/html.dart' as html;
import './webUI/mobileUI.dart' if (dart.library.html) './webUI/webUI.dart'
    as ui;

class Loading extends StatefulWidget {
  const Loading({Key? key}) : super(key: key);

  @override
  State<Loading> createState() => _LoadingState();
}

class _LoadingState extends State<Loading> {
  @override
  void initState() {
    // ignore: undefined_prefixed_name
    ui.platformViewRegistry.registerViewFactory(
        'test-view-type',
        (int viewId) => html.IFrameElement()
          ..src = "/loader.html"
          ..style.border = 'none');

    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return HtmlElementView(viewType: 'test-view-type');
  }
}
