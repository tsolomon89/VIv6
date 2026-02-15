import 'package:flutter/material.dart';
import 'package:oblio/widgets/accounts/common/common_title.dart';
import 'package:oblio/widgets/accounts/technographics/technographics_details.dart';

class TechnographicsDetailsWidets extends StatefulWidget {
  const TechnographicsDetailsWidets({Key? key}) : super(key: key);

  @override
  State<TechnographicsDetailsWidets> createState() =>
      _TechnographicsDetailsWidetsState();
}

class _TechnographicsDetailsWidetsState
    extends State<TechnographicsDetailsWidets> {
  @override
  Widget build(BuildContext context) {
    return IntrinsicHeight(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [TechnographicsDetails()],
      ),
    );
  }
}
