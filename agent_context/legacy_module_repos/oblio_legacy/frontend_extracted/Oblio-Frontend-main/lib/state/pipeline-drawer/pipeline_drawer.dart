import 'package:bloc/bloc.dart';

class PipelineDrawerCubit extends Cubit<bool> {
  PipelineDrawerCubit() : super(false);
  void show() => emit(true);
  void hide() => emit(false);
}
