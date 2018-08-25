/* =========================================================================
 *
 *  extra_utils.ts
 *  simple utils from extra library 
 * 
 * ========================================================================= */
module EcognitaMathLib {
    declare var Hammer:any;
    export class Hammer_Utils {
        hm:any;
        on_pan:any;
        //event listener dom,
        constructor(canvas:any) {
            //event listener
            //using hammer library
            this.hm = new Hammer(canvas);
            this.on_pan = undefined;

        }

        enablePan(){
            if(this.on_pan == undefined){
                console.log("please setting the PAN function!");
                return;
            }
            this.hm.add( new Hammer.Pan({ direction: Hammer.DIRECTION_ALL, threshold: 0 }) );
            this.hm.on("pan", this.on_pan);
        }

    }
}