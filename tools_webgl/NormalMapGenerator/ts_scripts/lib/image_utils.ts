/* =========================================================================
 *
 *  image_utils.ts
 *  simple func for processing image
 * 
 * ========================================================================= */
/// <reference path="../extlib/vector.ts" />
 module EcognitaMathLib {
    export class ImageView{
        canvas:any;
        context:any;
        image:any;
        imageDataBuffer:Array<number>[][];
        grayDataBuffer:number[][];
        constructor(cvs:any,url:string){
            var image = new Image();
            image.src = url;

            this.canvas = cvs;
            this.context =  cvs.getContext('2d');
            this.image = image;
            this.imageDataBuffer = new Array(cvs.height);
            this.grayDataBuffer = new Array(cvs.height);
        }

        private convertGray(r:number, g:number, b:number) {
            return 0.299 * r + 0.578 * g + 0.114 * b;
        }

        //transfrom -1~1 to 0~255
        private convEdgeVal2RGB(val:number){
            return (val + 1.0) * (255.0 / 2.0);
        }

        readImageData(left:number = 0, top:number = 0){ 
                this.context.drawImage(this.image, left, top);
                var cvs = this.canvas;
                let imgData = this.getImageData();
                for (var j = 0; j < cvs.height; j++) {
                    this.imageDataBuffer[j]=new Array(this.canvas.width);
                    this.grayDataBuffer[j] =new Array(this.canvas.width);
                    for (var i = 0; i < cvs.width; i++) {
                        var index = (j * cvs.width + i) * 4;
                        this.imageDataBuffer[j][i] = new Array(4);
                        this.imageDataBuffer[j][i][0] =imgData.data[index + 0];
                        this.imageDataBuffer[j][i][1] =imgData.data[index + 1];
                        this.imageDataBuffer[j][i][2] =imgData.data[index + 2];
                        this.imageDataBuffer[j][i][3] =imgData.data[index + 3];

                        var grayVal = this.convertGray(this.imageDataBuffer[j][i][0],this.imageDataBuffer[j][i][1],this.imageDataBuffer[j][i][2]);
                        this.grayDataBuffer[j][i] = grayVal;
                    }
                }
        }

        drawGrayImage(){

                this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
                var cvs = this.canvas;
                let imgData = this.getImageData();
                for (var j = 0; j < cvs.height; j++) {
                    for (var i = 0; i < cvs.width; i++) {
                        var index = (j * cvs.width + i) * 4;
                        var grayVal = this.grayDataBuffer[j][i];
                    
                        imgData.data[index + 0] = grayVal;
                        imgData.data[index + 1] = grayVal;
                        imgData.data[index + 2] = grayVal;
                        imgData.data[index + 3] = 255;
                    }
                }
                this.context.putImageData(imgData, 0, 0);
            
        }

        private sobel_filter(data_buffer:any,idx_y:number,idx_x:number,type:string="vertical",kernel_size:number=3){
            // 1  2  1   vertical     1  0  -1  horizontal
            // 0  0  0                2  0  -2
            //-1 -2 -1                1  0  -1
            
            var vertical_sobel =[[-1,-2,-1],
                                 [ 0, 0, 0],
                                 [ 1, 2, 1]];
            var horizontal_sobel =[[-1, 0, 1],
                                   [-2, 0, 2],
                                   [-1, 0, 1]];
            var Val = 0;
            var center = Math.floor(kernel_size/2);
            for(var i=-center;i<=center;i++){
                for(var j =-center;j<=center;j++){

                    //chk out of range
                    if(idx_y+i<0 || idx_x+j<0 || idx_y+i>=this.canvas.height || idx_x+j>=this.canvas.width)continue;

                    if(type == "vertical"){
                        Val+=data_buffer[idx_y+i][idx_x+j]*vertical_sobel[center+i][center+j];
                       
                    }else if(type == "horizontal"){
                        Val+=data_buffer[idx_y+i][idx_x+j]*horizontal_sobel[center+i][center+j];
                    }
                }
            }
            return Val;
        }

        //algo referenced by 
        //https://stackoverflow.com/questions/2368728/can-normal-maps-be-generated-from-a-texture/2368794#2368794
        //https://github.com/cpetry/NormalMap-Online/blob/gh-pages/javascripts/normalMap.js
        drawNormalMap(strength:number=2.5,level:number=7.0){

            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
            var cvs = this.canvas;
            let imgData = this.getImageData();
            for (var j = 0; j < cvs.height; j++) {
                for (var i = 0; i < cvs.width; i++) {
                    var index = (j * cvs.width + i) * 4;

                    var Dx = this.sobel_filter(this.grayDataBuffer,j,i,"horizontal");
                    var Dy = this.sobel_filter(this.grayDataBuffer,j,i,"vertical");
                    var Dz = 1.0/strength * (1.0 + Math.pow(2.0, level));

                    //normalize
                    var v = new EcognitaMathLib.Vector(3,[Dx,Dy,Dz]);
                    v.normalize();
                    var data = v.data();
             
                    imgData.data[index + 0] = this.convEdgeVal2RGB(data[0]);
                    imgData.data[index + 1] = this.convEdgeVal2RGB(data[1]);;
                    imgData.data[index + 2] = this.convEdgeVal2RGB(data[2]);;
                    imgData.data[index + 3] = 255;
                }
            }
            this.context.putImageData(imgData, 0, 0);
        }

        getImageData(){
            //console.log(this.context.getImageData(0,0,this.canvas.width,this.canvas.height));
            return this.context.getImageData(0,0,this.canvas.width,this.canvas.height);
        }

        
    }
}