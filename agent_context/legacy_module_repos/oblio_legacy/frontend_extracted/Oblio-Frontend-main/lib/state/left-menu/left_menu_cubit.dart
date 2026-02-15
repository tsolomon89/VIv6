import 'package:bloc/bloc.dart';

class LeftMenuCubit extends Cubit<String> {
  LeftMenuCubit() : super('opportunities');
  void navigateTo(value) => emit(value);
}
