import 'dart:convert';
import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:oblio/mixin.dart';
import 'package:oblio/theme/oblioTheme.dart';
import 'package:oblio/widgets/common/chip.dart';
import 'package:oblio/widgets/common/hearts.dart';
import 'package:oblio/widgets/common/pipeline.dart';
import 'package:percent_indicator/percent_indicator.dart';
import 'package:oblio/objects.dart';

class OblioTile extends StatefulWidget {
  /// Every tile requires a related Oblio object (accounts, users, etc...)
  final String object;

  /// Data passed into oblioTile determines the layout of the widget.
  final Map data;

  /// Setting this value as True prevents the tile from showing
  final bool hideTitle;

  /// Setting this value as True prevents the subtitle from showing
  final bool hideSubtitle;

  /// Setting this value as True prevents the bottom text from showing
  final bool hideBody;

  /// Index of the tile in a list
  final int? index;

  /// Default: false. Larger version of the list tile!
  final bool grow;

  /// Pass children to make the tile expandable!
  final List<Widget> children;

  /// Default: false. Displays a divider underneath the tile's body
  final bool underline;

  /// Default: false. Tile can also be used to show specific record details!
  final bool detailed;

  const OblioTile(
      {Key? key,
      required this.object,
      required this.data,
      this.hideTitle = false,
      this.hideSubtitle = false,
      this.hideBody = false,
      this.index,
      this.children = const [],
      this.grow = false,
      this.detailed = false,
      this.underline = false})
      : super(key: key);

  @override
  _OblioTileState createState() => _OblioTileState();
}

class _OblioTileState extends State<OblioTile> {
  bool _customTileExpanded = false;
  data(field) => widget.data[Objects.fieldMappings[widget.object]![field]];

  Map<String, Uint8List> imageData = {};
  Uint8List image = Uint8List(0);

  double maxWidth = 0.0;
  double min = 600;

  List<String> list(field) {
    List<String> itemList = [];
    for (var item in Objects.fieldMappings[widget.object]![field]) {
      itemList.add(widget.data[item]);
    }
    return itemList;
  }

  List<Map<dynamic, String>> map(field) {
    List<Map<dynamic, String>> mappings = [];
    for (var item
        in (Objects.fieldMappings[widget.object]![field] as Map).entries) {
      mappings.add({
        'field': item.key,
        'type': item.value,
        'value': widget.data[item.key]
      });
    }
    return mappings;
  }

  contains(field) => Objects.fieldMappings[widget.object]!.containsKey(field);

  @override
  Widget build(BuildContext context) {
    if (contains('image') && !imageData.containsKey('profile')) {
      imageData['profile'] = base64Decode(data('image'));
    }
    return LayoutBuilder(
        builder: (BuildContext context, BoxConstraints constraints) {
      maxWidth = constraints.maxWidth;
      return widget.grow && maxWidth < min
          ? Column(children: [
              content(),
              Padding(
                padding: const EdgeInsets.only(left: 20.0),
                child: contact(),
              )
            ])
          : widget.children.length == 0
              ? content()
              : Theme(
                  data: ThemeData(hoverColor: Colors.transparent),
                  child: ExpansionTile(
                    tilePadding: EdgeInsets.only(right: 16),
                    title: content(),
                    trailing: Icon(
                      _customTileExpanded
                          ? Icons.arrow_drop_down_circle
                          : Icons.arrow_drop_down,
                    ),
                    children: widget.children,
                  ),
                );
    });
  }

