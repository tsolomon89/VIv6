import 'package:flutter/material.dart';
import 'package:oblio/widgets/accounts/common/common_title.dart';
import 'package:oblio/widgets/accounts/contact-details/contact_details.dart';

class ContactDetailsWidets extends StatefulWidget {
  const ContactDetailsWidets({Key? key}) : super(key: key);

  @override
  State<ContactDetailsWidets> createState() => _ContactDetailsWidetsState();
}

class _ContactDetailsWidetsState extends State<ContactDetailsWidets> {
  @override
  Widget build(BuildContext context) {
    return IntrinsicHeight(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [ContactDetails()],
      ),
    );
  }
}
