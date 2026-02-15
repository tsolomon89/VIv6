import 'package:flutter/material.dart';
import 'package:oblio/theme/oblio_theme.dart';
import 'package:oblio/widget-models/divider_model.dart';
import 'package:oblio/widgets/home/common/short-card.dart';
import 'package:oblio/widgets/home/stats/stats_profile_details.dart';
import 'package:oblio/widgets/home/stats/stats_ranks.dart';
import 'package:oblio/widgets/home/stats/stats_avatar.dart';
import 'package:oblio/widgets/home/stats/stats_bottom_data.dart';
import 'package:oblio/widgets/home/stats/stats_tasks.dart';
import 'package:oblio/widgets/home/stats/stats_team_chip.dart';

class StatsWidgets extends StatelessWidget {
  const StatsWidgets({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return ShortCard(
      title: 'YOUR STATS',
      child: Column(
        mainAxisAlignment: MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(height: 5),
          Padding(
            padding: EdgeInsets.only(left: 15, right: 15),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                StatsAvatar(),
                SizedBox(width: 10),
                StatsProfileDetails(),
                Expanded(child: Container()),
                StatsTeamChip(),
              ],
            ),
          ),
          Column(
            children: [
              Padding(
                padding: EdgeInsets.symmetric(horizontal: 30, vertical: 15),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [RankWidgets(), TaskWidgets()],
                ),
              ),
              Padding(
                padding: EdgeInsets.only(left: 20, right: 20),
                child: DividerModel(
                  height: 0,
                  thickness: 1,
                  color: oblioTheme.dividerTheme.color!,
                ),
              ),
              Padding(
                padding: const EdgeInsets.only(top: 13),
                child: StatsBottomData(),
              )
            ],
          )
        ],
      ),
    );
  }
}
