import 'package:flutter/material.dart';
import 'flutter_flow/request_manager.dart';
import '/backend/backend.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:csv/csv.dart';
import 'package:synchronized/synchronized.dart';
import 'flutter_flow/flutter_flow_util.dart';

class FFAppState extends ChangeNotifier {
  static FFAppState _instance = FFAppState._internal();

  factory FFAppState() {
    return _instance;
  }

  FFAppState._internal();

  static void reset() {
    _instance = FFAppState._internal();
  }

  Future initializePersistedState() async {
    secureStorage = FlutterSecureStorage();
    await _safeInitAsync(() async {
      _uiNavBarOpen =
          await secureStorage.getBool('ff_uiNavBarOpen') ?? _uiNavBarOpen;
    });
    await _safeInitAsync(() async {
      _uiSideBarOpen =
          await secureStorage.getBool('ff_uiSideBarOpen') ?? _uiSideBarOpen;
    });
    await _safeInitAsync(() async {
      _uiCardExpanded =
          await secureStorage.getBool('ff_uiCardExpanded') ?? _uiCardExpanded;
    });
    await _safeInitAsync(() async {
      _uiSideBarObject = await secureStorage.getString('ff_uiSideBarObject') ??
          _uiSideBarObject;
    });
    await _safeInitAsync(() async {
      _uiDarkMode = await secureStorage.getBool('ff_uiDarkMode') ?? _uiDarkMode;
    });
  }

  void update(VoidCallback callback) {
    callback();
    notifyListeners();
  }

  late FlutterSecureStorage secureStorage;

  bool _uiNavBarOpen = false;
  bool get uiNavBarOpen => _uiNavBarOpen;
  set uiNavBarOpen(bool value) {
    _uiNavBarOpen = value;
    secureStorage.setBool('ff_uiNavBarOpen', value);
  }

  void deleteUiNavBarOpen() {
    secureStorage.delete(key: 'ff_uiNavBarOpen');
  }

  bool _uiSideBarOpen = false;
  bool get uiSideBarOpen => _uiSideBarOpen;
  set uiSideBarOpen(bool value) {
    _uiSideBarOpen = value;
    secureStorage.setBool('ff_uiSideBarOpen', value);
  }

  void deleteUiSideBarOpen() {
    secureStorage.delete(key: 'ff_uiSideBarOpen');
  }

  bool _uiCardExpanded = false;
  bool get uiCardExpanded => _uiCardExpanded;
  set uiCardExpanded(bool value) {
    _uiCardExpanded = value;
    secureStorage.setBool('ff_uiCardExpanded', value);
  }

  void deleteUiCardExpanded() {
    secureStorage.delete(key: 'ff_uiCardExpanded');
  }

  String _uiSideBarObject = 'default';
  String get uiSideBarObject => _uiSideBarObject;
  set uiSideBarObject(String value) {
    _uiSideBarObject = value;
    secureStorage.setString('ff_uiSideBarObject', value);
  }

  void deleteUiSideBarObject() {
    secureStorage.delete(key: 'ff_uiSideBarObject');
  }

  bool _uiDarkMode = false;
  bool get uiDarkMode => _uiDarkMode;
  set uiDarkMode(bool value) {
    _uiDarkMode = value;
    secureStorage.setBool('ff_uiDarkMode', value);
  }

  void deleteUiDarkMode() {
    secureStorage.delete(key: 'ff_uiDarkMode');
  }

  String _uiSideBarView = 'read';
  String get uiSideBarView => _uiSideBarView;
  set uiSideBarView(String value) {
    _uiSideBarView = value;
  }

  List<PropertyStruct> _selectedProperties = [];
  List<PropertyStruct> get selectedProperties => _selectedProperties;
  set selectedProperties(List<PropertyStruct> value) {
    _selectedProperties = value;
  }

  void addToSelectedProperties(PropertyStruct value) {
    selectedProperties.add(value);
  }

  void removeFromSelectedProperties(PropertyStruct value) {
    selectedProperties.remove(value);
  }

  void removeAtIndexFromSelectedProperties(int index) {
    selectedProperties.removeAt(index);
  }

  void updateSelectedPropertiesAtIndex(
    int index,
    PropertyStruct Function(PropertyStruct) updateFn,
  ) {
    selectedProperties[index] = updateFn(_selectedProperties[index]);
  }

  void insertAtIndexInSelectedProperties(int index, PropertyStruct value) {
    selectedProperties.insert(index, value);
  }

  PropertyStruct _selectedRelations = PropertyStruct();
  PropertyStruct get selectedRelations => _selectedRelations;
  set selectedRelations(PropertyStruct value) {
    _selectedRelations = value;
  }

  void updateSelectedRelationsStruct(Function(PropertyStruct) updateFn) {
    updateFn(_selectedRelations);
  }

  final _queryFieldManager = StreamRequestManager<List<FieldRecord>>();
  Stream<List<FieldRecord>> queryField({
    String? uniqueQueryKey,
    bool? overrideCache,
    required Stream<List<FieldRecord>> Function() requestFn,
  }) =>
      _queryFieldManager.performRequest(
        uniqueQueryKey: uniqueQueryKey,
        overrideCache: overrideCache,
        requestFn: requestFn,
      );
  void clearQueryFieldCache() => _queryFieldManager.clear();
  void clearQueryFieldCacheKey(String? uniqueKey) =>
      _queryFieldManager.clearRequest(uniqueKey);
}

void _safeInit(Function() initializeField) {
  try {
    initializeField();
  } catch (_) {}
}

Future _safeInitAsync(Function() initializeField) async {
  try {
    await initializeField();
  } catch (_) {}
}

extension FlutterSecureStorageExtensions on FlutterSecureStorage {
  static final _lock = Lock();

  Future<void> writeSync({required String key, String? value}) async =>
      await _lock.synchronized(() async {
        await write(key: key, value: value);
      });

  void remove(String key) => delete(key: key);

  Future<String?> getString(String key) async => await read(key: key);
  Future<void> setString(String key, String value) async =>
      await writeSync(key: key, value: value);

  Future<bool?> getBool(String key) async => (await read(key: key)) == 'true';
  Future<void> setBool(String key, bool value) async =>
      await writeSync(key: key, value: value.toString());

  Future<int?> getInt(String key) async =>
      int.tryParse(await read(key: key) ?? '');
  Future<void> setInt(String key, int value) async =>
      await writeSync(key: key, value: value.toString());

  Future<double?> getDouble(String key) async =>
      double.tryParse(await read(key: key) ?? '');
  Future<void> setDouble(String key, double value) async =>
      await writeSync(key: key, value: value.toString());

  Future<List<String>?> getStringList(String key) async =>
      await read(key: key).then((result) {
        if (result == null || result.isEmpty) {
          return null;
        }
        return CsvToListConverter()
            .convert(result)
            .first
            .map((e) => e.toString())
            .toList();
      });
  Future<void> setStringList(String key, List<String> value) async =>
      await writeSync(key: key, value: ListToCsvConverter().convert([value]));
}
