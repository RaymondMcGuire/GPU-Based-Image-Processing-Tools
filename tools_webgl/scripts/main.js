/* =========================================================================
 *
 *  image_utils.ts
 *  simple func for processing image
 *
 * ========================================================================= */
var EcognitaMathLib;
(function (EcognitaMathLib) {
    var ImageView = /** @class */ (function () {
        function ImageView(cvs, url) {
            var image = new Image();
            image.src = url;
            this.canvas = cvs;
            this.context = cvs.getContext('2d');
            this.image = image;
            this.imageDataBuffer = [];
        }
        ImageView.prototype.convertGray = function (r, g, b) {
            return 0.299 * r + 0.578 * g + 0.114 * b;
        };
        ImageView.prototype.drawImage = function (left, top) {
            var _this = this;
            if (left === void 0) { left = 0; }
            if (top === void 0) { top = 0; }
            this.image.onload = (function () {
                _this.context.drawImage(_this.image, left, top);
                var cvs = _this.canvas;
                var imgData = _this.getImageData();
                for (var j = 0; j < cvs.height; j++) {
                    for (var i = 0; i < cvs.width; i++) {
                        var index = (j * cvs.width + i) * 4;
                        _this.imageDataBuffer.push(imgData.data[index + 0]);
                        _this.imageDataBuffer.push(imgData.data[index + 1]);
                        _this.imageDataBuffer.push(imgData.data[index + 2]);
                        _this.imageDataBuffer.push(imgData.data[index + 3]);
                    }
                }
                _this.drawGrayImage();
            });
        };
        ImageView.prototype.drawGrayImage = function () {
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
            var cvs = this.canvas;
            var imgData = this.getImageData();
            for (var j = 0; j < cvs.height; j++) {
                for (var i = 0; i < cvs.width; i++) {
                    var index = (j * cvs.width + i) * 4;
                    var grayVal = this.convertGray(this.imageDataBuffer[index + 0], this.imageDataBuffer[index + 1], this.imageDataBuffer[index + 2]);
                    imgData.data[index + 0] = grayVal;
                    imgData.data[index + 1] = grayVal;
                    imgData.data[index + 2] = grayVal;
                    imgData.data[index + 3] = 255;
                }
            }
            this.context.putImageData(imgData, 0, 0);
        };
        ImageView.prototype.drawNormalMap = function (factor, attenuation) {
            var _this = this;
            if (factor === void 0) { factor = 1.0; }
            if (attenuation === void 0) { attenuation = 1.56; }
            this.image.onload = (function () {
                _this.context.drawImage(_this.image, 0, 0);
            });
        };
        ImageView.prototype.getImageData = function () {
            //console.log(this.context.getImageData(0,0,this.canvas.width,this.canvas.height));
            return this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
        };
        return ImageView;
    }());
    EcognitaMathLib.ImageView = ImageView;
})(EcognitaMathLib || (EcognitaMathLib = {}));
/* =========================================================================
 *
 *  main.ts
 *  test some image process tools
 *
 * ========================================================================= */
/// <reference path="./lib/image_utils.ts" />
var cvs = document.getElementById('canvas');
cvs.width = 256;
cvs.height = 256;
var ImageViewer = new EcognitaMathLib.ImageView(cvs, "./img/test1.png");
ImageViewer.drawImage();
