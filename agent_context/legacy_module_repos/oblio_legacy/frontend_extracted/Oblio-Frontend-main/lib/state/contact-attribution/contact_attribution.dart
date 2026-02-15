import 'package:bloc/bloc.dart';

class ContactAttributionCubit extends Cubit<bool> {
  ContactAttributionCubit() : super(false);
  void show() => emit(true);
  void hide() => emit(false);
}
