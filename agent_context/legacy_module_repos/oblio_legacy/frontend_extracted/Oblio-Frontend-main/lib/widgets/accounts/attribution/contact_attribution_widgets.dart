import 'package:flutter/material.dart';
import 'package:oblio/widgets/accounts/attribution/contact_attribution_expansion_list.dart';
import 'package:oblio/widgets/accounts/common/common_title.dart';

import '../../home/common/long-card.dart';

class ContactAttributionWidgets extends StatefulWidget {
  const ContactAttributionWidgets({Key? key}) : super(key: key);

  @override
  State<ContactAttributionWidgets> createState() =>
      _ContactAttributionWidgetsState();
}

class _ContactAttributionWidgetsState extends State<ContactAttributionWidgets> {
  @override
  Widget build(BuildContext context) {
    return LongCard(
      title: 'CONTACT ATTRIBUTION',
      onPress: () => {},
      expanded: true,
      child: IntrinsicHeight(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.start,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [ContactAttributionExpansionList()],
        ),
      ),
    );
  }
}
