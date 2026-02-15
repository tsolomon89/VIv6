import 'package:flutter/material.dart';
import 'package:oblio/widgets/right-menu/common/inputField.dart';
import 'package:oblio/widgets/right-menu/common/rangeField.dart';

class SelectField extends StatefulWidget {
  /// The Oblio object type for the selection widget (accounts, history, etc...)
  final String object;

  /// Background colour for the input field
  final String title;

  const SelectField({Key? key, required this.object, required this.title})
      : super(key: key);

  @override
  State<SelectField> createState() => _SelectFieldState();
}

class _SelectFieldState extends State<SelectField> {
  List<Map> selected = [];
  bool expanded = false;
  bool creating = false;

  EdgeInsets global = EdgeInsets.only(left: 10, right: 10);

  Map objects = {
    'work': {
      'empty': 'No work history selected!',
      'label': 'WORK HISTORY',
      'fields': [
        {'type': 'separator', 'label': 'WORK HISTORY'},
        {
          'type': 'search',
          'label': 'Accounts',
          'field': 'accounts',
          'controller': TextEditingController(),
          'required': true
        },
        {
          'type': 'search',
          'label': 'Job Titles',
          'field': 'jobTitles',
          'controller': TextEditingController(),
          'required': true
        },
        {
          'type': 'range',
          'field': 'dateRange',
          'data': 'date',
          'controller': TextEditingController(),
          'required': true
        }
      ]
    }
  };

  saveList() {
    setState(() {
      selected = [];
    });
  }

