import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:oblio/state/terms/terms_cubit.dart';
import 'package:oblio/theme/oblio_theme.dart';
import 'package:oblio/widget-models/text_model.dart';
import 'package:oblio/widgets/authentication/checkbox.dart';

class Terms extends StatelessWidget {
  const Terms({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.start,
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        BlocBuilder<TermsCubit, bool>(
          builder: (context, termsState) {
            return AuthenticationCheckbox(
                value: termsState,
                onChanged: (bool? value) {
                  termsState == false
                      ? context.read<TermsCubit>().termsCheck()
                      : context.read<TermsCubit>().termsUncheck();
                });
          },
        ),
        TextModel(
            data: 'Accept Terms & Conditions',
            style: oblioTheme.textTheme.overline!,
            textAlign: TextAlign.left,
            textDirection: TextDirection.ltr)
      ],
    );
  }
}
