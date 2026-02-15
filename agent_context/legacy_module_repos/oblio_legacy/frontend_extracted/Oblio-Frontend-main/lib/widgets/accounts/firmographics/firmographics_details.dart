import 'package:flutter/material.dart';
import 'package:oblio/widget-models/details_tile.dart';

class FirmographicsDetails extends StatelessWidget {
  const FirmographicsDetails({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.only(left: 0, top: 10, right: 20),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.start,
        children: [
          DetailsTile(
            icon: Container(),
            title: 'IBM CORPORATION • OPERATIONS'.toUpperCase(),
            content: 'Head of Operations',
            underline: '05/05/20 • 25/05/20',
          ),
          Padding(
            padding: const EdgeInsets.only(left: 20, bottom: 14, top: 14),
            child: Divider(
              thickness: 1,
              color: Color.fromARGB(255, 211, 211, 211),
            ),
          ),
          DetailsTile(
            icon: Container(),
            title: 'IBM CORPORATION • OPERATIONS'.toUpperCase(),
            content: 'Head of Operations',
            underline: '05/05/20 • 25/05/20',
          ),
          Padding(
            padding: const EdgeInsets.only(left: 20, bottom: 14, top: 14),
            child: Divider(
              thickness: 1,
              color: Color.fromARGB(255, 211, 211, 211),
            ),
          ),
          DetailsTile(
            icon: Container(),
            title: 'IBM CORPORATION • OPERATIONS'.toUpperCase(),
            content: 'Head of Operations',
            underline: '05/05/20 • 25/05/20',
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
