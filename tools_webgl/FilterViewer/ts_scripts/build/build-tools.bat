TITLE Environment Setting

@echo off
echo compile start

PUSHD %~dp0
echo.
echo current path is:%cd%

PUSHD ..\..\..\..\lib_webgl\ts_scripts\build
echo.
echo Ecognita webgl library path is:%cd%

echo.
echo compile Ecognita webgl library
call build-webgl.bat

PUSHD ..\..\..\tools_webgl\FilterViewer\ts_scripts\build\tools

echo.
echo filter viewer path is:%cd%

echo.
echo compile filter viewer
call build-tsc.bat

echo.
echo compile YUI compress
call build-yui.bat

POPD
POPD
POPD

echo.
echo Finished Environment Setting

pause