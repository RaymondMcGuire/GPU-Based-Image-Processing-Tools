/* =========================================================================
 *
 *  webgl_model.ts
 *  simple 3d model for webgl
 * 
 * ========================================================================= */
/// <reference path="./cv_colorSpace.ts" />
 module EcognitaMathLib {

    export class TorusModel {
        horCrossSectionSmooth:number;
        verCrossSectionSmooth:number;
        horRadius:number;
        verRadius:number;
        //px py pz cr cg cb ca
        data:Array<number>;
        index:Array<number>;
        constructor(vcrs:number,hcrs:number,vr:number,hr:number,need_normal:boolean) {
            this.verCrossSectionSmooth = vcrs;
            this.horCrossSectionSmooth = hcrs;
            this.verRadius = vr;
            this.horRadius = hr;
            this.data = new Array<number>();
            this.index = new Array<number>();
            this.preCalculate(need_normal);
        }

        private preCalculate(need_normal:boolean){

            //calculate pos and col
            for(var i = 0;i<=this.verCrossSectionSmooth;i++){
               var verIncrement = Math.PI * 2 /  this.verCrossSectionSmooth * i;
               var verX = Math.cos(verIncrement);
               var verY = Math.sin(verIncrement);
               for(var ii=0;ii<=this.horCrossSectionSmooth;ii++){
                   var horIncrement = Math.PI * 2 /  this.horCrossSectionSmooth * ii;
                   var horX = (verX* this.verRadius + this.horRadius) * Math.cos(horIncrement);
                   var horY =  verY * this.verRadius;
                   var horZ = (verX* this.verRadius + this.horRadius) * Math.sin(horIncrement);
                   this.data.push(horX,horY,horZ);

                   if(need_normal){
                        var nx = verX * Math.cos(horIncrement);
                        var nz = verX * Math.sin(horIncrement);
                        this.data.push(nx,verY,nz);
                   }
                   //hsv2rgb
                   var rgba = HSV2RGB(360/this.horCrossSectionSmooth *ii, 1, 1, 1);
                   this.data.push(rgba[0],rgba[1],rgba[2],rgba[3]);
                }
            }

            //calculate index
            for(i = 0; i < this.verCrossSectionSmooth; i++){
                for(ii = 0; ii < this.horCrossSectionSmooth; ii++){
                    verIncrement = (this.horCrossSectionSmooth + 1) * i + ii;
                    this.index.push(verIncrement, verIncrement + this.horCrossSectionSmooth + 1, verIncrement + 1);
                    this.index.push(verIncrement + this.horCrossSectionSmooth + 1, verIncrement + this.horCrossSectionSmooth + 2, verIncrement + 1);
                }
            }
        }

    }

    export class ShpereModel {
        horCrossSectionSmooth:number;
        verCrossSectionSmooth:number;
        Radius:number;
        //px py pz cr cg cb ca
        data:Array<number>;
        index:Array<number>;
        constructor(vcrs:number,hcrs:number,rad:number,need_normal:boolean) {
            this.verCrossSectionSmooth = vcrs;
            this.horCrossSectionSmooth = hcrs;
            this.Radius = rad;
            this.data = new Array<number>();
            this.index = new Array<number>();
            this.preCalculate(need_normal);
        }

        private preCalculate(need_normal:boolean){

            //calculate pos and col
            for(var i = 0;i<=this.verCrossSectionSmooth;i++){
               var verIncrement = Math.PI * 2 /  this.verCrossSectionSmooth * i;
               var verX = Math.cos(verIncrement);
               var verY = Math.sin(verIncrement);
               for(var ii=0;ii<=this.horCrossSectionSmooth;ii++){
                   var horIncrement = Math.PI * 2 /  this.horCrossSectionSmooth * ii;
                   var horX = verY * this.Radius  * Math.cos(horIncrement);
                   var horY =  verX * this.Radius;
                   var horZ = verY * this.Radius * Math.sin(horIncrement);
                   this.data.push(horX,horY,horZ);

                   if(need_normal){
                        var nx = verY * Math.cos(horIncrement);
                        var nz = verY * Math.sin(horIncrement);
                        this.data.push(nx,verX,nz);
                   }
                   //hsv2rgb
                   var rgba = HSV2RGB(360/this.horCrossSectionSmooth *ii, 1, 1, 1);
                   this.data.push(rgba[0],rgba[1],rgba[2],rgba[3]);
                }
            }

            //calculate index
            for(i = 0; i < this.verCrossSectionSmooth; i++){
                for(ii = 0; ii < this.horCrossSectionSmooth; ii++){
                    verIncrement = (this.horCrossSectionSmooth + 1) * i + ii;
                    this.index.push(verIncrement, verIncrement + 1, verIncrement + this.horCrossSectionSmooth + 2);
                    this.index.push(verIncrement, verIncrement + this.horCrossSectionSmooth + 2, verIncrement + this.horCrossSectionSmooth + 1);
                }
            }
        }

    }
}