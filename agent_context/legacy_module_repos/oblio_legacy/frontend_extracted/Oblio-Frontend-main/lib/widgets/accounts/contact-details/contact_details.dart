import 'package:flutter/material.dart';
import 'package:oblio/widget-models/details_tile.dart';

class ContactDetails extends StatelessWidget {
  const ContactDetails({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.only(top: 20, left: 20, right: 20),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.start,
        children: [
          DetailsTile(
              icon: Container(
                child: Icon(
                  Icons.call,
                  size: 25,
                  color: Colors.grey[600],
                ),
              ),
              title: 'Work Phone',
              content: '+1 844-622-8144'),
          Padding(
            padding: const EdgeInsets.only(left: 20, bottom: 14, top: 14),
            child: Divider(
              thickness: 1,
              color: Color.fromARGB(255, 211, 211, 211),
            ),
          ),
          DetailsTile(
            icon: Container(
              child: Icon(
                Icons.email,
                size: 25,
                color: Colors.grey[600],
              ),
            ),
            title: 'Work Email',
            content: 'g.dillon@acmeticketing.com',
          ),
          Padding(
            padding: const EdgeInsets.only(left: 20, bottom: 14, top: 14),
            child: Divider(
              thickness: 1,
              color: Color.fromARGB(255, 211, 211, 211),
            ),
          ),
          DetailsTile(
            icon: Container(
              child: Icon(
                Icons.chat,
                size: 25,
                color: Colors.grey[600],
              ),
            ),
            title: 'Skype',
            content: 'gdillon9',
          ),
          Padding(
            padding: const EdgeInsets.only(left: 20, bottom: 0, top: 14),
            child: Divider(
              thickness: 1,
              color: Color.fromARGB(255, 211, 211, 211),
            ),
          ),
        ],
      ),
    );
  }
}
