# xpl-x10

## Objective

Node JS layer to execute x10 modules with mochad

## Installation

    $ git clone https://github.com/wiseflat/xpl-x10.git
    $ npm update

## Usage

You need to install the mochad first

$ sudo apt-get install libusb-1.0-0-dev
$ wget -O mochad.tgz http://sourceforge.net/projects/mochad/files/latest/download 
$ tar xf mochad.tgz


$ cd mochad*
$ ./configure
$ make
$ sudo make install

Send xpl-cmnd to execute your script

    $ xpl-send -m cmnd -c x10.basic device=A1 command=on
