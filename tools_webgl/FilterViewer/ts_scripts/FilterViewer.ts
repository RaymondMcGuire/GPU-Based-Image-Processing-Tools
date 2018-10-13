/* =========================================================================
 *
 *  FilterViewer.ts
 *  tool for test filter in WebGL
 *  filter viewer 
 *  
 * ========================================================================= */
/// <reference path="../ts_scripts/package/pkg_FilterViewHub.ts" />
let viewer = <any>document.createElement( 'canvas' );
document.body.appendChild( viewer );

viewer.id = "canvas_viewer";
viewer.width = window.innerWidth;
viewer.height = window.innerHeight;

var filterViewer = new EcognitaWeb3D.FilterViewer(viewer);
