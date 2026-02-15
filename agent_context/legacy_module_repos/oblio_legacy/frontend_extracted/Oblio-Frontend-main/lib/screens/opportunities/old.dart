// Expanded(
            //   child: SingleChildScrollView(
            //     scrollDirection: Axis.vertical,
            //     controller: new ScrollController(),
            //     child: Scrollbar(
            //       isAlwaysShown: false,
            //       controller: horizontalScroll,
            //       scrollbarOrientation: ScrollbarOrientation.top,
            //       child: SingleChildScrollView(
            //         scrollDirection: Axis.horizontal,
            //         controller: horizontalScroll,
            // child: DataTable(
            //   columns: <DataColumn>[
            //     DataColumn(
            //         label: Transform.scale(
            //       scale: 1.2,
            //       child: Checkbox(
            //         activeColor: Colors.blue,
            //         focusColor: Colors.blue,
            //         side: BorderSide(
            //             width: 1.3,
            //             color: Color.fromRGBO(112, 112, 112, 1)),
            //         shape: RoundedRectangleBorder(
            //             borderRadius:
            //                 BorderRadius.all(Radius.circular(4))),
            //         value: numberCheck == checked.length,
            //         onChanged: (bool? value) {
            //           setState(() {
            //             for (var key in checked.keys)
            //               checked[key] = false;

            //             numberCheck = value! ? checked.length : 0;
            //           });
            //         },
            //       ),
            //     )),
            //     DataColumn(
            //       label: Text(''),
            //     ),
            //     for (var item in columns.values)
            //       DataColumn(
            //         label: Text(
            //           item.toUpperCase(),
            //           style: TextStyle(
            //               fontStyle: FontStyle.normal,
            //               fontFamily: 'Poppins',
            //               fontWeight: FontWeight.w500,
            //               letterSpacing: 1.5,
            //               fontSize: 16),
            //         ),
            //       )
            //   ],
            //   rows: <DataRow>[
            //     for (var i = 0; i < filtered.length; i++)
            //       DataRow(
            //         //selected: checked[contacts[i]['id']]!,
            //         cells: <DataCell>[
            //           ...[
            //             // DataCell(
            //             //   InkWell(
            //             //     onTap: () => setState(() {
            //             //       checked[contacts[i]['id']] =
            //             //           !checked[contacts[i]['id']]!;
            //             //     }),
            //             //     child: Container(
            //             //         decoration: BoxDecoration(
            //             //             border:
            //             //                 Border.all(color: Colors.grey),
            //             //             borderRadius: BorderRadius.all(
            //             //                 Radius.circular(10.0))),
            //             //         child: new Center(
            //             //           child: Visibility(
            //             //               visible:
            //             //                   checked[contacts[i]['id']]!,
            //             //               child: new Icon(Icons.done)),
            //             //         )),
            //             //   ),
            //             // ),
            //             DataCell(Transform.scale(
            //               scale: 1.2,
            //               child: Theme(
            //                 data: ThemeData(
            //                   unselectedWidgetColor: Color.fromRGBO(
            //                       112, 112, 112, 1), // Your color
            //                 ),
            //                 child: Checkbox(
            //                   activeColor: Colors.blue,
            //                   focusColor: Colors.blue,
            //                   side: BorderSide(
            //                       width: 1.3,
            //                       color:
            //                           Color.fromRGBO(112, 112, 112, 1)),
            //                   shape: RoundedRectangleBorder(
            //                       borderRadius: BorderRadius.all(
            //                           Radius.circular(4))),
            //                   value: checked[contacts[i]['id']],
            //                   onChanged: (bool? value) {
            //                     setState(() {
            //                       checked[contacts[i]['id']] = value!;
            //                       numberCheck += value == true ? 1 : -1;
            //                     });
            //                   },
            //                 ),
            //               ),
            //             )),
            //             DataCell(
            //               CircleAvatar(
            //                 backgroundColor: Colors.brown.shade800,
            //                 child: const Text('AH'),
            //                 // backgroundImage: AssetImage(
            //                 //     'lib/assets/images/people/' +
            //                 //         filtered[i]['fullName'] +
            //                 //         '.png'),
            //               ),
            //             ),
            //             for (var item in columns.keys)
            //               DataCell(Text(
            //                 filtered[i][item],
            //                 style: TextStyle(
            //                     fontFamily: 'Poppins',
            //                     fontStyle: FontStyle.normal,
            //                     color: query != '' &&
            //                             filtered[i][item]
            //                                 .toString()
            //                                 .toLowerCase()
            //                                 .contains(
            //                                     query.toLowerCase())
            //                         ? Colors.blue
            //                         : null,
            //                     fontSize: 15,
            //                     fontWeight: FontWeight.w500),
            //               )),
            //           ]
            //         ],
            //       )
            //   ],
            // ),
            //       ),
            //     ),
            //   ),
            // )