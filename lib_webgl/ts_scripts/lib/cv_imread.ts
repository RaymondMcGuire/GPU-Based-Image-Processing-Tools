/* =========================================================================
 *
 *  cv_imread.ts
 *  read the image file
 * 
 * ========================================================================= */
module EcognitaMathLib {

    export function imread(file:any) {
        var img = new Image();
        img.src = file;
        return img;
    }
}