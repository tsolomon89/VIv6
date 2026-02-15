import '/flutter_flow/flutter_flow_util.dart';
import '/pages/auth/components/auth_background/auth_background_widget.dart';
import '/index.dart';
import 'auth_create_user_widget.dart' show AuthCreateUserWidget;
import 'package:flutter/material.dart';

class AuthCreateUserModel extends FlutterFlowModel<AuthCreateUserWidget> {
  ///  Local state fields for this page.

  String? emailDomain = '';

  ///  State fields for stateful widgets in this page.

  // Model for authBackground component.
  late AuthBackgroundModel authBackgroundModel;
  // State field(s) for emailAddress widget.
  FocusNode? emailAddressFocusNode;
  TextEditingController? emailAddressTextController;
  String? Function(BuildContext, String?)? emailAddressTextControllerValidator;
  // State field(s) for password widget.
  FocusNode? passwordFocusNode;
  TextEditingController? passwordTextController;
  late bool passwordVisibility;
  String? Function(BuildContext, String?)? passwordTextControllerValidator;
  // Stores action output result for [Custom Action - extractDomainFromEmail] action in Button widget.
  String? organizationDomain;

  @override
  void initState(BuildContext context) {
    authBackgroundModel = createModel(context, () => AuthBackgroundModel());
    passwordVisibility = false;
  }

  @override
  void dispose() {
    authBackgroundModel.dispose();
    emailAddressFocusNode?.dispose();
    emailAddressTextController?.dispose();

    passwordFocusNode?.dispose();
    passwordTextController?.dispose();
  }
}
