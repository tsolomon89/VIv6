import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:form_field_validator/form_field_validator.dart';
import 'package:oblio/routes/routes.dart';
import 'package:oblio/state/password/password_cubit.dart';
import 'package:oblio/theme/oblio_theme.dart';
import 'package:oblio/widget-models/alert_model.dart';
import 'package:oblio/widget-models/card_model.dart';
import 'package:oblio/widgets/authentication/login_button.dart';
import 'package:oblio/widgets/authentication/forgot-password.dart';
import 'package:oblio/widgets/authentication/input.dart';
import 'package:oblio/widgets/authentication/logo.dart';
import 'package:oblio/widgets/authentication/rememberme.dart';
import 'package:oblio/widgets/authentication/signup_button.dart';
import 'package:oblio/widgets/authentication/title.dart';
import 'package:oblio/widgets/registration/card.dart';
import 'package:shared_preferences/shared_preferences.dart';

// ignore: must_be_immutable
class AuthenticationCard extends StatefulWidget {
  AuthenticationCard({Key? key}) : super(key: key);

  @override
  _AuthenticationCardState createState() => _AuthenticationCardState();
}

class _AuthenticationCardState extends State<AuthenticationCard> {
  final emailValidator = MultiValidator([
    RequiredValidator(errorText: 'Email is required'),
    EmailValidator(errorText: 'Enter a valid email address')
  ]);

  final passwordValidator = MultiValidator([
    RequiredValidator(errorText: 'password is required'),
    MinLengthValidator(8, errorText: 'password must be at least 8 digits long'),
    PatternValidator(r'(?=.*?[#?!@$%^&*-])',
        errorText: 'passwords must have at least one special character')
  ]);
  final _formKey = GlobalKey<FormState>();
  var _emailController = TextEditingController();
  var _passwordController = TextEditingController();

  bool _isChecked = false;

  @override
  // ignore: must_call_super
  void initState() {
    getData();
  }

  getData() async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    setState(() {
      _emailController.text = prefs.getString('emailData')!;
      _passwordController.text = prefs.getString('passData')!;
    });
  }

  @override
  Widget build(BuildContext context) {
    void userAuthentication() {
      FirebaseAuth.instance
          .signInWithEmailAndPassword(
              email: _emailController.text, password: _passwordController.text)
          .then((result) {
        Navigator.pushNamed(context, HomeRoute);
      }).catchError((err) {
        print(err.message);
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
            SizedBox(height: 15),
            AuthenticationLogo(),
            AuthenticationTitle(),
            SizedBox(height: 20),
            AuthenticationInput(
              obscure: false,
              label: 'Email',
              suffixIcon: Visibility(visible: false, child: Icon(Icons.email)),
              validator: emailValidator,
              controller: _emailController,
            ),
            SizedBox(height: 20),
            BlocBuilder<PasswordCubit, bool>(
              builder: (context, passwordState) {
                return AuthenticationInput(
                  obscure: passwordState,
                  label: 'Password',
                  suffixIcon: InkWell(
                    splashFactory: NoSplash.splashFactory,
                    highlightColor: Colors.transparent,
                    focusColor: Colors.transparent,
                    onTap: () {
                      passwordState == true
                          ? context.read<PasswordCubit>().passwordShow()
                          : context.read<PasswordCubit>().passwordHide();
                    },
                    child: Icon(
                      passwordState ? Icons.visibility : Icons.visibility_off,
                      size: 20,
                      color: oblioTheme.iconTheme.color,
                    ),
                  ),
                  validator: passwordValidator,
                  controller: _passwordController,
                );
              },
            ),
            SizedBox(height: 20),
            Padding(
              padding: const EdgeInsets.only(left: 15, right: 20, bottom: 20),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  RememberMe(
                    value: _isChecked,
                    onChanged: (bool) {
                      setState(() {
                        _isChecked = !_isChecked;
                      });
                    },
                  ),
                  ForgotPassword(
                    onTap: () {
                      Navigator.pushNamed(context, ResetpasswordRoute);
                    },
                  )
                ],
              ),
            ),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                LoginButton(
                  onPressed: () async {
                    if (_formKey.currentState!.validate()) {
                      print('validated');
                      SharedPreferences prefs =
                          await SharedPreferences.getInstance();
                      if (_isChecked == true) {
                        prefs.setString('emailData', _emailController.text);

                        //TODO: Uhmmmm....
                        prefs.setString('passData', _passwordController.text);
                      }

                      userAuthentication();
                    } else {
                      print('Error, Something went wrong!');
                    }
                  },
                ),
                SizedBox(width: 45),
                SignupButton(
                  onPressed: () {
                    if (_formKey.currentState!.validate()) {
                      print('validated');
                      Navigator.pushNamed(context, RegistrationRoute,
                          arguments: RegistrationArguments(
                              _emailController.text, _passwordController.text));
                    } else {
                      Text('Error, Something went wrong!');
                    }
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
