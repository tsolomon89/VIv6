import 'package:flutter/material.dart';
import 'package:oblio/widgets/home/stats/stats_cus_chip.dart';
import 'package:oblio/widgets/home/stats/stats_mql_chip.dart';
import 'package:oblio/widgets/home/stats/stats_num_data.dart';

class StatsBottomData extends StatelessWidget {
  const StatsBottomData({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(left: 10, right: 10),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [StatsMqlChip(), StatsCusChip(), StatsNumData()],
      ),
    );
  }
}
