/* =========================================================================
 *
 *  pkgBumpMapping.ts
 *  package for bump mapping
 *  
 * ========================================================================= */
/// <reference path="./pkg/bumpMapping.ts" />
var canvas = <any>document.getElementById('canvas');
canvas.width = 500;
canvas.height = 300;
var bumpMapping = new EcognitaWeb3DFunction.BumpMapping(canvas);