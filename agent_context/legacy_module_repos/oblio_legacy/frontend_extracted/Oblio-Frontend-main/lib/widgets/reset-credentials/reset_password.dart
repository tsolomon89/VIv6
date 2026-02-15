import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:form_field_validator/form_field_validator.dart';
import 'package:oblio/routes/routes.dart';
import 'package:oblio/theme/oblio_theme.dart';
import 'package:oblio/widget-models/alert_model.dart';
import 'package:oblio/widget-models/card_model.dart';
import 'package:oblio/widgets/authentication/input.dart';
import 'package:oblio/widgets/reset-credentials/return.dart';
import 'package:oblio/widgets/reset-credentials/submit_button.dart';
import 'package:oblio/widgets/reset-credentials/title.dart';

class ResetPassword extends StatelessWidget {
  const ResetPassword({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final _formKey = GlobalKey<FormState>();
    final emailValidator = MultiValidator([
      RequiredValidator(errorText: 'Email is required'),
      EmailValidator(errorText: 'Enter a valid email address')
    ]);
    var _emailController = TextEditingController();

    void passwordReset() {
      FirebaseAuth.instance
          .sendPasswordResetEmail(
        email: _emailController.text,
      )
          .then((result) {
        Navigator.pushNamed(context, AuthenticationRoute);
      }).catchError((err) {
        //print(err.message);
        showDialog(
            context: context,
            builder: (BuildContext context) {
              return Center(
                child: AlertModel(
                  padding: EdgeInsets.all(20),
                  data: err.message,
                  height: 200,
                  width: 400,
                ),
              );
            });
      });
    }

    return CardModel(
        height: 475,
        width: 400,
        decoration: BoxDecoration(
          color: oblioTheme.cardColor,
          boxShadow: [
            BoxShadow(
              color: Colors.blueGrey.withOpacity(0.1),
              spreadRadius: 10,
              blurRadius: 20,
              offset: Offset(0, 3),
            ),
          ],
        ),
        child: Form(
          key: _formKey,
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              ResetTitle(),
              SizedBox(height: 20),
              AuthenticationInput(
                  obscure: false,
                  label: 'Email',
                  suffixIcon:
                      Visibility(visible: false, child: Icon(Icons.email)),
                  validator: emailValidator,
                  controller: _emailController),
              SizedBox(height: 20),
              SubmitButton(onPressed: () {
                if (_formKey.currentState!.validate()) {
                  //print('Reset');
                  passwordReset();
                }
              }),
              SizedBox(height: 20),
              Return(onTap: () {
                Navigator.pushNamed(context, AuthenticationRoute);
              })
            ],
          ),
        ));
  }
}
