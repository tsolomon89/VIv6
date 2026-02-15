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

Future<String> extractDomainFromEmail(String? email) async {
  // Check if email is null
  if (email == null || email.isEmpty) {
    throw Exception("Email is null or empty");
  }

  // Split the email string into parts using "@" as the delimiter
  List<String> emailParts = email.split("@");

  // Check if the email string contains exactly one "@" symbol
  if (emailParts.length != 2) {
    throw Exception("Invalid email format");
  }

  // Return the domain part of the email
  return emailParts[1];
}
