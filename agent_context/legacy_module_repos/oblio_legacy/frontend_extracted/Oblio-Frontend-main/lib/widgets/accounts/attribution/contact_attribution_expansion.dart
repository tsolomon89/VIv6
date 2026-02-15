import 'package:flutter/material.dart';
import 'package:oblio/theme/oblio_theme.dart';
import 'package:oblio/widget-models/activity_avatar_expansion_tile.dart';
import 'package:oblio/widgets/accounts/common/common_avatar.dart';

class ContactActivityExpansion extends StatelessWidget {
  final Widget tags;
  final Widget title;
  final String image;
  final String type;
  final Widget tags2;
  final List<Widget> children;
  const ContactActivityExpansion(
      {Key? key,
      required this.tags,
      required this.title,
      required this.image,
      required this.type,
      required this.tags2,
      required this.children})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.start,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.only(left: 16),
          child: Text(type, style: oblioTheme.textTheme.overline),
        ),
        ActivityAvatarExpansionTileModel(
          title: Container(
            child: Row(
              mainAxisAlignment: MainAxisAlignment.start,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                AccountsCommonAvatar(
                  radius: 25,
                  image: image,
                ),
                SizedBox(width: 20),
                Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [tags, title, tags2],
                ),
              ],
            ),
          ),
          children: children,
        ),
      ],
    );
  }
}
