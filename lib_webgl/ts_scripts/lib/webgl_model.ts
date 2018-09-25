/* =========================================================================
 *
 *  webgl_model.ts
 *  simple 3d model for webgl
 * 
 * ========================================================================= */
/// <reference path="./cv_colorSpace.ts" />
 module EcognitaMathLib {

    export class BoardModel{
        data:Array<number>;
        index:Array<number>;
        constructor(u_position:any = undefined, u_color:any = undefined,need_normal:boolean=true,need_color:boolean=true,need_texCoord:boolean=false){
            this.data = new Array<any>();
            var position = [
                -1.0,  0.0, -1.0,
                 1.0,  0.0, -1.0,
                -1.0,  0.0,  1.0,
                 1.0,  0.0,  1.0
            ];
            var normal = [
                0.0, 1.0, 0.0,
                0.0, 1.0, 0.0,
                0.0, 1.0, 0.0,
                0.0, 1.0, 0.0
            ];

            this.index = [
                0, 1, 2,
                3, 2, 1
            ];

            var texCoord = [
                0.0, 0.0,
                1.0, 0.0,
                0.0, 1.0,
                1.0, 1.0
            ];

            for(var i=0;i<4;i++){
                if(u_position == undefined)this.data.push(position[i*3+0],position[i*3+1],position[i*3+2]);
                else this.data.push(u_position[i*3+0],u_position[i*3+1],u_position[i*3+2]);
                
                if(need_normal)this.data.push(normal[i*3+0],normal[i*3+1],normal[i*3+2]);
                
                if(u_color == undefined){
                    var color = [
                        1.0, 1.0, 1.0, 1.0,
                        1.0, 1.0, 1.0, 1.0,
                        1.0, 1.0, 1.0, 1.0,
                        1.0, 1.0, 1.0, 1.0
                    ];
                    if(need_color)this.data.push(color[i*4+0],color[i*4+1],color[i*4+2],color[i*4+3]);
                }else{
                    if(need_color)this.data.push(u_color[i*4+0],u_color[i*4+1],u_color[i*4+2],u_color[i*4+3]);
                }

                if(need_texCoord)this.data.push(texCoord[i*2+0],texCoord[i*2+1]);

            }
        }

    }

    export class TorusModel {
        horCrossSectionSmooth:number;
        verCrossSectionSmooth:number;
        horRadius:number;
        verRadius:number;
        normal:Array<number>;
        //px py pz cr cg cb ca
        data:Array<number>;
        index:Array<number>;
        constructor(vcrs:number,hcrs:number,vr:number,hr:number,color:Array<number>,need_normal:boolean,need_texture:boolean=false) {
            this.verCrossSectionSmooth = vcrs;
            this.horCrossSectionSmooth = hcrs;
            this.verRadius = vr;
            this.horRadius = hr;
            this.data = new Array<number>();
            this.index = new Array<number>();
            this.normal = new Array<number>();
            this.preCalculate(color,need_normal,need_texture);
        }

        private preCalculate(color:Array<number>,need_normal:boolean,need_texture:boolean=false){

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
                        this.normal.push(nx,verY,nz);
                        this.data.push(nx,verY,nz);
                   }
                   //hsv2rgb
                   if(color == undefined){
                        var rgba = HSV2RGB(360/this.horCrossSectionSmooth *ii, 1, 1, 1);
                        this.data.push(rgba[0],rgba[1],rgba[2],rgba[3]);
                    }else{
                            this.data.push(color[0],color[1],color[2],color[3]);
                    }
                  

                   if(need_texture){
                        var rs = 1 / this.horCrossSectionSmooth * ii;
                        var rt = 1 / this.verCrossSectionSmooth * i + 0.5;
                        if(rt > 1.0){rt -= 1.0;}
                        rt = 1.0 - rt;
                        this.data.push(rs, rt);
                   }
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
        constructor(vcrs:number,hcrs:number,rad:number,color:Array<number>,need_normal:boolean,need_texture:boolean=false) {
            this.verCrossSectionSmooth = vcrs;
            this.horCrossSectionSmooth = hcrs;
            this.Radius = rad;
            this.data = new Array<number>();
            this.index = new Array<number>();
            this.preCalculate(color,need_normal,need_texture);
        }

        private preCalculate(color:Array<number>,need_normal:boolean,need_texture:boolean=false){

            //calculate pos and col
            for(var i = 0;i<=this.verCrossSectionSmooth;i++){
               var verIncrement = Math.PI /  this.verCrossSectionSmooth * i;
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
                   if(color == undefined){
                        var rgba = HSV2RGB(360/this.horCrossSectionSmooth *i, 1, 1, 1);
                        this.data.push(rgba[0],rgba[1],rgba[2],rgba[3]);
                   }else{
                        this.data.push(color[0],color[1],color[2],color[3]);
                   }


                   if(need_texture){
                     this.data.push(1 - 1 / this.horCrossSectionSmooth * ii, 1 / this.verCrossSectionSmooth * i);
                   }
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

    export class CubeModel {
        side:number;
        data:Array<number>;
        index:Array<number>;
        constructor(side:number,color:Array<number>,need_normal:boolean,need_texture:boolean=false) {
            this.side = side;
            this.data = new Array<number>();
            this.index = [
                0,  1,  2,  0,  2,  3,
                4,  5,  6,  4,  6,  7,
                8,  9, 10,  8, 10, 11,
               12, 13, 14, 12, 14, 15,
               16, 17, 18, 16, 18, 19,
               20, 21, 22, 20, 22, 23
           ];

            var hs = side * 0.5;
            var pos = [
                -hs, -hs,  hs,  hs, -hs,  hs,  hs,  hs,  hs, -hs,  hs,  hs,
                -hs, -hs, -hs, -hs,  hs, -hs,  hs,  hs, -hs,  hs, -hs, -hs,
                -hs,  hs, -hs, -hs,  hs,  hs,  hs,  hs,  hs,  hs,  hs, -hs,
                -hs, -hs, -hs,  hs, -hs, -hs,  hs, -hs,  hs, -hs, -hs,  hs,
                 hs, -hs, -hs,  hs,  hs, -hs,  hs,  hs,  hs,  hs, -hs,  hs,
                -hs, -hs, -hs, -hs, -hs,  hs, -hs,  hs,  hs, -hs,  hs, -hs
            ];
            var normal = [
                -1.0, -1.0,  1.0,  1.0, -1.0,  1.0,  1.0,  1.0,  1.0, -1.0,  1.0,  1.0,
                -1.0, -1.0, -1.0, -1.0,  1.0, -1.0,  1.0,  1.0, -1.0,  1.0, -1.0, -1.0,
                -1.0,  1.0, -1.0, -1.0,  1.0,  1.0,  1.0,  1.0,  1.0,  1.0,  1.0, -1.0,
                -1.0, -1.0, -1.0,  1.0, -1.0, -1.0,  1.0, -1.0,  1.0, -1.0, -1.0,  1.0,
                 1.0, -1.0, -1.0,  1.0,  1.0, -1.0,  1.0,  1.0,  1.0,  1.0, -1.0,  1.0,
                -1.0, -1.0, -1.0, -1.0, -1.0,  1.0, -1.0,  1.0,  1.0, -1.0,  1.0, -1.0
            ];
            var col = new Array();
            for(var i = 0; i < pos.length / 3; i++){
                if(color!=undefined){
                    var tc = color;
                }else{
                    tc = HSV2RGB(360 / pos.length / 3 * i, 1, 1, 1);
                }
                col.push(tc[0], tc[1], tc[2], tc[3]);
            }
            var st = [
                0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
                0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
                0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
                0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
                0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
                0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0
            ];

            var cubeVertexNum = 24;
            for(var i=0;i<cubeVertexNum;i++){
                //pos
                this.data.push(pos[i*3+0],pos[i*3+1],pos[i*3+2]);
                //normal
                if(need_normal){
                    this.data.push(normal[i*3+0],normal[i*3+1],normal[i*3+2]);
                }
                //color
                this.data.push(col[i*4+0],col[i*4+1],col[i*4+2],col[i*4+3]);
                //texture
                if(need_texture){
                    this.data.push(st[i*2+0],st[i*2+1]);
                }
            }

        }

    

    }
}