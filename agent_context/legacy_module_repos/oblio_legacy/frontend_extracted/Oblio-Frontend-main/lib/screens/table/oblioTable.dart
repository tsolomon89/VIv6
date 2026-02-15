import 'dart:typed_data';
import 'package:csv/csv.dart';
import 'package:flutter/material.dart';
import 'package:linked_scroll_controller/linked_scroll_controller.dart';
import 'package:oblio/dummy.dart';
import 'package:oblio/theme/oblioTheme.dart';
import 'dart:convert';
import 'package:universal_html/html.dart' as html;
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:oblio/widgets/common/loading.dart';

@immutable
class TableData {
  final String name;

  TableData(this.name);
}

class OblioTable extends StatefulWidget {
  final String object;
  const OblioTable({Key? key, required this.object}) : super(key: key);

  @override
  _OblioTableState createState() => _OblioTableState();
}

class _OblioTableState extends State<OblioTable> {
  Future<TableData>? user;

  LinkedScrollControllerGroup? _controllers;
  ScrollController? checkboxController;

  Map<String, Map<String, dynamic>> buttons = {};
  ScrollController connected = new ScrollController();

  Map<String, String> filters = {'Contact Status': 'All'};

  Map<String, Uint8List> imageData = {};

  List<Map> clean = [];
  List<Map> filtered = [];
  ScrollController horizontalScroll = ScrollController();

  int numberCheck = 0;
  Map<String, bool> checked = {};
  bool searchVisible = false;

  List<Map>? contacts;

  String query = '';
  void search() {
    if (searchVisible)
      filtered = query != ''
          ? clean.where((row) {
              return row.values
                  .toList()
                  .toString()
                  .toLowerCase()
                  .contains(query.toLowerCase());
            }).toList()
          : contacts!;
    else {
      setState(() {
        searchVisible = true;
        buttons['SEARCH']?['visible'] = false;
      });
    }
  }

  void download() {
    List<List<dynamic>> rows = [];

    // Generate top row with column names
    List<dynamic> topRow = [];
    for (var key in filtered[0].keys) topRow.add(key);
    rows.add(topRow);

    // Add each individual row with data
    for (int i = 0; i < filtered.length; i++) {
      List<dynamic> row = [];
      for (var key in topRow) row.add(filtered[i][key]);
      rows.add(row);
    }

    String csv =
        "data:text/plain;charset=utf-8,${ListToCsvConverter().convert(rows)}";

    if (kIsWeb)
      html.AnchorElement(href: csv)
        ..download = "Contacts-${new DateTime.now()}.csv"
        ..click();
  }
  //-----------------

  Size calcTextSize(String text, TextStyle style) {
    final TextPainter textPainter = TextPainter(
      text: TextSpan(text: text, style: style),
      textDirection: TextDirection.ltr,
      textScaleFactor: WidgetsBinding.instance!.window.textScaleFactor,
    )..layout();
    return textPainter.size;
  }

  Map<String, Map<String, dynamic>>? columns;

  void processData() {
    setState(() {
      user = new Future.delayed(const Duration(milliseconds: 400), () {
        columns = Database.columns[widget.object]!;

        contacts = Database.data[widget.object]!.length > 500
            ? Database.data[widget.object]!.sublist(0, 900)
            : Database.data[widget.object]!;

        _controllers = LinkedScrollControllerGroup();
        checkboxController = _controllers!.addAndGet();
        filtered = contacts!;

        for (var column in columns!.entries) {
          column.value['control'] = _controllers!.addAndGet();
          var currentSize = calcTextSize(
              column.value['name'],
              TextStyle(
                  fontFamily: 'Poppins',
                  fontStyle: FontStyle.normal,
                  fontSize: 18,
                  letterSpacing: 1.5,
                  fontWeight: FontWeight.w500));
          if (currentSize.width > column.value['size'])
            column.value['size'] = currentSize.width;
        }

        for (var contact in filtered) {
          for (var column in columns!.entries) {
            if (column.key != 'profilePicture') {
              var currentSize = calcTextSize(
                  contact[column.key].toString(),
                  TextStyle(
                      fontFamily: 'Poppins',
                      fontStyle: FontStyle.normal,
                      fontSize: 17,
                      fontWeight: FontWeight.w500));
              if (currentSize.width > column.value['size'])
                column.value['size'] = currentSize.width;
            }
          }
        }
        clean = new List<Map>.from(contacts!);
        for (var contact in contacts!) checked[contact['id']] = false;

        return new TableData("Toto");
      });
    });
  }

