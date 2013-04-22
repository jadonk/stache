CC=g++
CFLAGS=`pkg-config --static --libs opencv` -O3

# I've saved off some magic lines that help me build on a personal machine
#CFLAGS := `pkg-config --static --libs opencv`
#CFLAGS := `pkg-config --static --libs opencv | perl -pe "s/\/Users\/jason\/gentoo\/usr\/lib/\/usr\/local\/lib/g"`
#CFLAGS := `pkg-config --static --libs opencv | perl -pe "s/\/Users\/jason\/gentoo\/usr\/lib/\/usr\/local\/lib/g" | perl -pe "s/\.dynlib/\.a/g"` /Developer/SDKs/MacOSX10.7.sdk/usr/lib/crt1.o
#CFLAGS := `pkg-config --static --libs opencv | perl -pe "s/\/Users\/jason\/gentoo\/usr\/lib/\/usr\/local\/lib/g" | perl -pe "s/\.dynlib/\.a/g"` /Applications/Xcode.app/Contents/Developer/Platforms/MacOSX.platform/Developer/SDKs/MacOSX10.8.sdk/usr/lib/crt1.o
CFLAGS := -l/usr/local/lib/libopencv_calib3d.dylib -l/usr/local/lib/libopencv_contrib.dylib -l/usr/local/lib/libopencv_core.dylib \
	-l/usr/local/lib/libopencv_features2d.dylib -l/usr/local/lib/libopencv_flann.dylib -l/usr/local/lib/libopencv_gpu.dylib \
	-l/usr/local/lib/libopencv_highgui.dylib -l/usr/local/lib/libopencv_imgproc.dylib -l/usr/local/lib/libopencv_legacy.dylib \
	-l/usr/local/lib/libopencv_ml.dylib -l/usr/local/lib/libopencv_nonfree.dylib -l/usr/local/lib/libopencv_objdetect.dylib \
	-l/usr/local/lib/libopencv_photo.dylib -l/usr/local/lib/libopencv_stitching.dylib -l/usr/local/lib/libopencv_ts.dylib \
	-l/usr/local/lib/libopencv_video.dylib -l/usr/local/lib/libopencv_videostab.dylib -I/usr/local/include

all: stache

stache: stache.cpp
	$(CC) $(CFLAGS) -o stache stache.cpp

clean:
	rm -f stache

install: stache
	cp stache.desktop $(HOME)/Desktop/
