import 'package:flutter/material.dart';
import 'package:hexcolor/hexcolor.dart';
import 'package:oblio/widgets/home/pipeline/pipeline_expansion.dart';

class PipelineDrawer extends StatelessWidget {
  const PipelineDrawer({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          PipelineExpansion(
              percentNum: 0.5,
              percentText: '50',
              color: HexColor('#5F78E4'),
              title: 'MQL Opportunities',
              subtitle: '20 out of 60',
              children: []),
          PipelineExpansion(
              percentNum: 0.6,
              percentText: '60',
              color: HexColor('#FDB653'),
              title: 'SQL Opportunities',
              subtitle: '20 out of 60',
              children: []),
          PipelineExpansion(
              percentNum: 0.75,
              percentText: '75',
              color: HexColor('#FF8787'),
              title: 'Sale Opportunities',
              subtitle: '20 out of 60',
              children: []),
          PipelineExpansion(
              percentNum: 0.9,
              percentText: '90',
              color: HexColor('#34CA87'),
              title: 'Resale Opportunities',
              subtitle: '20 out of 60',
              children: []),
        ],
      ),
    );
  }
}
