CC=g++
CFLAGS=`pkg-config --static --libs opencv` -O3

# I've saved off some magic lines that help me build on a personal machine
#CFLAGS := `pkg-config --static --libs opencv | perl -pe "s/\/Users\/jason\/gentoo\/usr\/lib/\/usr\/local\/lib/g"`
#CFLAGS := `pkg-config --static --libs opencv | perl -pe "s/\/Users\/jason\/gentoo\/usr\/lib/\/usr\/local\/lib/g" | perl -pe "s/\.dynlib/\.a/g"` /Developer/SDKs/MacOSX10.7.sdk/usr/lib/crt1.o

all: stache

stache: stache.cpp
	$(CC) $(CFLAGS) -o stache stache.cpp

clean:
	rm -f stache

install: stache
	cp stache.desktop $(HOME)/Desktop/