  Widget content() {
    return GestureDetector(
      onTap: () {
        if (widget.children.length == 0 && !widget.grow) {
          Navigator.of(context).pushNamedAndRemoveUntil(
              "/${widget.object}/${widget.data['id']}",
              (Route<dynamic> route) => false);
        }
      },
      child: Padding(
        padding: EdgeInsets.only(
            top: 16,
            left: 16,
            right: 16,
            bottom: widget.underline
                ? 0
                : maxWidth < min
                    ? 10
                    : 16),
        child: Row(
          crossAxisAlignment: widget.grow
              ? CrossAxisAlignment.center
              : CrossAxisAlignment.start,
          children: [
            // Leading Widget
            if (widget.index != null) ...[
              Container(
                  width: 18,
                  padding: const EdgeInsets.only(top: 6.0),
                  child: Text('${widget.index}.', style: Typeface.tileIndex)),
              SizedBox(width: 8)
            ],
            if (contains('icon'))
              Padding(
                padding: EdgeInsets.only(right: widget.grow ? 25 : 16),
                child: Container(
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: Objects.iconMapping[data('icon')]!['background'],
                  ),
                  width: 40,
                  height: 40,
                  child: Icon(
                    Objects.iconMapping[data('icon')]!['icon'],
                    color: Colors.white,
                  ),
                ),
              ),
            if (contains('image'))
              Padding(
                padding: EdgeInsets.only(right: widget.grow ? 25 : 16),
                child: CircleAvatar(
                  radius: widget.grow && maxWidth < min
                      ? 40
                      : widget.grow
                          ? 64
                          : 20,
                  foregroundImage: data('image') != 'null'
                      ? MemoryImage(imageData['profile']!)
                      : null,
                  // backgroundColor:
                  //     data('image') != 'null' ? Colors.brown.shade800 : null,
                  child: Image.asset(
                    'lib/assets/images/profile.png',
                    filterQuality: FilterQuality.high,
                  ),
                  // child: Text(
                  //   (data('subtitle') as String)
                  //       .trim()
                  //       .split(' ')
                  //       .map((l) => l[0])
                  //       .take(2)
                  //       .join(),
                  //   style: TextStyle(fontSize: widget.grow ? 30 : 16),
                  // ),
                ),
              ),
            if (contains('completion')) ...[
              CircularPercentIndicator(
                  radius: 70.0,
                  lineWidth: 9.0,
                  animation: true,
                  percent: data('completion')['percent'] / 100,
                  center: Text(
                    data('completion')['percent'].toString() + "%",
                    style: Typeface.tilePercent,
                    // style: oblioTheme.textTheme.subtitle2,
                  ),
                  backgroundColor: Pipeline
                      .colours[data('completion')['stage']]!['background']!,
                  circularStrokeCap: CircularStrokeCap.round,
                  progressColor: Pipeline.colours[data('completion')['stage']]
                      ?['foreground']),
              SizedBox(width: 18)
            ],

            // Middle items
            Expanded(
              child: widget.grow && maxWidth > min
                  ? Column(
                      children: [
                        Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            mainAxisAlignment: MainAxisAlignment.start,
                            children: lines()),

                        SizedBox(height: 5),

                        // Large tile data
                        contact()
                      ],
                    )
                  : Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: lines(),
                    ),
            ),
          ],
        ),
      ),
    );
  }

  List<Widget> lines() {
    return [
      // Top row items
      widget.grow && maxWidth > min
          ? Expanded(child: details())
          : Container(child: details()),

      SizedBox(height: 6),

      // 4th row widgets
      if (contains('health'))
        healthScore(
            size: maxWidth < min && widget.grow
                ? 16
                : widget.grow
                    ? 20
                    : 16,
            score: data('health')['score'],
            date: data('health')['date']),
      if (contains('performance'))
        Scrollbar(
          child: SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(children: [
              for (MapEntry e
                  in (data('performance') as Map<String, double>).entries)
                Padding(
                  padding: const EdgeInsets.only(right: 3.0),
                  child: oblioChip(stage: e.key, percent: e.value),
                ),
            ]),
          ),
        ),
      if (widget.underline)
        Container(margin: EdgeInsets.only(top: 15), child: Divider(height: 0))
    ];
  }

  Widget details() {
    growText(TextStyle style, grow, size) {
      return grow ? style.copyWith(fontSize: style.fontSize! + size) : style;
    }

    return Container(
      child: Row(
        children: [
          Flexible(
            flex: 1,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                if (contains('title') && !widget.hideTitle)
                  Container(
                      width: double.infinity,
                      child: Text((list('title')).join(' • ').toUpperCase(),
                          overflow: TextOverflow.fade,
                          maxLines: 1,
                          softWrap: false,
                          style:
                              growText(Typeface.tileHeader, widget.grow, 3))),
                if (contains('subtitle') && !widget.hideTitle)
                  Text(
                    data('subtitle'),
                    style: growText(Typeface.tileSubtitle, widget.grow, 10),
                    overflow: TextOverflow.ellipsis,
                  ),
                if (contains('body') && !widget.hideTitle)
                  Text(
                    list('body').join(' • '),
                    style: growText(Typeface.tileBody, widget.grow, 3),
                    overflow: TextOverflow.ellipsis,
                  ),
              ],
            ),
          ),

          // Empty space between leading and trailing widgets
          SizedBox(width: 10),

          // Trailing widget
          if (contains('activities'))
            Container(
              width: 35,
              height: 35,
              decoration: BoxDecoration(
                color: Color.fromRGBO(239, 240, 252, 1),
                shape: BoxShape.circle,
              ),
              child: Center(
                  child: Text(
                data('activities').toString(),
                style: Typeface.tileActivities,
              )),
            ),
        ],
      ),
    );
  }

  Widget contact() {
    return Padding(
      padding: EdgeInsets.only(
          top: maxWidth > min ? 5 : 0, bottom: maxWidth < min ? 5 : 0),
      child: Row(
        children: [
          if (contains('contact'))
            for (var item in map('contact')) ...[
              Container(
                padding: EdgeInsets.only(right: 20),
                child: InkWell(
                  onTap: () {
                    if (item['field']! == 'email') {
                      OblioFunctions.visitURL(
                          "mailto:${item['value']!.toLowerCase()}");
                    }
                  },
                  child: Row(
                    children: [
                      if (item['type'] == 'icon')
                        Icon(
                          Objects.iconMapping[item['field']]!['icon']!,
                          size: 25,
                          color: Color.fromARGB(255, 148, 148, 148),
                        ),
                      Container(
                        padding: EdgeInsets.only(left: 3),
                        child: Center(
                            child: Text(
                          item['value']!.toLowerCase(),
                          style: Typeface.tileBody,
                        )),
                      ),
                    ],
                  ),
                ),
              )
            ],
          if (maxWidth > min) Spacer(),
          if (contains('social') && maxWidth > min)
            for (var item in map('social'))
              Container(
                padding: EdgeInsets.only(left: 10),
                child: GestureDetector(
                  onTap: () {
                    OblioFunctions.visitURL('https://' + item['value']!);
                  },
                  child: Icon(
                    Objects.iconMapping[item['type']]!['icon']!,
                    color: Objects.iconMapping[item['type']]!['background']!,
                    size: 25,
                    //color: Color.fromARGB(255, 148, 148, 148),
                  ),
                ),
              )
        ],
      ),
    );
  }
}
