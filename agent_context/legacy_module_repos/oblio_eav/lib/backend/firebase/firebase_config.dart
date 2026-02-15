import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/foundation.dart';

Future initFirebase() async {
  if (kIsWeb) {
    await Firebase.initializeApp(
        options: FirebaseOptions(
            apiKey: "AIzaSyDmkaVw0MsZ5zBpZroTIRsQrRIQvJUNfkw",
            authDomain: "agency-pc8tbb.firebaseapp.com",
            projectId: "agency-pc8tbb",
            storageBucket: "agency-pc8tbb.appspot.com",
            messagingSenderId: "220169721296",
            appId: "1:220169721296:web:428ab5b17a46b8e61815d5"));
  } else {
    await Firebase.initializeApp();
  }
}
