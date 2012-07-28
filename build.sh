#!/bin/sh
g++ -o stache stache.cpp `pkg-config --static --libs opencv | perl -pe "s/\/Users\/jason\/gentoo\/usr\/lib/\/usr\/local\/lib/g"`
#g++ -static -o stache stache.cpp `pkg-config --static --libs opencv | perl -pe "s/\/Users\/jason\/gentoo\/usr\/lib/\/usr\/local\/lib/g" | perl -pe "s/\.dynlib/\.a/g"` /Developer/SDKs/MacOSX10.7.sdk/usr/lib/crt1.o
