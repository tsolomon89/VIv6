import 'package:flutter/material.dart';
import 'package:oblio/routes/routes.dart';
import 'package:oblio/theme/colors.dart';
import 'package:oblio/theme/oblio_theme.dart';
import 'package:oblio/widget-models/avatar_model.dart';
import 'package:oblio/widget-models/divider_model.dart';
import 'package:oblio/widget-models/primary_button_model.dart';
import 'package:oblio/widget-models/text_model.dart';
import 'package:oblio/widgets/home/account/account_footer.dart';

class AccountCard extends StatelessWidget {
  const AccountCard({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Material(
      child: Container(
          padding: EdgeInsets.all(20),
          height: 425,
          width: 300,
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
          child: Column(
            mainAxisAlignment: MainAxisAlignment.start,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              AvatarModel(
                onPressed: () {},
                radius: 60,
                image: AssetImage(
                  'lib/assets/images/profile_high.png',
                ),
              ),
              SizedBox(height: 10),
              TextModel(
                data: 'Alita Stone'.toUpperCase(),
                style: oblioTheme.textTheme.headline3!,
                textAlign: TextAlign.center,
                textDirection: TextDirection.ltr,
              ),
              SizedBox(height: 5),
              TextModel(
                data: 'alita.stone@gmail.com',
                style: oblioTheme.textTheme.headline5!,
                textAlign: TextAlign.center,
                textDirection: TextDirection.ltr,
              ),
              SizedBox(height: 15),
              PrimaryButtonModel(
                height: 60,
                width: 220,
                padding: EdgeInsets.all(5),
                name: 'Manage Your Account'.toUpperCase(),
                textStyle: oblioTheme.textTheme.overline!,
                onPressed: () {},
                style: ButtonStyle(
                    elevation: MaterialStateProperty.resolveWith((states) => 0),
                    textStyle: MaterialStateProperty.all(
                      TextStyle(
                        fontSize: 14,
                        fontFamily: 'Poppins',
                        fontWeight: FontWeight.normal,
                        color: CompanyColors.font_primary[100],
                      ),
                    ),
                    shape: MaterialStateProperty.all<RoundedRectangleBorder>(
                        RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(50.0),
                    )),
                    backgroundColor: MaterialStateProperty.resolveWith(
                        (states) => Colors.grey[300]),
                    splashFactory: NoSplash.splashFactory),
              ),
              PrimaryButtonModel(
                height: 60,
                width: 220,
                padding: EdgeInsets.all(5),
                name: 'Sign Out'.toUpperCase(),
                textStyle: oblioTheme.primaryTextTheme.overline!,
                onPressed: () {
                  Navigator.pushNamed(context, AuthenticationRoute);
                },
                style: ButtonStyle(
                    elevation: MaterialStateProperty.resolveWith((states) => 0),
                    textStyle: MaterialStateProperty.all(
                      TextStyle(
                          fontSize: 14,
                          fontFamily: 'Poppins',
                          fontWeight: FontWeight.normal,
                          color: Colors.white),
                    ),
                    shape: MaterialStateProperty.all<RoundedRectangleBorder>(
                        RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(50.0),
                    )),
                    backgroundColor: MaterialStateProperty.resolveWith(
                        (states) => CompanyColors.red[500]),
                    splashFactory: NoSplash.splashFactory),
              ),
              Padding(
                padding: EdgeInsets.only(left: 20, right: 20, top: 10),
                child: DividerModel(
                  height: 0,
                  thickness: 1,
                  color: oblioTheme.dividerTheme.color!,
                ),
              ),
              AccountFooter()
            ],
          )),
    );
  }
}