  @override
  Widget build(BuildContext context) {
    //print(widget.object);
    var fields = widget.object == 'marketing'
        ? []
        : (objects[widget.object]['fields'] as List<Map>);

    return Container(
      height: expanded
          ? widget.object == 'marketing'
              ? 565
              : 400
          : null,
      decoration: BoxDecoration(
          border:
              Border.all(color: Color.fromARGB(255, 200, 200, 200), width: 1),
          borderRadius: BorderRadius.all(Radius.circular(5))),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            height: 50,
            padding: global,
            child: InkWell(
              onTap: () => setState(() {
                expanded = !expanded;
              }),
              child: Row(
                children: [
                  Text(
                    widget.title,
                    style: TextStyle(
                        fontSize: 15,
                        color: Color.fromARGB(255, 121, 121, 121),
                        fontFamily: 'Poppins',
                        letterSpacing: 1.3,
                        fontStyle: FontStyle.normal,
                        fontWeight: FontWeight.w500),
                  ),
                  Spacer(),
                  Icon(expanded ? Icons.expand_less : Icons.expand_more)
                ],
              ),
            ),
          ),
          Visibility(
              visible: expanded,
              child: Expanded(
                child: !creating
                    ? Column(
                        children: [
                          Divider(
                            height: 1,
                          ),
                          Row(
                            children: [
                              Expanded(
                                child: TextField(
                                  decoration: new InputDecoration(
                                      focusedBorder: InputBorder.none,
                                      enabledBorder: InputBorder.none,
                                      border: InputBorder.none,
                                      suffixIcon: Icon(Icons.search),
                                      hintText: 'SEARCH'),
                                ),
                              ),
                            ],
                          ),
                          Divider(height: 1),
                          widget.object == 'marketing'
                              ? fake()
                              : Expanded(
                                  child: Container(
                                    padding: EdgeInsets.only(
                                        top: 5, left: 10, right: 10),
                                    child: selected.length == 0
                                        ? Center(
                                            child: Text(
                                            objects[widget.object]['empty'],
                                            style: TextStyle(
                                              fontFamily: 'Poppins',
                                              fontStyle: FontStyle.normal,
                                              fontSize: 13,
                                            ),
                                          ))
                                        : ListView.builder(
                                            itemCount: selected.length,
                                            itemBuilder:
                                                (context, constraints) {
                                              return Container();
                                            }),
                                  ),
                                ),
                          Divider(height: 1),
                          if (widget.object != 'marketing') bottomRow()
                        ],
                      )
                    : Column(
                        children: [
                          Expanded(
                            child: Padding(
                              padding:
                                  EdgeInsets.only(top: 5, left: 10, right: 10),
                              child: ListView.builder(
                                  itemCount: fields.length * 2,
                                  itemBuilder: (context, index) {
                                    var old = index;
                                    if (index >= fields.length)
                                      index = index - fields.length;

                                    return fields[index]['type'] == 'separator'
                                        ? Padding(
                                            padding: EdgeInsets.only(
                                                top: old != 0 ? 30 : 5,
                                                bottom: 10),
                                            child: Text(
                                              fields[index]['label'],
                                              style: TextStyle(
                                                  fontSize: 12,
                                                  fontFamily: 'Poppins',
                                                  fontWeight: FontWeight.w500,
                                                  fontStyle: FontStyle.normal),
                                            ),
                                          )
                                        : fields[index]['type'] == 'range'
                                            ? Padding(
                                                padding: const EdgeInsets.only(
                                                    top: 5.0),
                                                child: RangeField(
                                                    leftHint: 'start',
                                                    rightHint: 'present'),
                                              )
                                            : Padding(
                                                padding:
                                                    EdgeInsets.only(bottom: 10),
                                                child: InputField(
                                                    isMinimal: true,
                                                    searchData: [
                                                      'account1',
                                                      'account2'
                                                    ],
                                                    hint: fields[index]
                                                        ['label']),
                                              );
                                  }),
                            ),
                          ),
                          Divider(height: 1),
                          bottomRow()
                        ],
                      ),
              ))
        ],
      ),
    );
  }

  Widget fake() {
    return Container(
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.start,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Checkbox(
                  activeColor: Color.fromRGBO(98, 113, 210, 1),
                  value: true,
                  onChanged: (value) {}),
              Container(
                margin: EdgeInsets.only(left: 5),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.start,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    SizedBox(
                      height: 10,
                    ),
                    Text(
                      'PERSONA MATCH',
                      style: TextStyle(
                          fontStyle: FontStyle.normal,
                          fontFamily: 'Poppins',
                          letterSpacing: 1.2,
                          fontWeight: FontWeight.w400,
                          fontSize: 11,
                          color: Color.fromARGB(255, 87, 87, 87)),
                    ),
                    Text(
                      'EQUAL TO | GREATER THAN 60%',
                      style: TextStyle(
                          fontStyle: FontStyle.normal,
                          fontFamily: 'Poppins',
                          letterSpacing: 1.2,
                          fontWeight: FontWeight.w400,
                          fontSize: 10,
                          color: Color.fromARGB(255, 131, 131, 131)),
                    )
                  ],
                ),
              )
            ],
          ),
          Row(
            mainAxisAlignment: MainAxisAlignment.start,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Checkbox(
                  activeColor: Color.fromRGBO(98, 113, 210, 1),
                  value: true,
                  onChanged: (value) {}),
              Container(
                margin: EdgeInsets.only(left: 5),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.start,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    SizedBox(
                      height: 10,
                    ),
                    Text(
                      'GDPR OPT-IN',
                      style: TextStyle(
                          fontStyle: FontStyle.normal,
                          fontFamily: 'Poppins',
                          letterSpacing: 1.2,
                          fontWeight: FontWeight.w400,
                          fontSize: 11,
                          color: Color.fromARGB(255, 87, 87, 87)),
                    ),
                    Text(
                      'EQUAL TO TRUE | < 60 DAYS',
                      style: TextStyle(
                          fontStyle: FontStyle.normal,
                          fontFamily: 'Poppins',
                          letterSpacing: 1.2,
                          fontWeight: FontWeight.w400,
                          fontSize: 10,
                          color: Color.fromARGB(255, 131, 131, 131)),
                    )
                  ],
                ),
              )
            ],
          ),
          Row(
            mainAxisAlignment: MainAxisAlignment.start,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Checkbox(
                  activeColor: Color.fromRGBO(98, 113, 210, 1),
                  value: true,
                  onChanged: (value) {}),
              Container(
                margin: EdgeInsets.only(left: 5),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.start,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    SizedBox(
                      height: 10,
                    ),
                    Text(
                      'CONTACT REGISTRATION',
                      style: TextStyle(
                          fontStyle: FontStyle.normal,
                          fontFamily: 'Poppins',
                          letterSpacing: 1.2,
                          fontWeight: FontWeight.w400,
                          fontSize: 11,
                          color: Color.fromARGB(255, 87, 87, 87)),
                    ),
                    Text(
                      'EQUAL TO TRUE',
                      style: TextStyle(
                          fontStyle: FontStyle.normal,
                          fontFamily: 'Poppins',
                          letterSpacing: 1.2,
                          fontWeight: FontWeight.w400,
                          fontSize: 10,
                          color: Color.fromARGB(255, 131, 131, 131)),
                    )
                  ],
                ),
              )
            ],
          ),
          Row(
            mainAxisAlignment: MainAxisAlignment.start,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Checkbox(
                  activeColor: Color.fromRGBO(98, 113, 210, 1),
                  value: true,
                  onChanged: (value) {}),
              Container(
                margin: EdgeInsets.only(left: 5),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.start,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    SizedBox(
                      height: 10,
                    ),
                    Text(
                      'EMAIL LIST SUBSCRIPTION',
                      style: TextStyle(
                          fontStyle: FontStyle.normal,
                          fontFamily: 'Poppins',
                          letterSpacing: 1.2,
                          fontWeight: FontWeight.w400,
                          fontSize: 11,
                          color: Color.fromARGB(255, 87, 87, 87)),
                    ),
                    Text(
                      'EQUAL TO TRUE',
                      style: TextStyle(
                          fontStyle: FontStyle.normal,
                          fontFamily: 'Poppins',
                          letterSpacing: 1.2,
                          fontWeight: FontWeight.w400,
                          fontSize: 10,
                          color: Color.fromARGB(255, 131, 131, 131)),
                    )
                  ],
                ),
              )
            ],
          ),
          Divider(height: 0),
          Container(
            child: Container(
              padding: EdgeInsets.all(10),
              child: Row(
                children: [
                  Text('4 selected',
                      style: TextStyle(
                          fontStyle: FontStyle.normal,
                          fontFamily: 'Poppins',
                          fontWeight: FontWeight.w600,
                          fontSize: 12,
                          color: Color.fromRGBO(144, 143, 147, 1))),
                  Spacer(),
                  Text('CLEAR ALL',
                      style: TextStyle(
                          fontStyle: FontStyle.normal,
                          fontFamily: 'Poppins',
                          fontWeight: FontWeight.w400,
                          fontSize: 13,
                          color: Color.fromRGBO(96, 121, 228, 1)))
                ],
              ),
            ),
          ),
          Divider(height: 0),
          SizedBox(height: 10),
          Container(
            padding: EdgeInsets.only(right: 14, left: 10),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.start,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  margin: EdgeInsets.only(left: 5),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.start,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      SizedBox(
                        height: 10,
                      ),
                      Text(
                        'PERSONA MATCH',
                        style: TextStyle(
                            fontStyle: FontStyle.normal,
                            fontFamily: 'Poppins',
                            letterSpacing: 1.2,
                            fontWeight: FontWeight.w400,
                            fontSize: 11,
                            color: Color.fromARGB(255, 87, 87, 87)),
                      ),
                      Text(
                        'EQUAL TO | GREATER THAN 60%',
                        style: TextStyle(
                            fontStyle: FontStyle.normal,
                            fontFamily: 'Poppins',
                            letterSpacing: 1.2,
                            fontWeight: FontWeight.w400,
                            fontSize: 10,
                            color: Color.fromARGB(255, 131, 131, 131)),
                      )
                    ],
                  ),
                ),
                Spacer(),
                Container(
                  margin: EdgeInsets.only(top: 10),
                  child: Icon(
                    Icons.remove_circle,
                    size: 20,
                    color: Color.fromRGBO(174, 180, 185, 1),
                  ),
                )
              ],
            ),
          ),
          SizedBox(height: 10),
          Container(
            padding: EdgeInsets.only(right: 14, left: 10),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.start,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  margin: EdgeInsets.only(left: 5),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.start,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      SizedBox(
                        height: 10,
                      ),
                      Text(
                        'GDPR OPT-IN',
                        style: TextStyle(
                            fontStyle: FontStyle.normal,
                            fontFamily: 'Poppins',
                            letterSpacing: 1.2,
                            fontWeight: FontWeight.w400,
                            fontSize: 11,
                            color: Color.fromARGB(255, 87, 87, 87)),
                      ),
                      Text(
                        'EQUAL TO TRUE | LESS THAN 60%',
                        style: TextStyle(
                            fontStyle: FontStyle.normal,
                            fontFamily: 'Poppins',
                            letterSpacing: 1.2,
                            fontWeight: FontWeight.w400,
                            fontSize: 10,
                            color: Color.fromARGB(255, 131, 131, 131)),
                      )
                    ],
                  ),
                ),
                Spacer(),
                Container(
                  margin: EdgeInsets.only(top: 10),
                  child: Icon(
                    Icons.remove_circle,
                    size: 20,
                    color: Color.fromRGBO(174, 180, 185, 1),
                  ),
                )
              ],
            ),
          ),
          SizedBox(height: 10),
          Container(
            padding: EdgeInsets.only(right: 14, left: 10),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.start,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  margin: EdgeInsets.only(left: 5),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.start,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      SizedBox(
                        height: 10,
                      ),
                      Text(
                        'CONTACT REGISTRATION',
                        style: TextStyle(
                            fontStyle: FontStyle.normal,
                            fontFamily: 'Poppins',
                            letterSpacing: 1.2,
                            fontWeight: FontWeight.w400,
                            fontSize: 11,
                            color: Color.fromARGB(255, 87, 87, 87)),
                      ),
                      Text(
                        'EQUAL TO TRUE',
                        style: TextStyle(
                            fontStyle: FontStyle.normal,
                            fontFamily: 'Poppins',
                            letterSpacing: 1.2,
                            fontWeight: FontWeight.w400,
                            fontSize: 10,
                            color: Color.fromARGB(255, 131, 131, 131)),
                      )
                    ],
                  ),
                ),
                Spacer(),
                Container(
                  margin: EdgeInsets.only(top: 10),
                  child: Icon(
                    Icons.remove_circle,
                    size: 20,
                    color: Color.fromRGBO(174, 180, 185, 1),
                  ),
                )
              ],
            ),
          ),
          SizedBox(height: 10),
          Container(
            padding: EdgeInsets.only(right: 14, left: 10),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.start,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  margin: EdgeInsets.only(left: 5),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.start,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      SizedBox(
                        height: 10,
                      ),
                      Text(
                        'EMAIL LIST SUBSCRIPTION',
                        style: TextStyle(
                            fontStyle: FontStyle.normal,
                            fontFamily: 'Poppins',
                            letterSpacing: 1.2,
                            fontWeight: FontWeight.w400,
                            fontSize: 11,
                            color: Color.fromARGB(255, 87, 87, 87)),
                      ),
                      Text(
                        'EQUAL TO TRUE',
                        style: TextStyle(
                            fontStyle: FontStyle.normal,
                            fontFamily: 'Poppins',
                            letterSpacing: 1.2,
                            fontWeight: FontWeight.w400,
                            fontSize: 10,
                            color: Color.fromARGB(255, 131, 131, 131)),
                      )
                    ],
                  ),
                ),
                Spacer(),
                Container(
                  margin: EdgeInsets.only(top: 10),
                  child: Icon(
                    Icons.remove_circle,
                    size: 20,
                    color: Color.fromRGBO(174, 180, 185, 1),
                  ),
                ),
              ],
            ),
          ),
          SizedBox(height: 15),
        ],
      ),
    );
  }

  Widget bottomRow() {
    return Container(
      height: 40,
      padding: global,
      child: Row(
        children: [
          InkWell(
            onTap: () {
              setState(() {
                creating = !creating;
              });
            },
            child: Text(
                '${creating ? 'SAVE' : '+ ADD'} ${objects[widget.object]['label']}',
                style: TextStyle(
                    fontSize: 13,
                    color: Color.fromRGBO(127, 147, 234, 1),
                    fontFamily: 'Poppins',
                    letterSpacing: 1.3,
                    fontStyle: FontStyle.normal,
                    fontWeight: FontWeight.w500)),
          ),
          Spacer(),
          Text('CLEAR',
              style: TextStyle(
                  fontSize: 13,
                  color: Color.fromRGBO(105, 128, 229, 1),
                  fontFamily: 'Poppins',
                  letterSpacing: 1.3,
                  fontStyle: FontStyle.normal,
                  fontWeight: FontWeight.w500))
        ],
      ),
    );
  }
}
