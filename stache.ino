/**
 * Based on https://code.ros.org/trac/opencv/browser/trunk/opencv/samples/cpp/tutorial_code/objectDetection/objectDetection2.cpp?rev=6553
 */
#include "opencv2/objdetect/objdetect.hpp"
#include "opencv2/highgui/highgui.hpp"
#include "opencv2/imgproc/imgproc.hpp"
#include "opencv2/imgproc/imgproc_c.h"

#include <iostream>
#include <stdio.h>
#include <termios.h>
#include <unistd.h>

using namespace std;
using namespace cv;

const char *copyright = "\
 IMPORTANT: READ BEFORE DOWNLOADING, COPYING, INSTALLING OR USING. \n\
 \n\
 By downloading, copying, installing or using the software you agree to this license.\n\
 If you do not agree to this license, do not download, install, copy or use the software.\n\
\n\
\n\
                          License Agreement\n\
               For Open Source Computer Vision Library\n\
\n\
Copyright (C) 2000-2008, Intel Corporation, all rights reserved.\n\
Copyright (C) 2008-2011, Willow Garage Inc., all rights reserved.\n\
Copyright (C) 2012-2013, Texas Instruments, all rights reserved.\n\
Third party copyrights are property of their respective owners.\n\
\n\
Redistribution and use in source and binary forms, with or without modification,\n\
are permitted provided that the following conditions are met:\n\
\n\
  * Redistributions of source code must retain the above copyright notice,\n\
    this list of conditions and the following disclaimer.\n\
\n\
  * Redistributions in binary form must reproduce the above copyright notice,\n\
    this list of conditions and the following disclaimer in the documentation\n\
    and/or other materials provided with the distribution.\n\
\n\
  * The name of the copyright holders may not be used to endorse or promote products\n\
    derived from this software without specific prior written permission.\n\
\n\
This software is provided by the copyright holders and contributors \"as is\" and\n\
any express or implied warranties, including, but not limited to, the implied\n\
warranties of merchantability and fitness for a particular purpose are disclaimed.\n\
In no event shall the Intel Corporation or contributors be liable for any direct,\n\
indirect, incidental, special, exemplary, or consequential damages\n\
(including, but not limited to, procurement of substitute goods or services;\n\
loss of use, data, or profits; or business interruption) however caused\n\
and on any theory of liability, whether in contract, strict liability,\n\
or tort (including negligence or otherwise) arising in any way out of\n\
the use of this software, even if advised of the possibility of such damage.\n\
\n";

/** Function Headers */
void detectAndDisplay(Mat frame);
void saveFrame(Mat frame);

/** Global variables */
const char * face_cascade_name = "lbpcascade_frontalface.xml";
CascadeClassifier face_cascade;
const char * window_name = "stache - OpenCV demo";
IplImage* mask = 0;

/** Command-line arguments */
const char* stacheMaskFile = "stache-mask.png";
CvCapture* capture;
Mat frame;

/**
 * @function main
 */
void setup() {
  //-- 0. Print the copyright
  fprintf(stderr, "%s", copyright);

  //-- 1. Load the cascade
  if( !face_cascade.load(face_cascade_name) ){ fprintf(stderr, "--(!)Error loading\n"); exit(-1); };

  //-- 1a. Load the mustache mask
  mask = cvLoadImage(stacheMaskFile);
  if(!mask) { fprintf(stderr, "Could not load %s\n", stacheMaskFile); exit(-1); }

  //-- 2. Read the video stream
  capture = cvCaptureFromCAM(-1);
  cvSetCaptureProperty(capture, CV_CAP_PROP_FRAME_WIDTH, 320);
  cvSetCaptureProperty(capture, CV_CAP_PROP_FRAME_HEIGHT, 240);
  //cvSetCaptureProperty(capture, CV_CAP_PROP_FPS, 5);
}

void loop() {
      frame = cvQueryFrame(capture);
  
      //-- 3. Apply the classifier to the frame
      try {
       if(!frame.empty()) {
        detectAndDisplay( frame );
       } else {
        //fprintf(stderr, " --(!) No captured frame\n");
       }
      } catch(cv::Exception e) {
      }
}

/**
 * @function detectAndDisplay
 */
void detectAndDisplay(Mat frame) {
  std::vector<Rect> faces;
  Mat frame_gray;
  int i = 0;
  int c;

  cvtColor(frame, frame_gray, CV_BGR2GRAY);
  equalizeHist(frame_gray, frame_gray);

  //-- Detect faces
  face_cascade.detectMultiScale(frame_gray, faces, 1.1, 2, 0, Size(80, 80));

  for(; i < faces.size(); i++) {
    //-- Scale and apply mustache mask for each face
    Mat faceROI = frame_gray(faces[i]);
    IplImage iplFrame = frame;
    IplImage *iplMask = cvCreateImage(cvSize(faces[i].width, faces[i].height),
      mask->depth, mask->nChannels );
    cvSetImageROI(&iplFrame, cvRect(faces[i].x, faces[i].y,
      faces[i].width, faces[i].height));
    cvResize(mask, iplMask, CV_INTER_LINEAR);
    cvSub(&iplFrame, iplMask, &iplFrame);
    cvResetImageROI(&iplFrame);
  }

  if(i>0) {
    c = waitKey(10);
    if( c == 65361 || c == 63234 ) { saveFrame(frame); }  //-- save on press of left arrow
  }

  //-- Show what you got
  flip(frame, frame, 1);
  imshow(window_name, frame);
}

void saveFrame(Mat frame) {
  char filename[40];
  time_t mytime;
  struct tm y2k;
  y2k.tm_hour = 0;   y2k.tm_min = 0; y2k.tm_sec = 0;
  y2k.tm_year = 100; y2k.tm_mon = 0; y2k.tm_mday = 1;
  IplImage iplFrame = frame;
  time(&mytime);
  sprintf(filename, "tmp/captured%010ld.jpg", (long)difftime(mytime,mktime(&y2k)));
  cvSaveImage(filename, &iplFrame);
  fprintf(stdout, "{\"tweet\":\"New stache captured!\",\"filename\":\"%s\"}\n", filename);
  fflush(stdout);
}
