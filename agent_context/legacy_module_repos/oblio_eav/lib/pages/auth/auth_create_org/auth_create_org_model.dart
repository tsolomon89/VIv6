import '/flutter_flow/flutter_flow_util.dart';
import '/pages/auth/components/auth_background/auth_background_widget.dart';
import 'auth_create_org_widget.dart' show AuthCreateOrgWidget;
import 'package:flutter/material.dart';

class AuthCreateOrgModel extends FlutterFlowModel<AuthCreateOrgWidget> {
  ///  State fields for stateful widgets in this page.

  // Model for authBackground component.
  late AuthBackgroundModel authBackgroundModel;

  @override
  void initState(BuildContext context) {
    authBackgroundModel = createModel(context, () => AuthBackgroundModel());
  }

  @override
  void dispose() {
    authBackgroundModel.dispose();
  }
}
