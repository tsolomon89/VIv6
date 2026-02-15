import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:oblio/state/right-menu/mobile_state.dart';
import 'package:oblio/state/right-menu/right_menu_cubit.dart';
import 'package:oblio/state/right-window/right_window_cubit.dart';
import 'package:oblio/widgets/common/oblioListTile.dart';
import 'package:oblio/widgets/right-menu/calendar.dart';
import 'package:oblio/widgets/right-menu/common/dropField.dart';
import 'package:oblio/widgets/right-menu/common/inputField.dart';
import 'package:oblio/widgets/right-menu/common/selectField.dart';

import '../../dummy.dart';
import '../../objects.dart';
import '../accounts/common/dualButtons.dart';
import 'common/radioField.dart';

class RightWindow extends StatefulWidget {
  const RightWindow({Key? key}) : super(key: key);

  @override
  State<RightWindow> createState() => _RightWindowState();
}

class _RightWindowState extends State<RightWindow> {
  // ******For Development ONLY!******* //
  bool showCreate = false;
  //**********DEFAULT: false********** //
  List<TextEditingController> _controllers = [];
  String currentSelection = '';
  bool expandAll = false;
  String currentScreen = '';

  @override
  void dispose() {
    for (TextEditingController c in _controllers) {
      c.dispose();
    }
    super.dispose();
  }

