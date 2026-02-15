import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:oblio/state/account-related-contacts/acc-related-contacts.dart';
import 'package:oblio/widgets/accounts/related/related_accounts_tile.dart';

class RelatedAccountExpansionList extends StatelessWidget {
  const RelatedAccountExpansionList({Key? key}) : super(key: key);

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

    return BlocBuilder<AccRelatedContactsCubit, bool>(
      builder: (context, ownedState) {
        action() => ownedState == false
            ? context.read<AccRelatedContactsCubit>().show()
            : context.read<AccRelatedContactsCubit>().hide();
        title() => ownedState == false ? 'Expand' : 'Collapse';
        expansion() => ownedState == false ? 300.0 : 400.0;
        return Expanded(
          child: Column(
            children: [
              Expanded(
                child: ListView(
                  children: [
                    RelatedAccountsTile(
                      type: 'Primary Contact'.toUpperCase(),
                      title: 'Connor Sinclair',
                      image: 'lib/assets/images/1.0x/avatar0.png',
                    ),
                    RelatedAccountsTile(
                      type: 'Primary Decision Maker'.toUpperCase(),
                      title: 'Jason Sinclair',
                      image: 'lib/assets/images/1.0x/avatar1.png',
                    ),
                    RelatedAccountsTile(
                      type: 'Primary End User'.toUpperCase(),
                      title: 'Jane Sinclair',
                      image: 'lib/assets/images/1.0x/avatar2.png',
                    ),
                    RelatedAccountsTile(
                      type: 'Primary Billing'.toUpperCase(),
                      title: 'Rina Sinclair',
                      image: 'lib/assets/images/1.0x/avatar3.png',
                    ),
                    RelatedAccountsTile(
                      type: 'Primary Contact'.toUpperCase(),
                      title: 'Connor Sinclair',
                      image: 'lib/assets/images/1.0x/avatar0.png',
                    ),
                    RelatedAccountsTile(
                      type: 'Primary Decision Maker'.toUpperCase(),
                      title: 'Jason Sinclair',
                      image: 'lib/assets/images/1.0x/avatar1.png',
                    ),
                    RelatedAccountsTile(
                      type: 'Primary End User'.toUpperCase(),
                      title: 'Jane Sinclair',
                      image: 'lib/assets/images/1.0x/avatar2.png',
                    ),
                    RelatedAccountsTile(
                      type: 'Primary Billing'.toUpperCase(),
                      title: 'Rina Sinclair',
                      image: 'lib/assets/images/1.0x/avatar3.png',
                    ),
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
          ),
        );
      },
    );
  }
}
