import 'package:bloc/bloc.dart';

class WinsOppCubit extends Cubit<bool> {
  WinsOppCubit() : super(false);
  void show() => emit(true);
  void hide() => emit(false);
}
