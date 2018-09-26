/* =========================================================================
 *
 *  demo.ts
 *  demo for normal map generator
 *  
 * ========================================================================= */
/// <reference path="../lib/image_utils.ts" />
var cvs_hm = <any>document.getElementById('canvas_heightmap');
var cvs_nm = <any>document.getElementById('canvas_normalmap');

var strength  =parseFloat((<HTMLInputElement>document.getElementById("p_s")).value);
var level  = parseFloat((<HTMLInputElement>document.getElementById("p_l")).value);

cvs_hm.height = 512;
cvs_hm.width = 512;
cvs_nm.height = 512;
cvs_nm.width= 512;

var HeightMapViewer = new EcognitaMathLib.ImageView(cvs_hm,"./project/NormalMapGenerator/img/heightmap.jpg");
HeightMapViewer.image.onload =  (() => { 
    HeightMapViewer.readImageData();
});

var NormalMapViewer = new EcognitaMathLib.ImageView(cvs_nm,"./project/NormalMapGenerator/img/heightmap.jpg");
NormalMapViewer.image.onload =  (() => { 
    NormalMapViewer.readImageData();
    NormalMapViewer.drawNormalMap(strength,level);

    document.getElementById("generate_normalmap").addEventListener("click", function() {
        strength  =parseFloat((<HTMLInputElement>document.getElementById("p_s")).value);
        level  = parseFloat((<HTMLInputElement>document.getElementById("p_l")).value);
        NormalMapViewer.drawNormalMap(strength,level);
    });
});

