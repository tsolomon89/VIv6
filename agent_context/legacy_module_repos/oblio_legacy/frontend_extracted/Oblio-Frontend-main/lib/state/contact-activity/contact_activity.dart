import 'package:bloc/bloc.dart';

class ContactActivityCubit extends Cubit<bool> {
  ContactActivityCubit() : super(false);
  void show() => emit(true);
  void hide() => emit(false);
}