  // Male, Female, Non-binary, Other, Unknown
  @override
  Widget build(BuildContext context) {
    const Map<String, Map<String, List<Map>>> createFormat = {
      'activities': {},
      'contacts': {
        'CONTACT NAME': [
          {
            'type': 'input',
            'label': 'First Name',
            'field': 'firstName',
            'description': "Enter the Contact's first name",
            'required': true
          },
          {
            'type': 'input',
            'label': 'Last Name',
            'field': 'lastName',
            'description': "Enter the Contact's last name",
            'required': true
          }
        ],
        'WORK HISTORY': [
          {
            'type': 'selection',
            'label': 'SELECT WORK HISTORY',
            'field': 'workHistory',
            'data': 'work'
          }
        ],
        'CONTACT LINKS': [
          {
            'type': 'input',
            'label': 'LinkedIn URL',
            'field': 'linkedInURL',
            'description': "Enter the contact's LinkedIn URL",
            'color': Color.fromRGBO(214, 220, 248, 1)
          },
          {
            'type': 'input',
            'label': 'Twitter URL',
            'field': 'twitterURL',
            'description': "Enter the Contact's Twitter URL",
            'color': Color.fromRGBO(214, 220, 248, 1)
          },
          {
            'type': 'input',
            'label': 'Facebook URL',
            'field': 'facebookURL',
            'description': "Enter the Contact's Facebook URL",
          }
        ],
        'DEMOGRAPHICS': [
          {
            'type': 'dropdown',
            'label': 'Gender',
            'field': 'gender',
            'description': "Required",
            'required': true,
            'data': [
              'Female',
              'Male',
              'Non-binary',
              'Other',
              'Prefer not to say'
            ]
          },
          {
            'type': 'input',
            'label': 'Birth Date',
            'field': 'birthDate',
            'description': "Format: DD/MM/YY",
          },
          {
            'type': 'dropdown',
            'label': 'Country',
            'field': 'country',
            'description': "Select the Contact's country",
            'data': [
              'United Kingdom',
              'United States',
              'Portugal',
              'Sweden',
              'Spain',
              'Germany',
              'Afghanistan'
            ]
          },
          {
            'type': 'dropdown',
            'label': 'State / Region',
            'field': 'region',
            'description': "Select the Contact's state or region",
            'data': ['Surrey', 'Greater London']
          },
          {
            'type': 'dropdown',
            'label': 'Age Range',
            'field': 'ageRange',
            'description': "Select the Contact's age range",
            'data': ['18-30', '31-40', '41-50', '51-60', '60+']
          },
          {
            'type': 'input',
            'label': 'City',
            'field': 'city',
            'description': "Enter the Contact's city",
          }
        ]
      },
      'products': {
        '': [
          {
            'type': 'input',
            'label': 'Product Name',
            'field': 'productName',
            'description': "Enter the Product's name",
            'required': true
          },
          {
            'type': 'input',
            'label': 'Product URL',
            'field': 'productURL',
            'description': "Enter the Product's URL",
            'required': true
          }
        ],
        'PRODUCT TYPE': [
          {
            'type': 'radio',
            'data': ['B2B', 'B2C', 'Reseller', 'Partner', 'Investment'],
            'required': true
          },
        ],
        'PRODUCT PRICING': [
          {
            'type': 'dropdown',
            'label': 'Default Currency',
            'field': 'currency',
            'description': "Select the Product's default currency",
            'data': ['GBP', 'USD', 'EUR', 'JPY', 'AUD', 'CAD', 'CHF']
          },
          {
            'type': 'input',
            'label': 'Default Price',
            'field': 'price',
            'description': "Enter the Product's Price",
            'required': true
          },
        ],
        'CONTRACT TYPE': [
          {
            'type': 'radio',
            'data': [
              'Once',
              'Daily',
              'Weekly',
              'Monthly',
              'Annually',
              'Per Unit'
            ],
            'required': true
          },
          {
            'type': 'input',
            'label': 'Duration / Units',
            'field': 'duration',
            'description': "Contract's duration or unit quantity",
            'required': true
          }
        ],
        'BILLING FREQUENCY': [
          {
            'type': 'radio',
            'data': ['None', 'Daily', 'Weekly', 'Monthly', 'Annually'],
            'required': true
          },
        ],
        'PRODUCT PERSONAS': [
          {
            'type': 'selection',
            'label': 'DECISION MAKER PERSONA',
            'field': 'decisionMaker',
            'data': 'work'
          },
          {
            'type': 'selection',
            'label': 'INFLUENCER PERSONA',
            'field': 'influencer',
            'data': 'work'
          },
          {
            'type': 'selection',
            'label': 'END USER PERSONA',
            'field': 'endUserPersona',
            'data': 'work'
          }
        ],
        'PRODUCT FEATURES': [
          {
            'type': 'search',
            'label': 'related features',
            'field': 'relatedFeatures',
            'data': ['Human Resources', 'Marketing', 'Support']
          }
        ],
        'PRODUCT OPPORTUNITIES': [
          {
            'type': 'selection',
            'label': 'MARKETING QUALIFICATION',
            'field': 'endUserPersona',
            'data': 'marketing'
          }
        ]
      }
    };

    const Map<String, List<Map>> createFormat2 = {
      'products': [
        {
          'type': 'input',
          'label': 'Product Name',
          'field': 'productName',
          'description': "Enter the Product's name",
          'required': true
        },
        {
          'type': 'input',
          'label': 'Product URL',
          'field': 'productURL',
          'description': "Enter the Product's URL",
          'required': true
        },
        {'type': 'separator', 'label': 'PRODUCT TYPE', 'name': 'productType'},
        {
          'type': 'radio',
          'data': ['B2B', 'B2C', 'Reseller', 'Partner', 'Investment'],
          'required': true
        },
        {
          'type': 'separator',
          'label': 'PRODUCT PRICING',
          'name': 'productPricing'
        },
        {
          'type': 'dropdown',
          'label': 'Default Currency',
          'field': 'currency',
          'description': "Select the Product's default currency",
          'data': ['GBP', 'USD', 'EUR', 'JPY', 'AUD', 'CAD', 'CHF']
        },
        {
          'type': 'input',
          'label': 'Default Price',
          'field': 'price',
          'description': "Enter the Product's Price",
          'required': true
        },
        {'type': 'separator', 'label': 'CONTRACT TYPE', 'name': 'contractType'},
        {
          'type': 'radio',
          'data': [
            'Once',
            'Daily',
            'Weekly',
            'Monthly',
            'Annually',
            'Per Unit'
          ],
          'required': true
        },
        {
          'type': 'input',
          'label': 'Duration / Units',
          'field': 'duration',
          'description': "Contract's duration or unit quantity",
          'required': true
        },
        {
          'type': 'separator',
          'label': 'BILLING FREQUENCY',
          'name': 'billing',
        },
        {
          'type': 'radio',
          'data': ['None', 'Daily', 'Weekly', 'Monthly', 'Annually'],
          'required': true
        },
        {'type': 'separator', 'label': 'PRODUCT PERSONAS', 'name': 'personas'},
        {
          'type': 'selection',
          'label': 'DECISION MAKER PERSONA',
          'field': 'decisionMaker',
          'data': 'work'
        },
        {
          'type': 'selection',
          'label': 'INFLUENCER PERSONA',
          'field': 'influencer',
          'data': 'work'
        },
        {
          'type': 'selection',
          'label': 'END USER PERSONA',
          'field': 'endUserPersona',
          'data': 'work'
        },
        {'type': 'separator', 'label': 'PRODUCT FEATURES', 'name': 'features'},
        {
          'type': 'search',
          'label': 'END USER PERSONA',
          'field': 'endUserPersona',
          'data': ['Human Resources', 'Marketing', 'Support']
        },
        {'type': 'separator', 'label': 'PRODUCT OPPORTUNITIES', 'name': 'opps'},
        {
          'type': 'selection',
          'label': 'MARKETING QUALIFICATION',
          'field': 'endUserPersona',
          'data': 'work'
        },
      ],
      'contacts': [
        {'type': 'separator', 'label': 'CONTACT NAME'},
        {
          'type': 'input',
          'label': 'First Name',
          'field': 'firstName',
          'description': "Enter the Contact's first name",
          'required': true
        },
        {
          'type': 'input',
          'label': 'Last Name',
          'field': 'lastName',
          'description': "Enter the Contact's last name",
          'required': true
        },
        {'type': 'separator', 'label': 'WORK HISTORY'},
        {
          'type': 'selection',
          'label': 'SELECT WORK HISTORY',
          'field': 'workHistory',
          'data': 'work'
        },
        {'type': 'separator', 'label': 'CONTACT LINKS'},
        {
          'type': 'input',
          'label': 'LinkedIn URL',
          'field': 'linkedInURL',
          'description': "Enter the contact's LinkedIn URL",
          'color': Color.fromRGBO(214, 220, 248, 1)
        },
        {
          'type': 'input',
          'label': 'Twitter URL',
          'field': 'twitterURL',
          'description': "Enter the Contact's Twitter URL",
          'color': Color.fromRGBO(214, 220, 248, 1)
        },
        {
          'type': 'input',
          'label': 'Facebook URL',
          'field': 'facebookURL',
          'description': "Enter the Contact's Facebook URL",
        },
        {'type': 'separator', 'label': 'DEMOGRAPHICS'},
        {
          'type': 'dropdown',
          'label': 'Gender',
          'field': 'gender',
          'description': "Required",
          'required': true,
          'data': ['Female', 'Male', 'Non-binary', 'Other', 'Prefer not to say']
        },
        {
          'type': 'input',
          'label': 'Birth Date',
          'field': 'birthDate',
          'description': "Format: DD/MM/YY",
        },
        {
          'type': 'dropdown',
          'label': 'Country',
          'field': 'country',
          'description': "Select the Contact's country",
          'data': [
            'United Kingdom',
            'United States',
            'Portugal',
            'Sweden',
            'Spain',
            'Germany',
            'Afghanistan'
          ]
        },
        {
          'type': 'dropdown',
          'label': 'State / Region',
          'field': 'region',
          'description': "Select the Contact's state or region",
          'data': ['Surrey', 'Greater London']
        },
        {
          'type': 'dropdown',
          'label': 'Age Range',
          'field': 'ageRange',
          'description': "Select the Contact's age range",
          'data': ['18-30', '31-40', '41-50', '51-60', '60+']
        },
        {
          'type': 'input',
          'label': 'City',
          'field': 'city',
          'description': "Enter the Contact's city",
        },
      ]
    };

    double width = MediaQuery.of(context).size.width;

    //TODO: These states can be merged, and windowState should be removed
    return BlocBuilder<MobileState, bool>(builder: (context, mobileState) {
      //print(currentScreen);
      return BlocBuilder<RightMenuCubit, String>(
        builder: (context, menuState) {
          //TODO: fix this workaround
          if (currentScreen != menuState) {
            showCreate = false;
          }

          currentScreen = menuState;
          // ******For Development ONLY!******* //
          //menuState = 'products';
          //********************************** //

          var valid = ['contacts', 'activities', 'products'];
          var records = [];

          if (menuState != '' && valid.contains(menuState)) {
            records = Database.data[menuState]!.length > 20
                ? Database.data[menuState]!.sublist(0, 20)
                : Database.data[menuState]!;
          }

          return BlocBuilder<RightWindowCubit, bool>(
            builder: (context, windowState) {
              // ******For Development ONLY!******* //
              //windowState = true;
              //********************************** //

              return windowState
                  ? width < 470
                      ? Expanded(
                          child: glassPane(
                              menuState,
                              records,
                              valid.contains(menuState)
                                  ? createFormat[menuState]!
                                  : {},
                              width))
                      : glassPane(
                          menuState,
                          records,
                          valid.contains(menuState)
                              ? createFormat[menuState]!
                              : {},
                          width)
                  : Container();
            },
          );
        },
      );
    });
  }

