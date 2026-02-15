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

Future<List<FieldStruct>> convertFieldRecordsToFieldStructs(
  List<FieldRecord>? fieldRecords,
) async {
  // Check for null or empty input list
  if (fieldRecords == null || fieldRecords.isEmpty) {
    throw ArgumentError('The list of FieldRecord is null or empty');
  }

  List<FieldStruct> fieldStructs = fieldRecords.map((fieldRecord) {
    // Convert each Property from FieldRecord to PropertyStruct
    List<PropertyStruct> propertyStructs =
        fieldRecord.properties.map((property) {
      // Convert each Relation to RelationStruct
      List<RelationStruct> relationStructs = property.relations.map((relation) {
        return RelationStruct(
          propertyValue: relation.propertyValue,
          fieldName: relation.fieldName,
          fieldRef: relation
              .fieldRef, // No need for a null-coalescing operator if it's already nullable
        );
      }).toList(); // Provide an empty list if relations is null

      return PropertyStruct(
        propertyValue: property.propertyValue,
        fieldName: property.fieldName,
        fieldRef: property.fieldRef,
        relations: relationStructs,
      );
    }).toList(); // Provide an empty list if properties is null

    // Create the FieldStruct from the FieldRecord
    return FieldStruct(
      fieldName: fieldRecord.fieldName,
      properties: propertyStructs,
    );
  }).toList();

  return fieldStructs;
}
