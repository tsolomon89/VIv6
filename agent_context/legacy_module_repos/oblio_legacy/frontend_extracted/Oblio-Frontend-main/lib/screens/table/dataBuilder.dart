// import 'package:flutter/widgets.dart';

// class TableBuilder extends StatefulWidget {
//   final String object;
//   const TableBuilder({Key? key, required this.object}) : super(key: key);

//   @override
//   _OblioTableState createState() => _OblioTableState();
// }

// class _OblioTableState extends State<TableBuilder> {
//   @override
//   Widget build(BuildContext context) {
//     return Container();
//   }

//   Widget columnTemplate(
//       {MapEntry? column,
//       required double width,
//       Widget? header,
//       Widget? child}) {
//     return Container(
//       width: width,
//       //width: 20,
//       child: Column(
//         crossAxisAlignment: CrossAxisAlignment.start,
//         children: [
//           Container(
//             height: 40,
//             padding: EdgeInsets.only(bottom: 15),
//             width: double.infinity,
//             decoration: BoxDecoration(
//                 border: Border(
//                     bottom: BorderSide(
//                         width: 1, color: Color.fromARGB(255, 233, 233, 233)))),
//             child: column != null
//                 ? Text(
//                     column.value['name'].toString().toUpperCase(),
//                     style: TextStyle(
//                         fontStyle: FontStyle.normal,
//                         fontFamily: 'Poppins',
//                         fontWeight: FontWeight.w500,
//                         color: Color.fromARGB(255, 138, 138, 138),
//                         letterSpacing: 1.5,
//                         fontSize: 16),
//                   )
//                 : header,
//           ),
//           Expanded(
//             child: ScrollConfiguration(
//               behavior:
//                   ScrollConfiguration.of(context).copyWith(scrollbars: false),
//               child: column != null
//                   ? ListView.builder(
//                       shrinkWrap: true,
//                       controller: column.value['control'],
//                       itemCount: filtered.length,
//                       itemBuilder: (context, index) {
//                         //print(filtered[index]['profilePicture']);

//                         if (filtered[index]['profilePicture'] != 'null' &&
//                             filtered[index].containsKey('profilePicture') &&
//                             !imageData.containsKey(filtered[index]['id'])) {
//                           imageData[filtered[index]['id']] =
//                               base64Decode(filtered[index]['profilePicture']);
//                         }

//                         return GestureDetector(
//                           onTap: () => Navigator.of(context)
//                               .pushNamedAndRemoveUntil(
//                                   "/${widget.object}/${filtered[index]['id']}",
//                                   (Route<dynamic> route) => false),
//                           child: Container(
//                               height: 45,
//                               padding: column.key == 'profilePicture'
//                                   ? EdgeInsets.only(bottom: 6, top: 6)
//                                   : EdgeInsets.only(bottom: 10, top: 10),
//                               decoration: BoxDecoration(
//                                   border: Border(
//                                       bottom: BorderSide(
//                                           width: 1,
//                                           color: Color.fromARGB(
//                                               255, 233, 233, 233)))),
//                               child: column.key != 'profilePicture'
//                                   ? Text(
//                                       filtered[index][column.key],
//                                       style: TextStyle(
//                                           fontFamily: 'Poppins',
//                                           color: query != '' &&
//                                                   filtered[index][column.key]
//                                                       .toLowerCase()
//                                                       .contains(
//                                                           query.toLowerCase())
//                                               ? Colors.blue
//                                               : null,
//                                           fontSize: 15,
//                                           fontWeight: FontWeight.w500),
//                                     )
//                                   : CircleAvatar(
//                                       backgroundColor: Colors.brown.shade800,
//                                       foregroundImage: filtered[index]
//                                                   ['profilePicture'] !=
//                                               'null'
//                                           ? MemoryImage(
//                                               imageData[filtered[index]['id']]!)
//                                           : null,
//                                       child: filtered[index]
//                                                   ['profilePicture'] ==
//                                               'null'
//                                           ? Text(filtered[index]['fullName']
//                                               .trim()
//                                               .split(' ')
//                                               .map((l) => l[0])
//                                               .take(2)
//                                               .join())
//                                           : null,
//                                     )),
//                         );
//                       },
//                     )
//                   : child!,
//             ),
//           ),
//         ],
//       ),
//     );
//   }
// }
