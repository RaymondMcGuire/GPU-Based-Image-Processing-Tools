#compile the scripts for mac
cd ..
tsc --out ../../../scripts/main.js @compile-list.txt

..\..\..\..\lib_webgl\ts_scripts\build

java -jar yuicompressor-2.4.8.jar ../../../scripts/main.js -o ../../../scripts/FilterViewer.min.js