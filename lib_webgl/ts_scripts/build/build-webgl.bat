TITLE Init Environment
@echo off
echo complie shader
python compile-shaders.py

echo.
echo compile typescript
tsc --out ../../scripts/main.js @compile-list.txt

echo.
echo Finished Environment Init