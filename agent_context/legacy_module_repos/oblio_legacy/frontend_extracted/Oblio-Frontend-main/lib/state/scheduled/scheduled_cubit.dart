import 'package:bloc/bloc.dart';

class ScheduledCubit extends Cubit<String> {
  ScheduledCubit() : super('email');
  void calendar() => emit('calendar');
  void task() => emit('task');
  void image() => emit('image');
  void account() => emit('account');
  void cart() => emit('cart');
  void email() => emit('email');
  void phone() => emit('phone');
}
