import 'package:bloc/bloc.dart';

class RightMenuCubit extends Cubit<String> {
  RightMenuCubit() : super('');
  void setValue(object) => emit(object);
}
