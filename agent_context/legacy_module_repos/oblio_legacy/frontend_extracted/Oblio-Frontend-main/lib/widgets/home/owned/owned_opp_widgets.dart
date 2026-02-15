import 'package:flutter/material.dart';
import 'package:oblio/widgets/home/owned/owned_opp_expansion_list.dart';
import '../common/long-card.dart';

class OwnedOppWidets extends StatefulWidget {
  const OwnedOppWidets({Key? key}) : super(key: key);

  @override
  State<OwnedOppWidets> createState() => _OwnedOppWidetsState();
}

class _OwnedOppWidetsState extends State<OwnedOppWidets> {
  bool expanded = false;
  List<String> list = ['All Time', 'Day', 'Week', 'Month', 'Quarter', 'Year'];
  @override
  Widget build(BuildContext context) {
    return LongCard(
      title: 'OWNED OPPORTUNITIES',
      subtitle: 'SALES TEAM',
      dropdownValues: list,
      onPress: () {
        setState(() {
          expanded = !expanded;
        });
      },
      expanded: expanded,
      child: IntrinsicHeight(child: OwnedOppExpansionList(expanded: expanded)),
    );
  }
}
