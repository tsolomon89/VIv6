import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:form_field_validator/form_field_validator.dart';
import 'package:oblio/routes/routes.dart';
import 'package:oblio/state/privacy/privacy_cubit.dart';
import 'package:oblio/state/terms/terms_cubit.dart';
import 'package:oblio/theme/oblio_theme.dart';
import 'package:oblio/widget-models/alert_model.dart';
import 'package:validators/validators.dart' as validator;
import 'package:oblio/widget-models/card_model.dart';
import 'package:oblio/widgets/registration/input.dart';
import 'package:oblio/widgets/registration/previous_button.dart';
import 'package:oblio/widgets/registration/privacy.dart';
import 'package:oblio/widgets/registration/privacy_error.dart';
import 'package:oblio/widgets/registration/terms.dart';
import 'package:oblio/widgets/registration/terms_error.dart';
import 'package:oblio/widgets/registration/title.dart';
import 'complete_signup_button.dart';

class RegistrationArguments {
  final String email;
  final String password;

  RegistrationArguments(this.email, this.password);
}

// ignore: must_be_immutable
class RegistrationCard extends StatefulWidget {
  RegistrationCard({Key? key}) : super(key: key);

  @override
  _RegistrationCardState createState() => _RegistrationCardState();
}

class _RegistrationCardState extends State<RegistrationCard> {
  final nameValidator = MultiValidator([
    RequiredValidator(errorText: 'Name is required'),
    MinLengthValidator(4, errorText: 'Name must be at least 4 digits long'),
  ]);

  final jobValidator = MultiValidator([
    RequiredValidator(errorText: 'Job title is required'),
    MinLengthValidator(6,
        errorText: 'Job title must be at least 6 digits long'),
  ]);

  final workEmailValidator = MultiValidator([
    RequiredValidator(errorText: 'Work email is required'),
    EmailValidator(errorText: 'Enter a valid email address')
  ]);

  phoneValidator(String value) {
    if (value.isEmpty) {
      return 'Phone no. is required';
    } else if (!validator.isNumeric(value)) {
      return 'Phone no. must be Numeric value';
    } else if (value.length < 8) {
      return 'Phone no. must be at least 8 digits long';
    }
  }

  @override
  Widget build(BuildContext context) {
    final args =
        ModalRoute.of(context)!.settings.arguments as RegistrationArguments;

    final _formKey = GlobalKey<FormState>();
    var _nameController = TextEditingController();
    var _jobController = TextEditingController();
    var _workEmailController = TextEditingController();
    var _phoneController = TextEditingController();

    void userRegistration() {
      FirebaseAuth.instance
          .createUserWithEmailAndPassword(
              email: args.email, password: args.password)
          .then((result) {
        FirebaseFirestore.instance
            .collection("users")
            .doc(result.user!.uid)
            .set({
          "uid": result.user!.uid,
          "email": args.email,
          "password": args.password,
          "fullName": _nameController.text,
          "title": _jobController.text,
          "workEmail": _workEmailController.text,
          "phone": _phoneController.text
        }).then((res) {
          Navigator.pushNamed(context, HomeRoute);
        });
      }).catchError((err) {
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
      height: 600,
      width: 400,
      decoration: BoxDecoration(
        color: oblioTheme.cardColor,
        borderRadius: BorderRadius.all(
          Radius.circular(10),
        ),
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
          children: [
            RegistrationTitle(),
            RegistrationInput(
              obscure: false,
              label: 'Full Name',
              suffixIcon: Visibility(visible: false, child: Icon(Icons.person)),
              validator: nameValidator,
              controller: _nameController,
            ),
            SizedBox(height: 20),
            RegistrationInput(
              obscure: false,
              label: 'Job Title',
              suffixIcon: Visibility(visible: false, child: Icon(Icons.work)),
              validator: jobValidator,
              controller: _jobController,
            ),
            SizedBox(height: 20),
            RegistrationInput(
              obscure: false,
              label: 'Work Email',
              suffixIcon: Visibility(visible: false, child: Icon(Icons.email)),
              validator: workEmailValidator,
              controller: _workEmailController,
            ),
            SizedBox(height: 20),
            RegistrationInput(
              obscure: false,
              label: 'Work Phone',
              suffixIcon: Visibility(visible: false, child: Icon(Icons.phone)),
              validator: (value) {
                return phoneValidator(value!);
              },
              controller: _phoneController,
            ),
            SizedBox(height: 10),
            Padding(
              padding: const EdgeInsets.only(left: 40, right: 20, bottom: 10),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [Terms(), Privacy()],
              ),
            ),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                PreviousButton(
                  onPressed: () {
                    Navigator.pushNamed(context, AuthenticationRoute);
                  },
                ),
                SizedBox(width: 20),
                BlocBuilder<TermsCubit, bool>(
                  builder: (context, termsState) {
                    return BlocBuilder<PrivacyCubit, bool>(
                      builder: (context, privacyState) {
                        return CompleteSignupButton(
                          onPressed: () {
                            if (_formKey.currentState!.validate() == false) {
                              //print('Form not validated!');
                            } else if (termsState == false) {
                              showDialog(
                                  context: context,
                                  builder: (BuildContext context) =>
                                      Center(child: TermsError()));
                            } else if (privacyState == false) {
                              showDialog(
                                  context: context,
                                  builder: (BuildContext context) =>
                                      Center(child: PrivacyError()));
                            } else if (_formKey.currentState!.validate() &&
                                termsState == true &&
                                privacyState == true) {
                              userRegistration();
                            }
                          },
                        );
                      },
                    );
                  },
                )
              ],
            )
          ],
        ),
      ),
    );
  }
}
