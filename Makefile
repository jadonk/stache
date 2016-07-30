CC := g++
CFLAGS := `pkg-config --static --libs opencv` -O3
PREFIX := /usr/local
npm_options := --unsafe-perm=true --progress=false --loglevel=error

#BOARD_TAG      = userspace
#USERSPACE_MAKE = TRUE
#include ../../arduino-mk/Userspace.mk

all: beaglestache tracker tweetstache

beaglestache: beaglestache.cpp
	$(CC) $(CFLAGS) -o beaglestache beaglestache.cpp

tracker: tracker.cpp
	$(CC) $(CFLAGS) -o tracker tracker.cpp

tweetstache: package.json tweetstache.js
	TERM=dumb npm install -g $(npm_options) --prefix ./build

clean:
	rm -f beaglestache tracker

test:
	echo "Test not yet implemented"

install:
	install -m 0755 -d $(DESTDIR)$(PREFIX)
	cp -dr --preserve=mode,timestamp ./build/* $(DESTDIR)$(PREFIX)/
	install -m 755 -d $(DESTDIR)$(PREFIX)/bin
	install -m 755 beaglestache $(DESTDIR)$(PREFIX)/bin/
	install -m 755 tracker $(DESTDIR)$(PREFIX)/bin/
	install -m 755 -d $(DESTDIR)$(PREFIX)/share/applications
	install -m 644 beaglestache.desktop $(DESTDIR)$(PREFIX)/share/applications/
	install -m 755 -d $(DESTDIR)/etc/xdg/autostart
	install -m 644 beaglestache.desktop $(DESTDIR)/etc/xdg/autostart/
	install -m 755 -d $(DESTDIR)$(PREFIX)/share/beaglestache
	install -m 644 lbpcascade_frontalface.xml $(DESTDIR)$(PREFIX)/share/beaglestache/
	install -m 644 stache-mask.png $(DESTDIR)$(PREFIX)/share/beaglestache/
	install -m 755 -d $(DESTDIR)$(PREFIX)/share/beaglestache/staches
	install -m 644 stache-2.png $(DESTDIR)$(PREFIX)/share/beaglestache/staches/
	install -m 644 stache-3.png $(DESTDIR)$(PREFIX)/share/beaglestache/staches/
	install -m 644 stache-4.png $(DESTDIR)$(PREFIX)/share/beaglestache/staches/
	install -m 644 stache-robclark.png $(DESTDIR)$(PREFIX)/share/beaglestache/staches/
	install -m 755 -d $(DESTDIR)/etc/beaglestache
	install -m 644 config.js $(DESTDIR)/etc/beaglestache/
	install -m 644 hsv.txt $(DESTDIR)/etc/beaglestache/

.PHONY: clean test install
