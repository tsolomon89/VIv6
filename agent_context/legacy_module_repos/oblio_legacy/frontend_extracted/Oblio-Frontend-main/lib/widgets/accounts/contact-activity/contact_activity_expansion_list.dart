import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:oblio/state/contact-activity/contact_activity.dart';
import 'package:oblio/widgets/accounts/contact-activity/contact_activity_navigator.dart';
import 'package:oblio/widgets/accounts/contact-activity/contact_activity_tile.dart';

class ContactActivityExpansionList extends StatelessWidget {
  const ContactActivityExpansionList({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    var device = MediaQuery.of(context).size;
    var width = device.width;
    responsiveWidth() {
      if (width > 1400) {
        return 350.0;
      } else if (width <= 1400 && width >= 700) {
        return 400.0;
      } else if (width < 700) {
        return 350.0;
      }
    }

    return BlocBuilder<ContactActivityCubit, bool>(
      builder: (context, ownedState) {
        action() => ownedState == false
            ? context.read<ContactActivityCubit>().show()
            : context.read<ContactActivityCubit>().hide();
        title() => ownedState == false ? 'Expand' : 'Collapse';
        expansion() => ownedState == false ? 620.0 : 720.0;
        return Column(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Container(
              height: expansion(),
              child: ListView(
                shrinkWrap: true,
                children: [
                  ContactActivityTile(
                    type: 'Last Task'.toUpperCase(),
                    title: 'Task Title',
                    image: 'lib/assets/images/1.0x/avatar0.png',
                  ),
                  ContactActivityTile(
                    type: 'Next Task'.toUpperCase(),
                    title: 'Task Title',
                    image: 'lib/assets/images/1.0x/avatar1.png',
                  ),
                  ContactActivityNavigator(),
                ],
              ),
            ),
            // Container(
            //   height: 50,
            //   width: responsiveWidth(),
            //   child: InkWell(
            //     hoverColor: Colors.transparent,
            //     onTap: () {
            //       action();
            //     },
            //     child: Center(child: Text(title())),
            //   ),
            //   decoration: BoxDecoration(
            //     color: Colors.grey[50],
            //     borderRadius: BorderRadius.only(
            //       bottomLeft: Radius.circular(10),
            //       bottomRight: Radius.circular(10),
            //     ),
            //   ),
            // ),
          ],
        );
      },
    );
  }
}
