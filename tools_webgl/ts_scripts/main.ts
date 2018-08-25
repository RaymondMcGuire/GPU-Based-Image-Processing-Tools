/* =========================================================================
 *
 *  main.ts
 *  test some image process tools
 *  
 * ========================================================================= */
/// <reference path="./lib/image_utils.ts" />
let cvs = <any>document.getElementById('canvas');
cvs.width = 256;
cvs.height = 256;
let ImageViewer = new EcognitaMathLib.ImageView(cvs,"./img/test1.png");
ImageViewer.drawImage();