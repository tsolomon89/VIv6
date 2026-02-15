import 'package:bloc/bloc.dart';

class PrivacyCubit extends Cubit<bool> {
  PrivacyCubit() : super(false);
  void privacyCheck() => emit(true);
  void privacyUncheck() => emit(false);
}
