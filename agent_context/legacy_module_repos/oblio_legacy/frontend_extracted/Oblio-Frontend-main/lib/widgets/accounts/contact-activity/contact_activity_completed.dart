import 'package:flutter/material.dart';
import 'package:oblio/widgets/accounts/contact-activity/contact_activity_tile.dart';

class ContactActivityCompleted extends StatelessWidget {
  const ContactActivityCompleted({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        ContactActivityTile(
          type: '',
          title: 'Task Title',
          image: 'lib/assets/images/1.0x/avatar0.png',
        ),
        ContactActivityTile(
          type: '',
          title: 'Task Title',
          image: 'lib/assets/images/1.0x/avatar1.png',
        ),
        ContactActivityTile(
          type: '',
          title: 'Task Title',
          image: 'lib/assets/images/1.0x/avatar2.png',
        ),
        ContactActivityTile(
          type: '',
          title: 'Task Title',
          image: 'lib/assets/images/1.0x/avatar0.png',
        ),
      ],
    );
  }
}
