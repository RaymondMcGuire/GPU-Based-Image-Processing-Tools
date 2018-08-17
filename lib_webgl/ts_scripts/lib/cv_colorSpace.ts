/* =========================================================================
 *
 *  cv_colorSpace.ts
 *  color space transformation
 * 
 * ========================================================================= */
module EcognitaMathLib {

    //hsv space transform to rgb space
    //h(0~360) sva(0~1)
    export function HSV2RGB(h:number,s:number,v:number,a:number) {
        if(s > 1 || v > 1 || a > 1){return;}
        var th = h % 360;
        var i = Math.floor(th / 60);
        var f = th / 60 - i;
        var m = v * (1 - s);
        var n = v * (1 - s * f);
        var k = v * (1 - s * (1 - f));
        var color = new Array();
        if(!(s > 0) && !(s < 0)){
            color.push(v, v, v, a); 
        } else {
            var r = new Array(v, n, m, m, k, v);
            var g = new Array(k, v, v, n, m, m);
            var b = new Array(m, m, k, v, v, n);
            color.push(r[i], g[i], b[i], a);
        }
        return color;
    }

    
}