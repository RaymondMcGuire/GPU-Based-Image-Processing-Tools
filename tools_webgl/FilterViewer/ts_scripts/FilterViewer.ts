/* =========================================================================
 *
 *  FilterViewer.ts
 *  tool for test filter in WebGL
 *  filter viewer 
 *  
 * ========================================================================= */
/// <reference path="../ts_scripts/package/pkg_FilterViewHub.ts" />

var cvs_web3d = <any>document.getElementById('canvas_web3d');
cvs_web3d.width = 512;
cvs_web3d.height = 512;

var filterViewer = new EcognitaWeb3DFunction.FilterViewer(cvs_web3d);