  Widget glassPane(menuState, records,
      Map<String, List<Map<dynamic, dynamic>>> createFormat, width) {
    return Container(
      color: Color.fromRGBO(255, 254, 254, 1),
      width: width < 470 ? null : 350,
      child: Column(children: [
        Container(
          padding: EdgeInsets.only(top: 20, bottom: 10, left: 10, right: 10),
          child: Row(children: [
            !showCreate
                ? Objects.crudItems[menuState]!['header'] != null
                    ? InkWell(
                        onTap: () {
                          setState(() {
                            showCreate = true;
                          });
                        },
                        child: Text(
                          '+ ' + Objects.crudItems[menuState]!['header'],
                          style: TextStyle(
                              fontFamily: 'Poppins',
                              fontSize: 16,
                              fontStyle: FontStyle.normal,
                              color: Objects.crudItems[menuState]!['color']),
                        ),
                      )
                    : Container()
                : InkWell(
                    onTap: () {
                      setState(() {
                        showCreate = false;
                      });
                    },
                    child: Icon(Icons.arrow_back),
                  ),
            Spacer(),
            if (showCreate)
              InkWell(
                  onTap: () {
                    setState(() {
                      expandAll = !expandAll;
                    });
                  },
                  child: Container(
                      padding: EdgeInsets.only(right: 10),
                      child: Icon(Icons.unfold_more))),
            !showCreate ? Icon(Icons.more_vert) : Icon(Icons.delete),
            Container(
              padding: EdgeInsets.only(left: 10, right: 10),
              child: InkWell(
                onTap: () {
                  context.read<RightWindowCubit>().hide();
                  context.read<RightMenuCubit>().setValue('');
                },
                child: Icon(
                  Icons.close,
                  color: Color.fromARGB(255, 148, 148, 148),
                  size: 25,
                ),
              ),
            ),
          ]),
        ),
        Divider(),
        menuState == 'calendar'
            ? Calendar()
            : Expanded(
                child: !showCreate
                    ? records.length > 0
                        ? ListView.builder(
                            shrinkWrap: true,
                            controller: new ScrollController(),
                            itemCount: records.length,
                            itemBuilder: (context, index) {
                              return OblioTile(
                                  underline: true,
                                  object: menuState,
                                  data: records[index]);
                            },
                          )
                        : Center(
                            child: Text(
                              'No Data Available!',
                              style: TextStyle(
                                  color: Color.fromARGB(255, 126, 126, 126),
                                  fontFamily: 'Poppins',
                                  fontStyle: FontStyle.normal,
                                  fontWeight: FontWeight.w600,
                                  fontSize: 18),
                            ),
                          )
                    : Container(
                        padding: EdgeInsets.only(left: 20, right: 20),
                        width: double.infinity,
                        child: FocusTraversalGroup(
                          child: Form(
                            child: ListView.builder(
                                shrinkWrap: true,
                                controller: new ScrollController(),
                                itemCount: createFormat.length,
                                itemBuilder: (context, index) {
                                  var keys = createFormat.keys;
                                  var title = keys.elementAt(index);

                                  return Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.center,
                                    mainAxisAlignment: MainAxisAlignment.start,
                                    children: [
                                      if (index > 0) Divider(height: 40),
                                      if (title != '')
                                        Padding(
                                          padding: EdgeInsets.only(
                                              top: index > 0 ? 0 : 10,
                                              bottom: 0),
                                          child: InkWell(
                                            onTap: () {
                                              setState(() {
                                                currentSelection =
                                                    currentSelection == title
                                                        ? ''
                                                        : title;
                                              });
                                            },
                                            child: Row(
                                              children: [
                                                Text(
                                                  title,
                                                  style: TextStyle(
                                                      fontSize: 14,
                                                      fontFamily: 'Poppins',
                                                      fontStyle:
                                                          FontStyle.normal,
                                                      letterSpacing: 1.4,
                                                      fontWeight:
                                                          FontWeight.w400),
                                                ),
                                                Spacer(),
                                                Icon(currentSelection != title
                                                    ? Icons.expand_more
                                                    : Icons.expand_less)
                                              ],
                                            ),
                                          ),
                                        ),
                                      for (var item in createFormat.values
                                          .elementAt(index))
                                        AnimatedOpacity(
                                          opacity: currentSelection == title ||
                                                  title == '' ||
                                                  expandAll
                                              ? 1.0
                                              : 0.0,
                                          duration:
                                              const Duration(milliseconds: 200),
                                          child: Visibility(
                                            visible:
                                                currentSelection == title ||
                                                    title == '' ||
                                                    expandAll,
                                            child: Padding(
                                              padding: const EdgeInsets.only(
                                                  top: 14),
                                              child: item['type'] == 'selection'
                                                  ? SelectField(
                                                      object: item['data'],
                                                      title: item['label'])
                                                  : item['type'] == 'dropdown'
                                                      ? DropField(
                                                          description: item[
                                                              'description'],
                                                          hint: item['label'],
                                                          values: item['data'])
                                                      : item['type'] == 'radio'
                                                          ? RadioField(
                                                              values:
                                                                  item['data'],
                                                            )
                                                          : InputField(
                                                              searchData: item[
                                                                          'type'] ==
                                                                      'search'
                                                                  ? item['data']
                                                                  : null,
                                                              hint:
                                                                  item['label'],
                                                              description: item[
                                                                  'description'],
                                                              fillColor: item[
                                                                  'color']),
                                            ),
                                          ),
                                        ),
                                      if (index == createFormat.length - 1)
                                        SizedBox(height: 20)
                                    ],
                                  );

                                  // if (val('type') == 'input')
                                  //   _controllers
                                  //       .add(new TextEditingController());

                                  // return val('type') == 'separator'
                                  //     ? Column(
                                  //         crossAxisAlignment:
                                  //             CrossAxisAlignment.start,
                                  //         mainAxisAlignment:
                                  //             MainAxisAlignment.start,
                                  //         children: [
                                  //           if (index > 0) Divider(height: 40),
                                  //           Padding(
                                  //             padding: EdgeInsets.only(
                                  //                 top: index > 0 ? 0 : 10,
                                  //                 bottom: 10),
                                  //             child: GestureDetector(
                                  //               onTap: () {
                                  //                 setState(() {});
                                  //               },
                                  //               child: Row(
                                  //                 children: [
                                  //                   Text(
                                  //                     val('label'),
                                  //                     style: TextStyle(
                                  //                         fontSize: 14,
                                  //                         fontFamily: 'Poppins',
                                  //                         fontStyle:
                                  //                             FontStyle.normal,
                                  //                         letterSpacing: 1.4,
                                  //                         fontWeight:
                                  //                             FontWeight.w400),
                                  //                   ),
                                  //                   Spacer(),
                                  //                   Icon(Icons.expand_more)
                                  //                 ],
                                  //               ),
                                  //             ),
                                  //           ),
                                  //         ],
                                  //       )
                                  //     : Padding(
                                  //         padding:
                                  //             const EdgeInsets.only(top: 14),
                                  //         child: val('type') == 'selection'
                                  //             ? SelectField(
                                  //                 object: 'work',
                                  //                 title: val('label'))
                                  //             : val('type') == 'dropdown'
                                  //                 ? DropField(
                                  //                     description:
                                  //                         val('description'),
                                  //                     hint: val('label'),
                                  //                     values: val('data'))
                                  //                 : val('type') == 'radio'
                                  //                     ? RadioField(
                                  //                         values: val('data'),
                                  //                       )
                                  //                     : InputField(
                                  //                         hint: val('label'),
                                  //                         description: val(
                                  //                             'description'),
                                  //                         fillColor:
                                  //                             val('color')),
                                  //       );

                                  //Your code here
                                }),
                          ),
                        )),
              ),
        if (showCreate) Divider(height: 0),
        if (showCreate)
          Padding(
            padding: const EdgeInsets.all(15.0),
            child: DualButton(leftLabel: 'CLEAR', rightLabel: 'SAVE'),
          ),
      ]),
    );
  }
}

