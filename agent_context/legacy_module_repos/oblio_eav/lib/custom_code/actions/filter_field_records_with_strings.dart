// Automatic FlutterFlow imports
import '/backend/backend.dart';
import '/backend/schema/structs/index.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import 'index.dart'; // Imports other custom actions
import '/flutter_flow/custom_functions.dart'; // Imports custom functions
import 'package:flutter/material.dart';
// Begin custom action code
// DO NOT REMOVE OR MODIFY THE CODE ABOVE!

Future<List<FieldStruct>> filterFieldRecordsWithStrings(
  List<String>? searchStrings,
  List<FieldRecord>? fieldRecords,
) async {
  // Check for null inputs and return an empty list in such cases
  if (searchStrings == null || fieldRecords == null) {
    return [];
  }

  // Convert all search strings to lowercase for case-insensitive comparison
  var lowerCaseSearchStrings =
      searchStrings.map((s) => s.toLowerCase()).toList();
  List<FieldStruct> fieldStructsList = [];

  // Iterate through each FieldRecord
  for (var fieldRecord in fieldRecords) {
    List<PropertyStruct> matchingProperties = [];

    // Iterate through each property of the FieldRecord
    for (var property in fieldRecord.properties ?? []) {
      // Check if the propertyValue matches any search string
      bool propertyMatch = lowerCaseSearchStrings.any(
        (str) => property.propertyValue.toLowerCase().contains(str),
      );

      // Check if any relation's propertyValue matches any search string
      bool relationMatch = property.relations.any(
        (relation) => lowerCaseSearchStrings.any(
          (str) => relation.propertyValue.toLowerCase().contains(str),
        ),
      );

      // Add the property to the matchingProperties list if there's a match
      if (propertyMatch || relationMatch) {
        matchingProperties.add(property);
      }
    }

    // Create a FieldStruct with the matching properties
    // If no matching properties, we still create a FieldStruct but with an empty properties list
    fieldStructsList.add(FieldStruct(
      fieldName: fieldRecord.fieldName,
      properties: matchingProperties,
    ));
  }

  // Return the list of FieldStructs
  return fieldStructsList;
}
