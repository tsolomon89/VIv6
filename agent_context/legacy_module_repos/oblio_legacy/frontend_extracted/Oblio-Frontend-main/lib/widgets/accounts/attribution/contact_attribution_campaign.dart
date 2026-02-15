import 'package:flutter/material.dart';
import 'package:hexcolor/hexcolor.dart';
import 'package:oblio/widgets/accounts/attribution/contact_attribution_tab_column.dart';

class ContactAttributionCampaign extends StatelessWidget {
  const ContactAttributionCampaign({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Container(
          height: 400,
          child: Center(
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                ContactAttributionTabColumn(
                  percentNum: 0.75,
                  percentText: '75',
                  color: HexColor('#5F78E4'),
                ),
                ContactAttributionTabColumn(
                  percentNum: 0.25,
                  percentText: '25',
                  color: HexColor('#FDB653'),
                ),
                ContactAttributionTabColumn(
                  percentNum: 0.4,
                  percentText: '40',
                  color: HexColor('#FF8787'),
                ),
              ],
            ),
          ),
        )
      ],
    );
  }
}
