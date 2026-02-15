import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:oblio/state/contact-attribution/contact_attribution.dart';
import 'package:oblio/widgets/accounts/attribution/contact_attribution_navigator.dart';
import 'package:oblio/widgets/accounts/attribution/contact_attribution_top.dart';

class ContactAttributionExpansionList extends StatelessWidget {
  const ContactAttributionExpansionList({Key? key}) : super(key: key);

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

    return BlocBuilder<ContactAttributionCubit, bool>(
      builder: (context, ownedState) {
        action() => ownedState == false
            ? context.read<ContactAttributionCubit>().show()
            : context.read<ContactAttributionCubit>().hide();
        title() => ownedState == false ? 'Expand' : 'Collapse';
        expansion() => ownedState == false ? 620.0 : 720.0;
        return Column(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              height: expansion(),
              child: ListView(
                shrinkWrap: true,
                children: [
                  ContactAttrributionTop(),
                  ContactAttributionNavigator()
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
