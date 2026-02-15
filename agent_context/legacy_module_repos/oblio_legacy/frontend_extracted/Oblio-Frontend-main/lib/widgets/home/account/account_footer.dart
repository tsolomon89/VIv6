import 'package:flutter/material.dart';
import 'package:oblio/theme/oblio_theme.dart';
import 'package:oblio/widget-models/text_model.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../mixin.dart';

class AccountFooter extends StatelessWidget with VisitURL {
  const AccountFooter({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
        padding: EdgeInsets.only(top: 25),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            InkWell(
              onTap: () {
                visitURL('https://www.oblio.app/legal/privacy-policy/');
              },
              child: TextModel(
                data: 'Privacy Policy'.toUpperCase(),
                style: oblioTheme.textTheme.caption!,
                textAlign: TextAlign.left,
                textDirection: TextDirection.ltr,
              ),
            ),
            SizedBox(width: 10),
            InkWell(
              onTap: () {
                visitURL('https://www.oblio.app/legal/terms-of-service/');
              },
              child: TextModel(
                data: 'Terms of Service'.toUpperCase(),
                style: oblioTheme.textTheme.caption!,
                textAlign: TextAlign.left,
                textDirection: TextDirection.ltr,
              ),
            ),
          ],
        ));
  }
}
