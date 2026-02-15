import 'package:bloc/bloc.dart';

class OwnedOppCubit extends Cubit<bool> {
  OwnedOppCubit() : super(false);
  void show() => emit(true);
  void hide() => emit(false);
}
