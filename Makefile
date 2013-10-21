CC := g++
CFLAGS := `pkg-config --static --libs opencv` -O3

BOARD_TAG      = userspace

USERSPACE_MAKE = TRUE

#include ../../arduino-mk/Userspace.mk

all: stache

stache: stache.cpp Makefile
	$(CC) $(CFLAGS) -o stache stache.cpp

clean:
	rm -f stache

install: stache
	cp stache.desktop $(HOME)/Desktop/
