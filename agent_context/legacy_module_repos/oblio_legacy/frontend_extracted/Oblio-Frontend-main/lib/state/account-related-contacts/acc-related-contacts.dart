import 'package:bloc/bloc.dart';

class AccRelatedContactsCubit extends Cubit<bool> {
  AccRelatedContactsCubit() : super(false);
  void show() => emit(true);
  void hide() => emit(false);
}
