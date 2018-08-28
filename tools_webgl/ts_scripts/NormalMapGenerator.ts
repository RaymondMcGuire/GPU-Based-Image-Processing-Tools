/* =========================================================================
 *
 *  NormalMapGenerator.ts
 *  tool for generate normal map from texture
 *  using filesaver.js can export a nice texture,TODO
 *  
 * ========================================================================= */
/// <reference path="./lib/image_utils.ts" />
/// <reference path="../../lib_webgl/ts_scripts/package/pkg/bumpMapping.ts" />
var cvs_normalmap = <any>document.getElementById('canvas_normalmap');
cvs_normalmap.width = 256;
cvs_normalmap.height = 256;

var cvs_web3d = <any>document.getElementById('canvas_web3d');
cvs_web3d.width = 512;
cvs_web3d.height = 512;

var strength =parseFloat((<any>document.getElementById('strength')).value)/10.0;
var level = parseFloat((<any>document.getElementById('level')).value)/10.0;

var ImageViewer = new EcognitaMathLib.ImageView(cvs_normalmap,"./img/test1.png");
ImageViewer.image.onload =  (() => { 
    ImageViewer.readImageData();
    ImageViewer.drawNormalMap(strength,level);  
    var bumpMapping = new EcognitaWeb3DFunction.BumpMapping(cvs_web3d,cvs_normalmap.toDataURL());
});

function updateStrength(val){
    ImageViewer.drawNormalMap(val/10,level);
    var bumpMapping = new EcognitaWeb3DFunction.BumpMapping(cvs_web3d,cvs_normalmap.toDataURL());
}

function updateLevel(val){
    ImageViewer.drawNormalMap(strength,val/10);
    var bumpMapping = new EcognitaWeb3DFunction.BumpMapping(cvs_web3d,cvs_normalmap.toDataURL());
}

function ExportNormalMap(){
    var image = cvs_normalmap.toDataURL("image/png").replace("image/png", "image/octet-stream"); 

    window.location.href = image;
}

