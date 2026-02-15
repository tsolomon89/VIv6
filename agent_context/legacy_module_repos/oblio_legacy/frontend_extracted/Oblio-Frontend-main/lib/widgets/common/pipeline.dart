import 'package:flutter/material.dart';

class Pipeline {
  Pipeline._();

  static const Map<String, Map<String, Color>> colours = {
    'MQL': {
      'background': Color.fromRGBO(239, 239, 250, 1),
      'foreground': Color.fromRGBO(99, 114, 210, 1)
    },
    'SQL': {
      'background': Color.fromARGB(255, 255, 242, 225),
      'foreground': Color.fromARGB(255, 250, 175, 70)
    },
    'CUS': {
      'background': Color.fromRGBO(255, 234, 234, 1),
      'foreground': Color.fromRGBO(255, 135, 135, 1)
    },
    'RET': {
      'background': Color.fromRGBO(230, 248, 240, 1),
      'foreground': Color.fromRGBO(16, 193, 114, 1)
    }
  };
}
