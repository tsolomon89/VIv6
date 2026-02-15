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

Future<List<FieldStruct>> filterFieldStructsWithStrings(
  List<String>? searchStrings,
  List<FieldStruct>? fieldStructs,
) async {
  // If the search strings or the field structs are null, return an empty list.
  if (searchStrings == null || fieldStructs == null) {
    return [];
  }

  // Convert the search strings to lowercase for case-insensitive comparison.
  var lowerCaseSearchStrings =
      searchStrings.map((s) => s.toLowerCase()).toList();
  List<FieldStruct> filteredFieldStructs = [];

  // Iterate over each FieldStruct.
  for (var fieldStruct in fieldStructs) {
    // Get the properties from the FieldStruct, assuming it's not null.
    var properties =
        fieldStruct.properties ?? []; // Provide an empty list if null.
    var matchingProperties = properties.where((property) {
      // Check if propertyValue and relations are not null before proceeding.
      var propertyValueLower = property.propertyValue?.toLowerCase();
      var hasPropertyMatch = propertyValueLower != null &&
          lowerCaseSearchStrings.contains(propertyValueLower);

      // Check if any relation's propertyValue matches the search strings.
      var hasRelationMatch = property.relations?.any((relation) {
            var relationValueLower = relation.propertyValue?.toLowerCase();
            return relationValueLower != null &&
                lowerCaseSearchStrings.contains(relationValueLower);
          }) ??
          false;

      return hasPropertyMatch || hasRelationMatch;
    }).toList();

    // If there are matching properties, create a new FieldStruct with these properties.
    if (matchingProperties.isNotEmpty) {
      filteredFieldStructs.add(FieldStruct(
        fieldName: fieldStruct.fieldName, // Keep the original field name.
        properties: matchingProperties, // Only include the matching properties.
      ));
    }
  }

  // Return the list of FieldStructs with matching properties.
  return filteredFieldStructs;
}
