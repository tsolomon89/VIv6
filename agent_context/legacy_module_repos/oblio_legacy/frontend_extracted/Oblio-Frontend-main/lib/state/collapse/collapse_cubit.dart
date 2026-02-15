import 'package:bloc/bloc.dart';

class CollapseCubit extends Cubit<bool> {
  CollapseCubit() : super(false);
  void collapse() => emit(true);
  void expand() => emit(false);
}
