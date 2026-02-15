import '/auth/firebase_auth/auth_util.dart';
import '/backend/firebase_storage/storage.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import '/flutter_flow/upload_data.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'field_image_model.dart';
export 'field_image_model.dart';

class FieldImageWidget extends StatefulWidget {
  const FieldImageWidget({super.key});

  @override
  State<FieldImageWidget> createState() => _FieldImageWidgetState();
}

class _FieldImageWidgetState extends State<FieldImageWidget> {
  late FieldImageModel _model;

  @override
  void setState(VoidCallback callback) {
    super.setState(callback);
    _model.onUpdate();
  }

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => FieldImageModel());

    WidgetsBinding.instance.addPostFrameCallback((_) => safeSetState(() {}));
  }

  @override
  void dispose() {
    _model.maybeDispose();

    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: AlignmentDirectional(-1.0, 0.0),
      child: Container(
        decoration: BoxDecoration(),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Align(
              alignment: AlignmentDirectional(0.0, -1.0),
              child: Padding(
                padding: EdgeInsetsDirectional.fromSTEB(0.0, 12.0, 0.0, 0.0),
                child: Container(
                  width: 84.0,
                  height: 84.0,
                  decoration: BoxDecoration(
                    color: FlutterFlowTheme.of(context).accent2,
                    shape: BoxShape.circle,
                    border: Border.all(
                      color: FlutterFlowTheme.of(context).secondary,
                      width: 2.0,
                    ),
                  ),
                  child: Align(
                    alignment: AlignmentDirectional(-1.0, -1.0),
                    child: Stack(
                      children: [
                        Padding(
                          padding: EdgeInsets.all(4.0),
                          child: AuthUserStreamWidget(
                            builder: (context) => ClipRRect(
                              borderRadius: BorderRadius.circular(60.0),
                              child: CachedNetworkImage(
                                fadeInDuration: Duration(milliseconds: 200),
                                fadeOutDuration: Duration(milliseconds: 200),
                                imageUrl: valueOrDefault<String>(
                                  currentUserPhoto,
                                  'https://images.unsplash.com/photo-1499887142886-791eca5918cd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0NTYyMDF8MHwxfHNlYXJjaHwxN3x8dXNlcnxlbnwwfHx8fDE2OTc4MjQ2MjZ8MA&ixlib=rb-4.0.3&q=80&w=400',
                                ),
                                width: 300.0,
                                height: 200.0,
                                fit: BoxFit.cover,
                              ),
                            ),
                          ),
                        ),
                        Align(
                          alignment: AlignmentDirectional(-1.0, -1.0),
                          child: ClipRRect(
                            borderRadius: BorderRadius.circular(60.0),
                            child: CachedNetworkImage(
                              fadeInDuration: Duration(milliseconds: 200),
                              fadeOutDuration: Duration(milliseconds: 200),
                              imageUrl: _model.uploadedFileUrl_uploadData8a,
                              width: 300.0,
                              height: 200.0,
                              fit: BoxFit.cover,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
            Expanded(
              child: Align(
                alignment: AlignmentDirectional(0.0, 0.0),
                child: Padding(
                  padding: EdgeInsetsDirectional.fromSTEB(16.0, 0.0, 16.0, 0.0),
                  child: FFButtonWidget(
                    onPressed: () async {
                      final selectedMedia = await selectMedia(
                        maxWidth: 240.00,
                        maxHeight: 240.00,
                        mediaSource: MediaSource.photoGallery,
                        multiImage: false,
                      );
                      if (selectedMedia != null &&
                          selectedMedia.every((m) =>
                              validateFileFormat(m.storagePath, context))) {
                        safeSetState(
                            () => _model.isDataUploading_uploadData8a = true);
                        var selectedUploadedFiles = <FFUploadedFile>[];

                        var downloadUrls = <String>[];
                        try {
                          showUploadMessage(
                            context,
                            'Uploading file...',
                            showLoading: true,
                          );
                          selectedUploadedFiles = selectedMedia
                              .map((m) => FFUploadedFile(
                                    name: m.storagePath.split('/').last,
                                    bytes: m.bytes,
                                    height: m.dimensions?.height,
                                    width: m.dimensions?.width,
                                    blurHash: m.blurHash,
                                  ))
                              .toList();

                          downloadUrls = (await Future.wait(
                            selectedMedia.map(
                              (m) async =>
                                  await uploadData(m.storagePath, m.bytes),
                            ),
                          ))
                              .where((u) => u != null)
                              .map((u) => u!)
                              .toList();
                        } finally {
                          ScaffoldMessenger.of(context).hideCurrentSnackBar();
                          _model.isDataUploading_uploadData8a = false;
                        }
                        if (selectedUploadedFiles.length ==
                                selectedMedia.length &&
                            downloadUrls.length == selectedMedia.length) {
                          safeSetState(() {
                            _model.uploadedLocalFile_uploadData8a =
                                selectedUploadedFiles.first;
                            _model.uploadedFileUrl_uploadData8a =
                                downloadUrls.first;
                          });
                          showUploadMessage(context, 'Success!');
                        } else {
                          safeSetState(() {});
                          showUploadMessage(context, 'Failed to upload data');
                          return;
                        }
                      }
                    },
                    text: 'Change Photo',
                    options: FFButtonOptions(
                      padding: EdgeInsets.all(16.0),
                      iconPadding:
                          EdgeInsetsDirectional.fromSTEB(0.0, 0.0, 0.0, 0.0),
                      color: FlutterFlowTheme.of(context).secondaryBackground,
                      textStyle:
                          FlutterFlowTheme.of(context).bodyMedium.override(
                                font: GoogleFonts.poppins(
                                  fontWeight: FontWeight.w500,
                                  fontStyle: FlutterFlowTheme.of(context)
                                      .bodyMedium
                                      .fontStyle,
                                ),
                                letterSpacing: 0.0,
                                fontWeight: FontWeight.w500,
                                fontStyle: FlutterFlowTheme.of(context)
                                    .bodyMedium
                                    .fontStyle,
                              ),
                      elevation: 0.0,
                      borderSide: BorderSide(
                        color: FlutterFlowTheme.of(context).secondaryText,
                        width: 0.5,
                      ),
                      borderRadius: BorderRadius.circular(8.0),
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
