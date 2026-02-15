import 'package:bloc/bloc.dart';

class RightWindowCubit extends Cubit<bool> {
  RightWindowCubit() : super(false);
  void show() => emit(true);
  void hide() => emit(false);
}
