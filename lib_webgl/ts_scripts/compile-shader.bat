TITLE Init Environment
@echo off
echo complie shader
python compile-shaders.py

echo.
echo compile typescript
tsc --out ../scripts/demo.js demo.ts webgl_matrix.ts webgl_shaders.ts webgl_utils.ts

echo.
echo Finished Environment Init
pause >nul
exit