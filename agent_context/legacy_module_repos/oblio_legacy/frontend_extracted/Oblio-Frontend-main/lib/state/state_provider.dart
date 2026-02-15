import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:oblio/state/account-opp/account_opp.dart';
import 'package:oblio/state/account-related-contacts/acc-related-contacts.dart';
import 'package:oblio/state/collapse/collapse_cubit.dart';
import 'package:oblio/state/contact-activity/contact_activity.dart';
import 'package:oblio/state/contact-attribution/contact_attribution.dart';
import 'package:oblio/state/left-menu/left_menu_cubit.dart';
import 'package:oblio/state/owned-opp/owned_opp.dart';
import 'package:oblio/state/password/password_cubit.dart';
import 'package:oblio/state/pipeline-drawer/pipeline_drawer.dart';
import 'package:oblio/state/privacy/privacy_cubit.dart';
import 'package:oblio/state/right-menu/mobile_state.dart';
import 'package:oblio/state/right-menu/right_menu_cubit.dart';
import 'package:oblio/state/right-window/right_window_cubit.dart';
import 'package:oblio/state/scheduled/scheduled_cubit.dart';
import 'package:oblio/state/terms/terms_cubit.dart';
import 'package:oblio/state/wins-opp/wins_opp.dart';

stateProvider(MaterialApp child) {
  return MultiBlocProvider(
    child: child,
    providers: [
      BlocProvider<PasswordCubit>(
        create: (BuildContext context) => PasswordCubit(),
      ),
      BlocProvider<TermsCubit>(
        create: (BuildContext context) => TermsCubit(),
      ),
      BlocProvider<PrivacyCubit>(
        create: (BuildContext context) => PrivacyCubit(),
      ),
      BlocProvider<RightMenuCubit>(
        create: (BuildContext context) => RightMenuCubit(),
      ),
      BlocProvider<RightWindowCubit>(
        create: (BuildContext context) => RightWindowCubit(),
      ),
      BlocProvider<MobileState>(
        create: (BuildContext context) => MobileState(),
      ),
      BlocProvider<LeftMenuCubit>(
        create: (BuildContext context) => LeftMenuCubit(),
      ),
      BlocProvider<CollapseCubit>(
        create: (BuildContext context) => CollapseCubit(),
      ),
      BlocProvider<ScheduledCubit>(
        create: (BuildContext context) => ScheduledCubit(),
      ),
      BlocProvider<PipelineDrawerCubit>(
        create: (BuildContext context) => PipelineDrawerCubit(),
      ),
      BlocProvider<OwnedOppCubit>(
        create: (BuildContext context) => OwnedOppCubit(),
      ),
      BlocProvider<WinsOppCubit>(
        create: (BuildContext context) => WinsOppCubit(),
      ),
      BlocProvider<AccRelatedContactsCubit>(
        create: (BuildContext context) => AccRelatedContactsCubit(),
      ),
      BlocProvider<AccountOppCubit>(
        create: (BuildContext context) => AccountOppCubit(),
      ),
      BlocProvider<ContactActivityCubit>(
        create: (BuildContext context) => ContactActivityCubit(),
      ),
      BlocProvider<ContactAttributionCubit>(
        create: (BuildContext context) => ContactAttributionCubit(),
      ),
    ],
  );
}
