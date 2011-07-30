#!/bin/bash
cd `dirname $0`

tail -n +34 $0 > tmp.tar.gz

gunzip tmp.tar.gz && tar xvf tmp.tar
if [ $? -ne 0 ] ; then
	echo extract failed
	exit $?
else
	mkdir content data
fi
if [ ! -d ./conf ] ; then
	exit 1
fi

if [ ! -f conf/config.xml ] ; then
	mv conf/config.xml.new conf/config.xml
fi

if [ ! -f conf/ssi-environment.xml ] ; then
	mv conf/ssi-environment.xml.new conf/ssi-environment.xml
else
	rm conf/ssi-environment.xml.new
fi

if [ ! -f conf/users.xml ] ; then
	mv conf/users.xml.new conf/users.xml
else
	rm conf/users.xml.new
fi
exit 0
##END34
