import 'dart:convert';
import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import 'package:timeago/timeago.dart' as timeago;
import 'lat_lng.dart';
import 'place.dart';
import 'uploaded_file.dart';
import '/backend/backend.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '/backend/schema/structs/index.dart';
import '/auth/firebase_auth/auth_util.dart';

bool listContainsAny(
  List<String>? inputList,
  List<String>? checkList,
) {
  // If either list is null, return false as there are no elements to compare
  if (inputList == null || checkList == null) {
    return false;
  }

  // Check if any element in checkList is contained in input
  return checkList.any((item) => inputList.contains(item));
}

List<PropertyStruct> mapListPropertyStruct(List<PropertyStruct>? input) {
  input = input ?? [];
  return input;
}

List<RecordSnapshotStruct> mergeListRecordSnapshot(
  List<RecordSnapshotStruct>? currentList,
  List<RecordSnapshotStruct>? addList,
) {
  List<RecordSnapshotStruct> result = [];

  currentList = currentList ?? [];
  addList = addList ?? [];

//add list items to result;
  result.addAll(currentList);
  result.addAll(addList);

//removew duplicates
  result.toSet().toList();

  return result;
}

List<FieldStruct> mapFieldStruct(List<FieldStruct>? input) {
  input = input ?? [];
  return input;
}

List<FieldGroupStruct> mapListFieldGroupStruct(List<FieldGroupStruct>? input) {
  input = input ?? [];
  return input;
}

List<ObjectStruct> mapListObjectStruct(List<ObjectStruct>? input) {
  input = input ?? [];
  return input;
}

List<ObjectStruct> mergeListObject(
  List<ObjectStruct>? currentList,
  List<ObjectStruct>? addList,
) {
  List<ObjectStruct> result = [];

  currentList = currentList ?? [];
  addList = addList ?? [];

//add list items to result;
  result.addAll(currentList);
  result.addAll(addList);

//removew duplicates
  result.toSet().toList();

  return result;
}

List<FieldGroupStruct> mergeListFieldGroup(
  List<FieldGroupStruct>? currentList,
  List<FieldGroupStruct>? addList,
) {
  List<FieldGroupStruct> result = [];

  currentList = currentList ?? [];
  addList = addList ?? [];

//add list items to result;
  result.addAll(currentList);
  result.addAll(addList);

//removew duplicates
  result.toSet().toList();

  return result;
}

List<FieldStruct> mergeFieldLists(
  List<FieldStruct>? currentList,
  List<FieldStruct>? addList,
) {
  List<FieldStruct> result = [];

  currentList = currentList ?? [];
  addList = addList ?? [];

//add list items to result;
  result.addAll(currentList);
  result.addAll(addList);

//removew duplicates
  result.toSet().toList();

  return result;
}

List<PropertyStruct> mergeListProperty(
  List<PropertyStruct>? currentList,
  List<PropertyStruct>? addList,
) {
  List<PropertyStruct> result = [];

  currentList = currentList ?? [];
  addList = addList ?? [];

//add list items to result;
  result.addAll(currentList);
  result.addAll(addList);

//removew duplicates
  result.toSet().toList();

  return result;
}

List<RecordSnapshotStruct> removeListRecordSnapshotStruct(
  List<RecordSnapshotStruct>? currentList,
  List<RecordSnapshotStruct>? removeList,
) {
  // Initialize the lists if they are null
  currentList = currentList ?? [];
  removeList = removeList ?? [];

  // Create a new list to store the result
  List<RecordSnapshotStruct> result = [];

  // Using a for loop to iterate over the currentList
  for (var item in currentList) {
    // Check if the item is not in the removeList
    if (!removeList.contains(item)) {
      // If the item is not in the removeList, add it to the result
      result.add(item);
    }
  }

  // Return the result list
  return result;
}

bool listMapContainsItem(
  String? checkItem,
  List<String>? checkList,
) {
  checkList = checkList ?? [];
  checkItem = checkItem ?? '';
  return checkList.contains(checkItem);
}

String stringToUpperCase(String? inputString) {
  // take string from argument 1 and return the string in all capitals
  if (inputString == null) {
    return '';
  }
  return inputString.toUpperCase();
}

String stringtoProperCase(String? inputString) {
  // take in string from argument 1 and return the string as Proper case
  if (inputString == null || inputString.isEmpty) {
    return '';
  }
  final words = inputString.split(' ');
  final capitalizedWords = words.map((word) {
    final firstLetter = word.substring(0, 1).toUpperCase();
    final rest = word.substring(1).toLowerCase();
    return '$firstLetter$rest';
  });
  return capitalizedWords.join(' ');
}

List<String>? stringToListProperCase(String? inputString) {
  // take in argument 1, delimate it by a space and return a list of Strings in properCase
  if (inputString == null) {
    return null;
  }
  final List<String> words = inputString.split(' ');
  final List<String> result = [];
  for (final word in words) {
    if (word.isNotEmpty) {
      result.add('${word[0].toUpperCase()}${word.substring(1).toLowerCase()}');
    }
  }
  return result;
}

String? stringListToStringDotDelimiter(List<String>? inputListStrings) {
  // take in list of strings and return a them as signal string delimited by " • "
  if (inputListStrings == null || inputListStrings.isEmpty) {
    return null;
  }
  return inputListStrings.join(' • ');
}
