import 'package:flutter/material.dart';
import 'package:oblio/objects.dart';
import 'package:oblio/screens/authentication/authentication_screen.dart';
import 'package:oblio/screens/calendar/calendar.dart';
import 'package:oblio/screens/campaigns/campaigns.dart';
import 'package:oblio/screens/contacts/contacts.dart';
import 'package:oblio/screens/creatives/creatives.dart';
import 'package:oblio/screens/employees/employees.dart';
import 'package:oblio/screens/main/main.dart';
import 'package:oblio/screens/opportunities/opportunities.dart';
import 'package:oblio/screens/organizations/organizations.dart';
import 'package:oblio/screens/products/products.dart';
import 'package:oblio/screens/registration/registration_screen.dart';
import 'package:oblio/screens/reset/reset.dart';
import 'package:oblio/screens/teams/teams.dart';
import 'package:oblio/screens/todos/todos.dart';
import 'package:oblio/screens/workflows/workflows.dart';
import 'package:page_transition/page_transition.dart';

const String AuthenticationRoute = '/authentication';
const String RegistrationRoute = '/registration';
const String ResetpasswordRoute = '/reset-password';
const String HomeRoute = '/dashboard';
const String CalendarRoute = '/calendar';
const String CampaignsRoute = '/campaigns';
const String ContactsRoute = '/contacts';
const String CreativesRoute = '/creatives';
const String AccountsRoute = '/accounts';
const String OpportunitiesRoute = '/opportunities';
const String OrganizationsRoute = '/organizations';
const String ProductsRoute = '/products';
const String TeamsRoute = '/teams';
const String TodosRoute = '/todos';
const String WorkflowsRoute = '/workflows';
const String EmployeesRoute = '/employees';

class Routes {
  static Route<dynamic> generateRoute(RouteSettings settings) {
    // TODO: check if the user is authenticated!

    return PageTransition(
      child: MainScreen(route: settings.name!),
      type: PageTransitionType.fade,
      settings: settings,
      duration: const Duration(milliseconds: 50),
    );
  }
}
