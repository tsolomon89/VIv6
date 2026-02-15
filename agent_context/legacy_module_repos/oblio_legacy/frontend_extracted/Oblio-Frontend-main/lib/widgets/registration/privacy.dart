import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:oblio/state/privacy/privacy_cubit.dart';
import 'package:oblio/theme/oblio_theme.dart';
import 'package:oblio/widget-models/text_model.dart';
import 'package:oblio/widgets/authentication/checkbox.dart';

class Privacy extends StatelessWidget {
  const Privacy({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.start,
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        BlocBuilder<PrivacyCubit, bool>(
          builder: (context, privacyState) {
            return AuthenticationCheckbox(
                value: privacyState,
                onChanged: (bool? value) {
                  privacyState == false
                      ? context.read<PrivacyCubit>().privacyCheck()
                      : context.read<PrivacyCubit>().privacyUncheck();
                });
          },
        ),
        TextModel(
            data: 'Accept Privacy Policy Terms',
            style: oblioTheme.textTheme.overline!,
            textAlign: TextAlign.left,
            textDirection: TextDirection.ltr)
      ],
    );
  }
}
