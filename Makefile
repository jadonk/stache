CC := g++
CFLAGS := `pkg-config --static --libs opencv` -O3

all: stache

stache: stache.cpp Makefile
	$(CC) $(CFLAGS) -o stache stache.cpp

clean:
	rm -f stache

install: stache
	cp stache.desktop $(HOME)/Desktop/