  @override
  void initState() {
    // ignore: undefined_prefixed_name
    // ui.platformViewRegistry.registerViewFactory(
    //     'test-view-type',
    //     (int viewId) => html.IFrameElement()
    //       ..src = "/loader.html"
    //       ..style.border = 'none');

    // Void functions for list features
    void changeColumns(List<String> fields) {
      columns = columns!..removeWhere((k, _) => !fields.contains(k));
      clean = clean
          .map((e) => e..removeWhere((k, _) => !fields.contains(k)))
          .toList();
    }

    buttons = {
      'SEARCH': {'icon': Icons.search, 'function': search, 'visible': true},
      'SEGMENT': {
        'icon': Icons.segment_outlined,
        'function': search,
        'visible': true
      },
      'COLUMNS': {
        'icon': Icons.view_column,
        'function': changeColumns,
        'visible': true
      },
      'REPORTS': {
        'icon': Icons.assessment,
        'function': search,
        'visible': true
      },
      'DOWNLOAD': {
        'icon': Icons.download,
        'function': download,
        'visible': true
      },
      'EXPAND': {'icon': Icons.fullscreen, 'function': search, 'visible': true},
    };

    super.initState();
    processData();
  }

  @override
  void dispose() {
    checkboxController!.dispose();
    for (var column in columns!.entries) {
      (column.value['control'] as ScrollController).dispose();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Padding(
        padding: const EdgeInsets.only(
            left: 30.0, top: 30.0, right: 30.0, bottom: 30.0),
        child: Container(
          padding: EdgeInsets.all(20.0),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(5),
            boxShadow: [
              BoxShadow(
                offset: Offset(0, 1),
                blurRadius: 2,
                color: Colors.black.withOpacity(0.2),
              ),
            ],
          ),
          child:
              Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Container(
              height: 60,
              child: LayoutBuilder(
                builder: (BuildContext context, BoxConstraints constraints) {
                  int buttonNumber = constraints.maxWidth < 1500
                      ? constraints.maxWidth < 800
                          ? 0
                          : constraints.maxWidth ~/ 300
                      : buttons.length - 1;
                  buttonNumber = buttonNumber > buttons.length - 1
                      ? buttons.length - 1
                      : buttonNumber;

                  return Row(
                    children: [
                      Container(
                        width: 50,
                        height: 50,
                        child: Icon(
                          Icons.add_rounded,
                          color: Colors.white,
                          size: 35,
                        ),
                        decoration: BoxDecoration(
                            boxShadow: [
                              BoxShadow(
                                offset: Offset(0, 10),
                                blurRadius: 10,
                                color: Colors.black.withOpacity(0.2),
                              ),
                            ],
                            shape: BoxShape.circle,
                            color: Color.fromRGBO(250, 134, 52, 1)),
                      ),
                      SizedBox(width: 20),
                      Padding(
                        padding: const EdgeInsets.only(right: 14),
                        child: TextButton.icon(
                            style: TextButton.styleFrom(
                                side: BorderSide(
                              color: Colors.transparent,
                            )),
                            onPressed: () {
                              //debugPrint('Received click');
                            },
                            icon: Icon(
                              Icons.filter_alt,
                              size: 34,
                              color: Color.fromRGBO(66, 133, 244, 1),
                            ),
                            label: Text('Contact status: All',
                                style: Typeface.primaryTextButton)),
                      ),
                      TextButton(
                          style: TextButton.styleFrom(
                              side: BorderSide(
                            color: Colors.transparent,
                          )),
                          onPressed: () {},
                          child: Text('ADD FILTER',
                              style: Typeface.secondaryTextButton)),
                      Spacer(),
                      Visibility(
                        visible: searchVisible,
                        child: Container(
                          width: 200,
                          child: Focus(
                            onFocusChange: (hasFocus) {
                              if (!hasFocus && query == "")
                                setState(() {
                                  searchVisible = false;
                                  buttons['SEARCH']?['visible'] = true;
                                });
                            },
                            child: TextField(
                              onChanged: (value) {
                                setState(() {
                                  query = value;
                                  search();
                                });
                              },
                              autofocus: true,
                              decoration: InputDecoration(
                                prefixIcon: Icon(Icons.search),
                                border: OutlineInputBorder(),
                                hintText: 'Search...',
                              ),
                            ),
                          ),
                        ),
                      ),
                      Row(mainAxisAlignment: MainAxisAlignment.end, children: [
                        for (var i = 0; i <= buttonNumber; i++)
                          Visibility(
                            visible: buttons.values.elementAt(i)['visible'],
                            child: button(
                                buttons.values.elementAt(i)['icon'],
                                buttons.keys.elementAt(i),
                                buttons.values.elementAt(i)['function']),
                          ),
                        button(Icons.more_vert, 'MORE', search)
                      ])
                    ],
                  );
                },
              ),
            ),
            SizedBox(height: 20),
            FutureBuilder(
              future: user,
              builder: (context, AsyncSnapshot<TableData> snapshot) {
                if (snapshot.hasData) {
                  return Expanded(
                    child: SingleChildScrollView(
                      scrollDirection: Axis.horizontal,
                      child: Row(
                          mainAxisAlignment: MainAxisAlignment.start,
                          mainAxisSize: MainAxisSize.min,
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            columnTemplate(
                                width: 80,
                                header: Transform.scale(
                                  scale: 1.2,
                                  child: Checkbox(
                                    activeColor: Colors.blue,
                                    focusColor: Colors.blue,
                                    side: BorderSide(
                                        width: 1.3,
                                        color:
                                            Color.fromRGBO(112, 112, 112, 1)),
                                    shape: RoundedRectangleBorder(
                                        borderRadius: BorderRadius.all(
                                            Radius.circular(4))),
                                    value: numberCheck == checked.length,
                                    onChanged: (bool? value) {
                                      setState(() {
                                        for (var key in checked.keys)
                                          checked[key] = value!;

                                        numberCheck =
                                            value! ? checked.length : 0;
                                      });
                                    },
                                  ),
                                ),
                                child: ListView.builder(
                                    shrinkWrap: true,
                                    controller: checkboxController,
                                    itemCount: filtered.length,
                                    itemBuilder: (context, index) {
                                      return Container(
                                        height: 45,
                                        padding: EdgeInsets.only(
                                            bottom: 10, top: 10),
                                        decoration: BoxDecoration(
                                            border: Border(
                                                bottom: BorderSide(
                                                    width: 1,
                                                    color: Color.fromARGB(
                                                        255, 233, 233, 233)))),
                                        child: Transform.scale(
                                          scale: 1.2,
                                          child: Checkbox(
                                            activeColor: Colors.blue,
                                            focusColor: Colors.blue,
                                            side: BorderSide(
                                                width: 1.3,
                                                color: Color.fromRGBO(
                                                    112, 112, 112, 1)),
                                            shape: RoundedRectangleBorder(
                                                borderRadius: BorderRadius.all(
                                                    Radius.circular(4))),
                                            value:
                                                checked[filtered[index]['id']],
                                            onChanged: (bool? value) {
                                              setState(() {
                                                checked[filtered[index]['id']] =
                                                    value!;

                                                numberCheck -= value ? -1 : 1;
                                              });
                                            },
                                          ),
                                        ),
                                      );
                                    })),
                            if (columns != null)
                              for (var column in columns!.entries)
                                columnTemplate(
                                    width: column.value['size'], column: column)
                          ]),
                    ),
                  );
                } else {
                  return Expanded(child: kIsWeb ? Loading() : Container());
                }
              },
            ),
          ]),
        ),
      ),
    );
  }

  Widget selectColumns() {
    return Row(
      children: [],
    );
  }

  Widget columnTemplate(
      {MapEntry? column,
      required double width,
      Widget? header,
      Widget? child}) {
    return Container(
      width: width,
      //width: 20,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            height: 40,
            padding: EdgeInsets.only(bottom: 15),
            width: double.infinity,
            decoration: BoxDecoration(
                border: Border(
                    bottom: BorderSide(
                        width: 1, color: Color.fromARGB(255, 233, 233, 233)))),
            child: column != null
                ? Text(
                    column.value['name'].toString().toUpperCase(),
                    style: TextStyle(
                        fontStyle: FontStyle.normal,
                        fontFamily: 'Poppins',
                        fontWeight: FontWeight.w500,
                        color: Color.fromARGB(255, 138, 138, 138),
                        letterSpacing: 1.5,
                        fontSize: 16),
                  )
                : header,
          ),
          Expanded(
            child: ScrollConfiguration(
              behavior:
                  ScrollConfiguration.of(context).copyWith(scrollbars: false),
              child: column != null
                  ? ListView.builder(
                      shrinkWrap: true,
                      controller: column.value['control'],
                      itemCount: filtered.length,
                      itemBuilder: (context, index) {
                        //print(filtered[index]['profilePicture']);

                        if (filtered[index]['profilePicture'] != 'null' &&
                            filtered[index].containsKey('profilePicture') &&
                            !imageData.containsKey(filtered[index]['id'])) {
                          imageData[filtered[index]['id']] =
                              base64Decode(filtered[index]['profilePicture']);
                        }

                        return GestureDetector(
                          onTap: () => Navigator.of(context)
                              .pushNamedAndRemoveUntil(
                                  "/${widget.object}/${filtered[index]['id']}",
                                  (Route<dynamic> route) => false),
                          child: Container(
                              height: 45,
                              padding: column.key == 'profilePicture'
                                  ? EdgeInsets.only(bottom: 6, top: 6)
                                  : EdgeInsets.only(bottom: 10, top: 10),
                              decoration: BoxDecoration(
                                  border: Border(
                                      bottom: BorderSide(
                                          width: 1,
                                          color: Color.fromARGB(
                                              255, 233, 233, 233)))),
                              child: column.key != 'profilePicture'
                                  ? Text(
                                      filtered[index][column.key],
                                      style: TextStyle(
                                          fontFamily: 'Poppins',
                                          color: query != '' &&
                                                  filtered[index][column.key]
                                                      .toLowerCase()
                                                      .contains(
                                                          query.toLowerCase())
                                              ? Colors.blue
                                              : null,
                                          fontSize: 15,
                                          fontWeight: FontWeight.w500),
                                    )
                                  : CircleAvatar(
                                      backgroundColor: filtered[index]
                                                  ['profilePicture'] ==
                                              'null'
                                          ? Colors.brown.shade800
                                          : null,
                                      child: filtered[index]
                                                  ['profilePicture'] !=
                                              'null'
                                          ? Container(
                                              decoration: BoxDecoration(
                                                  shape: BoxShape.circle,
                                                  image: DecorationImage(
                                                      filterQuality:
                                                          FilterQuality.low,
                                                      image: MemoryImage(
                                                        imageData[
                                                            filtered[index]
                                                                ['id']]!,
                                                      ))),
                                            )
                                          : Text(filtered[index]['fullName']
                                              .trim()
                                              .split(' ')
                                              .map((l) => l[0])
                                              .take(2)
                                              .join()))),
                        );
                      },
                    )
                  : child!,
            ),
          ),
        ],
      ),
    );
  }

  Widget button(IconData icon, String label, Function function) {
    return Padding(
      padding: const EdgeInsets.only(left: 10.0),
      child: Material(
        color: Theme.of(context).cardColor,
        child: InkWell(
          borderRadius: BorderRadius.circular(20),
          splashColor: Color.fromARGB(255, 240, 240, 240),
          hoverColor: Color.fromARGB(255, 246, 246, 246),
          onTap: () {
            setState(() {
              function();
            });
          },
          child: Padding(
            padding: EdgeInsets.only(left: 10, right: 10, top: 3),
            child: Column(
              children: [
                Icon(
                  icon,
                  color: Color.fromRGBO(135, 135, 135, 1),
                  size: 30,
                ),
                SizedBox(height: 5),
                Text(label,
                    style: TextStyle(
                        fontSize: 12,
                        color: Color.fromRGBO(135, 135, 135, 1),
                        fontFamily: 'Poppins',
                        fontStyle: FontStyle.normal))
              ],
            ),
          ),
        ),
      ),
    );
  }
}