// ListView.builder(
//                                 shrinkWrap: true,
//                                 controller: new ScrollController(),
//                                 itemCount: createFormat.length,
//                                 itemBuilder: (context, index) {
//                                   val(field) => createFormat[index][field];

//                                   if (val('type') == 'input')
//                                     _controllers
//                                         .add(new TextEditingController());

//                                   return val('type') == 'separator'
//                                       ? Column(
//                                           crossAxisAlignment:
//                                               CrossAxisAlignment.start,
//                                           mainAxisAlignment:
//                                               MainAxisAlignment.start,
//                                           children: [
//                                             if (index > 0) Divider(height: 40),
//                                             Padding(
//                                               padding: EdgeInsets.only(
//                                                   top: index > 0 ? 0 : 10,
//                                                   bottom: 10),
//                                               child: GestureDetector(
//                                                 onTap: () {
//                                                   setState(() {});
//                                                 },
//                                                 child: Row(
//                                                   children: [
//                                                     Text(
//                                                       val('label'),
//                                                       style: TextStyle(
//                                                           fontSize: 14,
//                                                           fontFamily: 'Poppins',
//                                                           fontStyle:
//                                                               FontStyle.normal,
//                                                           letterSpacing: 1.4,
//                                                           fontWeight:
//                                                               FontWeight.w400),
//                                                     ),
//                                                     Spacer(),
//                                                     Icon(Icons.expand_more)
//                                                   ],
//                                                 ),
//                                               ),
//                                             ),
//                                           ],
//                                         )
//                                       : Padding(
//                                           padding:
//                                               const EdgeInsets.only(top: 14),
//                                           child: val('type') == 'selection'
//                                               ? SelectField(
//                                                   object: 'work',
//                                                   title: val('label'))
//                                               : val('type') == 'dropdown'
//                                                   ? DropField(
//                                                       description:
//                                                           val('description'),
//                                                       hint: val('label'),
//                                                       values: val('data'))
//                                                   : val('type') == 'radio'
//                                                       ? RadioField(
//                                                           values: val('data'),
//                                                         )
//                                                       : InputField(
//                                                           hint: val('label'),
//                                                           description: val(
//                                                               'description'),
//                                                           fillColor:
//                                                               val('color')),
//                                         );

//                                   //Your code here
//                                 }),