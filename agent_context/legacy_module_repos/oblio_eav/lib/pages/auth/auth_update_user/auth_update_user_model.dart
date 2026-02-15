import '/flutter_flow/flutter_flow_util.dart';
import '/pages/auth/components/auth_background/auth_background_widget.dart';
import 'auth_update_user_widget.dart' show AuthUpdateUserWidget;
import 'package:flutter/material.dart';

class AuthUpdateUserModel extends FlutterFlowModel<AuthUpdateUserWidget> {
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
