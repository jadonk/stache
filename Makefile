CC := g++
CFLAGS := `pkg-config --static --libs opencv` -O3

BOARD_TAG      = userspace

USERSPACE_MAKE = TRUE

#include ../../arduino-mk/Userspace.mk

all: stache tracker

stache: stache.cpp Makefile
	$(CC) $(CFLAGS) -o stache stache.cpp

tracker: tracker.cpp Makefile
	$(CC) $(CFLAGS) -o tracker tracker.cpp

clean:
	rm -f stache tracker

install: stache
	cp stache.desktop $(HOME)/Desktop/
