import 'package:bloc/bloc.dart';

class AccountOppCubit extends Cubit<bool> {
  AccountOppCubit() : super(false);
  void show() => emit(true);
  void hide() => emit(false);
}
