import 'package:flutter/material.dart';
import 'package:oblio/widgets/accounts/common/common_title.dart';
import 'package:oblio/widgets/accounts/firmographics/firmographics_details.dart';

class FirmographicsDetailsWidets extends StatefulWidget {
  const FirmographicsDetailsWidets({Key? key}) : super(key: key);

  @override
  State<FirmographicsDetailsWidets> createState() =>
      _FirmographicsDetailsWidetsState();
}

class _FirmographicsDetailsWidetsState
    extends State<FirmographicsDetailsWidets> {
  @override
  Widget build(BuildContext context) {
    return IntrinsicHeight(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [SizedBox(height: 5), FirmographicsDetails()],
      ),
    );
  }
}
