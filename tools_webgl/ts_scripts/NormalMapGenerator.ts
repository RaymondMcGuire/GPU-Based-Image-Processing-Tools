/* =========================================================================
 *
 *  NormalMapGenerator.ts
 *  tool for generate normal map from texture
 *  
 * ========================================================================= */
/// <reference path="./lib/image_utils.ts" />
/// <reference path="../../lib_webgl/ts_scripts/package/pkg/bumpMapping.ts" />
var cvs_normalmap = <any>document.getElementById('canvas_normalmap');
cvs_normalmap.width = 512;
cvs_normalmap.height = 512;

var strength =parseFloat((<any>document.getElementById('strength')).value)/10.0;
var level = parseFloat((<any>document.getElementById('level')).value)/10.0;

var ImageViewer = new EcognitaMathLib.ImageView(cvs_normalmap,"./img/test2.jpg");
ImageViewer.image.onload =  (() => { 
    ImageViewer.readImageData();
    ImageViewer.drawNormalMap(strength,level);
    var image = cvs_normalmap.toDataURL("image/png").replace("image/png", "image/octet-stream"); 

    var cvs_web3d = <any>document.getElementById('canvas_web3d');
    cvs_web3d.width = 500;
    cvs_web3d.height = 300;
    var bumpMapping = new EcognitaWeb3DFunction.BumpMapping(cvs_web3d,cvs_normalmap.toDataURL());

});

function updateStrength(val){
    ImageViewer.drawNormalMap(strength,level);
    var bumpMapping = new EcognitaWeb3DFunction.BumpMapping(cvs_web3d,cvs_normalmap.toDataURL());
}


