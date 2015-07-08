/* Based on http://opencv-srf.blogspot.com/2010/09/object-detection-using-color-seperation.html */
#include <opencv/cv.h>
#include <opencv/highgui.h>

IplImage* imgTracking;
int lastX = -1;
int lastY = -1;

int debug = 0;
int delay = 100;
int halfWidth, halfHeight;

//This function threshold the HSV image and create a binary image
IplImage* GetThresholdedImage(IplImage* imgHSV){
    static int gotHSV = 0;
    static int Hmin, Hmax, Smin, Smax, Vmin, Vmax;
    FILE *fp;
    if(!gotHSV || debug > 1) {
        gotHSV = 1;
        fp = fopen("hsv.txt","r");
        fscanf(fp, "%d", &Hmin);
        fscanf(fp, "%d", &Hmax);
        fscanf(fp, "%d", &Smin);
        fscanf(fp, "%d", &Smax);
        fscanf(fp, "%d", &Vmin);
        fscanf(fp, "%d", &Vmax);
        printf("hsv.txt: %d-%d, %d-%d, %d-%d\n", Hmin, Hmax, Smin, Smax, Vmin, Vmax);
        fclose(fp);
    }
    IplImage* imgThresh=cvCreateImage(cvGetSize(imgHSV),IPL_DEPTH_8U, 1);
    cvInRangeS(imgHSV, cvScalar(Hmin,Smin,Vmin), cvScalar(Hmax,Smax,Vmax), imgThresh); 
    return imgThresh;
}

void trackObject(IplImage* imgThresh){
    // Calculate the moments of 'imgThresh'
    CvMoments *moments = (CvMoments*)malloc(sizeof(CvMoments));
    cvMoments(imgThresh, moments, 1);
    double moment10 = cvGetSpatialMoment(moments, 1, 0);
    double moment01 = cvGetSpatialMoment(moments, 0, 1);
    double area = cvGetCentralMoment(moments, 0, 0);

    // if the area<100, I consider that the there are no object in the image and it's because of the noise, the area is not zero 
    if(area>100){
        // calculate the position of the ball
        int posX = moment10/area;
        int posY = moment01/area;        
        
        if(debug>1 && lastX>=0 && lastY>=0 && posX>=0 && posY>=0)
        {
            // Draw a yellow line from the previous point to the current point
            cvLine(imgTracking, cvPoint(posX, posY), cvPoint(lastX, lastY), cvScalar(0,0,255), 4);
        }

        lastX = posX;
        lastY = posY;

        printf("%+05d %+05d\n", posX-halfWidth, posY-halfHeight);
    }else{
        printf("***** *****\n");
    }

    free(moments); 
}


int main(){
      CvCapture* capture =0;
      CvSize dim;

      FILE *fp;
      fp = fopen("debug.txt","r");
      if(fp) {
          fscanf(fp, "%d", &debug);
          fclose(fp);
      }

      capture = cvCaptureFromCAM(0);
      cvSetCaptureProperty(capture, CV_CAP_PROP_FRAME_WIDTH, 160);
      cvSetCaptureProperty(capture, CV_CAP_PROP_FRAME_HEIGHT, 120);
      if(!capture){
         printf("Capture failure\n");
         return -1;
      }
      
      IplImage* frame=0;
      frame = cvQueryFrame(capture);           
      if(!frame) return -1;
   
      //create a blank image and assigned to 'imgTracking' which has the same size of original video
      dim = cvGetSize(frame);
      imgTracking=cvCreateImage(dim,IPL_DEPTH_8U, 3);
      cvZero(imgTracking); //covert the image, 'imgTracking' to black

      halfWidth = dim.width/2;
      halfHeight = dim.height/2;

      if(debug>0) {
         cvNamedWindow("Video");     
         cvNamedWindow("Ball");
      }

      //iterate through each frames of the video     
      while(true){

            frame = cvQueryFrame(capture);           
            if(!frame) break;
            frame=cvCloneImage(frame); 
            
            cvSmooth(frame, frame, CV_GAUSSIAN,3,3); //smooth the original image using Gaussian kernel

            IplImage* imgHSV = cvCreateImage(cvGetSize(frame), IPL_DEPTH_8U, 3); 
            cvCvtColor(frame, imgHSV, CV_BGR2HSV); //Change the color format from BGR to HSV
            IplImage* imgThresh = GetThresholdedImage(imgHSV);
          
            cvSmooth(imgThresh, imgThresh, CV_GAUSSIAN,3,3); //smooth the binary image using Gaussian kernel
            
            //track the possition of the ball
            trackObject(imgThresh);

            if(debug>1) {
               // Add the tracking image and the frame
               cvAdd(frame, imgTracking, frame);
            }

            if(debug>0) {
               cvShowImage("Ball", imgThresh);           
               cvShowImage("Video", frame);
            }
           
            //Clean up used images
            cvReleaseImage(&imgHSV);
            cvReleaseImage(&imgThresh);            
            cvReleaseImage(&frame);

            //Wait X mS
            int c = cvWaitKey(delay);
            //If 'ESC' is pressed, break the loop
            if((char)c==27 ) break;      
      }

      cvDestroyAllWindows() ;
      cvReleaseImage(&imgTracking);
      cvReleaseCapture(&capture);     

      return 0;
}
