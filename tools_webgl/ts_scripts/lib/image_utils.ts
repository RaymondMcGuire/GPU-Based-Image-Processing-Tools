/* =========================================================================
 *
 *  image_utils.ts
 *  simple func for processing image
 * 
 * ========================================================================= */
module EcognitaMathLib {
    export class ImageView{
        canvas:any;
        context:any;
        image:any;
        imageDataBuffer:any;
        constructor(cvs:any,url:string){
            var image = new Image();
            image.src = url;

            this.canvas = cvs;
            this.context =  cvs.getContext('2d');
            this.image = image;
            this.imageDataBuffer = [];
        }

        private convertGray(r:number, g:number, b:number) {
            return 0.299 * r + 0.578 * g + 0.114 * b;
        }

        drawImage(left:number = 0, top:number = 0){
            this.image.onload =  (() => { 
                this.context.drawImage(this.image, left, top);
                var cvs = this.canvas;
                let imgData = this.getImageData();
                for (var j = 0; j < cvs.height; j++) {
                    for (var i = 0; i < cvs.width; i++) {
                        var index = (j * cvs.width + i) * 4;
                        this.imageDataBuffer.push(imgData.data[index + 0]);
                        this.imageDataBuffer.push(imgData.data[index + 1]);
                        this.imageDataBuffer.push(imgData.data[index + 2]);
                        this.imageDataBuffer.push(imgData.data[index + 3]);
                    }
                
                }
                this.drawGrayImage();
            });
        }

        drawGrayImage(){

                this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
                var cvs = this.canvas;
                let imgData = this.getImageData();
                for (var j = 0; j < cvs.height; j++) {
                    for (var i = 0; i < cvs.width; i++) {
                        var index = (j * cvs.width + i) * 4;
                        var grayVal = this.convertGray(this.imageDataBuffer[index + 0],this.imageDataBuffer[index + 1],this.imageDataBuffer[index + 2]);
                        imgData.data[index + 0] = grayVal;
                        imgData.data[index + 1] = grayVal;
                        imgData.data[index + 2] = grayVal;
                        imgData.data[index + 3] = 255;
                    }
                }
                this.context.putImageData(imgData, 0, 0);
            
        }

        drawNormalMap(factor:number=1.0,attenuation:number=1.56){
            this.image.onload =  (() => { 
                this.context.drawImage(this.image, 0, 0);
               
            

             });
        }

        getImageData(){
            //console.log(this.context.getImageData(0,0,this.canvas.width,this.canvas.height));
            return this.context.getImageData(0,0,this.canvas.width,this.canvas.height);
        }

        
    }
}