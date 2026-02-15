import 'package:bloc/bloc.dart';

class MobileState extends Cubit<bool> {
  MobileState() : super(false);
  void setValue(state) => emit(state);
}
