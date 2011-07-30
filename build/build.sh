cd `dirname $0`
cd ..

tar cvfz portawiki-1.0.tar.gz bin client conf/*.new conf.d server

mv build/install.sh portawiki-1.0.bin
cat portawiki-1.0.tar.gz >> portawiki-1.0.bin

#truncate -s -1 portawiki-1.0.bin

chmod u+x portawiki-1.0.bin

echo built `pwd`/portawiki-1.0.bin

cd conf
