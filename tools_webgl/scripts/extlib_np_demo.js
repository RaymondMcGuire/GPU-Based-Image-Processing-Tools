/* =========================================================================
 *
 *  math_utils.ts
 *  simple math functions
 * ========================================================================= */
var EcognitaMathLib;
(function (EcognitaMathLib) {
    function absmax(x, y) {
        return (x * x > y * y) ? x : y;
    }
    EcognitaMathLib.absmax = absmax;
    function absmin(x, y) {
        return (x * x < y * y) ? x : y;
    }
    EcognitaMathLib.absmin = absmin;
})(EcognitaMathLib || (EcognitaMathLib = {}));
/* =========================================================================
 *
 *  vector.ts
 *  T-D vector data
 *  T:type,default setting is number
 *  D:dimension
 * ========================================================================= */
/// <reference path="./math_utils.ts" />
var EcognitaMathLib;
(function (EcognitaMathLib) {
    var Vector = /** @class */ (function () {
        //constructs vector with parameters or zero
        function Vector(dimension, params) {
            this._dimension = dimension;
            if (params == undefined) {
                //init n dimension vector data,setting all 0
                this._elements = new Array(dimension);
                for (var _i = 0; _i < dimension; _i++) {
                    this._elements[_i] = 0;
                }
            }
            else {
                this._elements = new Array(dimension);
                for (var _i = 0; _i < params.length; _i++) {
                    this._elements[_i] = params[_i];
                }
            }
        }
        Vector.prototype.set = function (params) {
            if (params.size() != this.size()) {
                console.log("dimension is not correct!");
                return undefined;
            }
            for (var _i = 0; _i < params.size(); _i++) {
                this._elements[_i] = params.data()[_i];
            }
        };
        Vector.prototype.setZero = function () {
            for (var _i = 0; _i < this._dimension; _i++) {
                this._elements[_i] = 0;
            }
        };
        Vector.prototype.data = function () { return this._elements; };
        Vector.prototype.at = function (idx) {
            if (idx < 0 || idx >= this.size()) {
                console.log("index is not correct!");
                return undefined;
            }
            return this._elements[idx];
        };
        Vector.prototype.dot = function (others) {
            if (others.size() != this.size()) {
                console.log("dimension is not correct!");
                return undefined;
            }
            var ret = 0;
            for (var _i = 0; _i < this.size(); _i++) {
                ret += this._elements[_i] * others.data()[_i];
            }
            return ret;
        };
        Vector.prototype.lengthSquared = function () { return this.dot(this); };
        Vector.prototype.length = function () { return Math.sqrt(this.lengthSquared()); };
        Vector.prototype.normalize = function () { this.idiv(this.length()); };
        Vector.prototype.sum = function () {
            var ret = 0;
            for (var _i = 0; _i < this._dimension; _i++) {
                ret += this._elements[_i];
            }
            return ret;
        };
        Vector.prototype.size = function () { return this._dimension; };
        Vector.prototype.avg = function () { return this.sum() / this.size(); };
        Vector.prototype.min = function () {
            var minVal = this._elements[0];
            for (var _i = 1; _i < this._dimension; _i++) {
                minVal = Math.min(minVal, this._elements[_i]);
            }
            return minVal;
        };
        Vector.prototype.max = function () {
            var maxVal = this._elements[0];
            for (var _i = 1; _i < this._dimension; _i++) {
                maxVal = Math.max(maxVal, this._elements[_i]);
            }
            return maxVal;
        };
        Vector.prototype.absmax = function () {
            var absMaxVal = this._elements[0];
            for (var _i = 1; _i < this._dimension; _i++) {
                absMaxVal = EcognitaMathLib.absmax(absMaxVal, this._elements[_i]);
            }
            return absMaxVal;
        };
        Vector.prototype.absmin = function () {
            var absMinVal = this._elements[0];
            for (var _i = 1; _i < this._dimension; _i++) {
                absMinVal = EcognitaMathLib.absmin(absMinVal, this._elements[_i]);
            }
            return absMinVal;
        };
        Vector.prototype.distanceSquaredTo = function (others) {
            if (others.size() != this.size()) {
                console.log("dimension is not correct!");
                return undefined;
            }
            var ret = 0;
            for (var _i = 0; _i < this.size(); _i++) {
                var diff = this._elements[_i] - others.data()[_i];
                ret += diff * diff;
            }
            return ret;
        };
        Vector.prototype.distanceTo = function (others) {
            return Math.sqrt(this.distanceSquaredTo(others));
        };
        Vector.prototype.isEqual = function (others) {
            if (this.size() != others.size())
                return false;
            for (var _i = 0; _i < this.size(); _i++) {
                if (this.at(_i) != others.at(_i))
                    return false;
            }
            return true;
        };
        Vector.prototype.isSimilar = function (others, epsilon) {
            if (this.size() != others.size())
                return false;
            for (var _i = 0; _i < this.size(); _i++) {
                if (Math.abs(this.at(_i) - others.at(_i)) > epsilon)
                    return false;
            }
            return true;
        };
        Vector.prototype.add = function (params) {
            if (typeof (params) == 'object') {
                var v = params;
                if (v.size() != this.size())
                    return undefined;
                var newV = new Vector(this.size(), this.data());
                for (var _i = 0; _i < newV.size(); _i++) {
                    newV.data()[_i] += v.data()[_i];
                }
                return newV;
            }
            else if (typeof (params) == 'number') {
                var s = params;
                var newV = new Vector(this.size(), this.data());
                for (var _i = 0; _i < newV.size(); _i++) {
                    newV.data()[_i] += s;
                }
                return newV;
            }
            return undefined;
        };
        Vector.prototype.sub = function (params) {
            if (typeof (params) == 'object') {
                var v = params;
                if (v.size() != this.size())
                    return undefined;
                var newV = new Vector(this.size(), this.data());
                for (var _i = 0; _i < newV.size(); _i++) {
                    newV.data()[_i] -= v.data()[_i];
                }
                return newV;
            }
            else if (typeof (params) == 'number') {
                var s = params;
                var newV = new Vector(this.size(), this.data());
                for (var _i = 0; _i < newV.size(); _i++) {
                    newV.data()[_i] -= s;
                }
                return newV;
            }
            return undefined;
        };
        Vector.prototype.mul = function (params) {
            if (typeof (params) == 'object') {
                var v = params;
                if (v.size() != this.size())
                    return undefined;
                var newV = new Vector(this.size(), this.data());
                for (var _i = 0; _i < newV.size(); _i++) {
                    newV.data()[_i] *= v.data()[_i];
                }
                return newV;
            }
            else if (typeof (params) == 'number') {
                var s = params;
                var newV = new Vector(this.size(), this.data());
                for (var _i = 0; _i < newV.size(); _i++) {
                    newV.data()[_i] *= s;
                }
                return newV;
            }
            return undefined;
        };
        Vector.prototype.div = function (params) {
            if (typeof (params) == 'object') {
                var v = params;
                if (v.size() != this.size())
                    return undefined;
                var newV = new Vector(this.size(), this.data());
                for (var _i = 0; _i < newV.size(); _i++) {
                    newV.data()[_i] /= v.data()[_i];
                }
                return newV;
            }
            else if (typeof (params) == 'number') {
                var s = params;
                if (s == 0)
                    return undefined;
                var newV = new Vector(this.size(), this.data());
                for (var _i = 0; _i < newV.size(); _i++) {
                    newV.data()[_i] /= s;
                }
                return newV;
            }
            return undefined;
        };
        Vector.prototype.idiv = function (params) { this.set(this.div(params)); };
        Vector.prototype.iadd = function (params) { this.set(this.add(params)); };
        Vector.prototype.isub = function (params) { this.set(this.sub(params)); };
        Vector.prototype.imul = function (params) { this.set(this.mul(params)); };
        Vector.prototype.setAt = function (idx, val) {
            if (idx < 0 || idx >= this.size()) {
                return undefined;
            }
            this._elements[idx] = val;
        };
        return Vector;
    }());
    EcognitaMathLib.Vector = Vector;
})(EcognitaMathLib || (EcognitaMathLib = {}));
/* =========================================================================
 *
 *  image_utils.ts
 *  simple func for processing image
 *
 * ========================================================================= */
/// <reference path="../extlib/vector.ts" />
var EcognitaMathLib;
(function (EcognitaMathLib) {
    var ImageView = /** @class */ (function () {
        function ImageView(cvs, url) {
            var image = new Image();
            image.src = url;
            this.canvas = cvs;
            this.context = cvs.getContext('2d');
            this.image = image;
            this.imageDataBuffer = new Array(cvs.height);
            this.grayDataBuffer = new Array(cvs.height);
        }
        ImageView.prototype.convertGray = function (r, g, b) {
            return 0.299 * r + 0.578 * g + 0.114 * b;
        };
        //transfrom -1~1 to 0~255
        ImageView.prototype.convEdgeVal2RGB = function (val) {
            return (val + 1.0) * (255.0 / 2.0);
        };
        ImageView.prototype.readImageData = function (left, top) {
            if (left === void 0) { left = 0; }
            if (top === void 0) { top = 0; }
            this.context.drawImage(this.image, left, top);
            var cvs = this.canvas;
            var imgData = this.getImageData();
            for (var j = 0; j < cvs.height; j++) {
                this.imageDataBuffer[j] = new Array(this.canvas.width);
                this.grayDataBuffer[j] = new Array(this.canvas.width);
                for (var i = 0; i < cvs.width; i++) {
                    var index = (j * cvs.width + i) * 4;
                    this.imageDataBuffer[j][i] = new Array(4);
                    this.imageDataBuffer[j][i][0] = imgData.data[index + 0];
                    this.imageDataBuffer[j][i][1] = imgData.data[index + 1];
                    this.imageDataBuffer[j][i][2] = imgData.data[index + 2];
                    this.imageDataBuffer[j][i][3] = imgData.data[index + 3];
                    var grayVal = this.convertGray(this.imageDataBuffer[j][i][0], this.imageDataBuffer[j][i][1], this.imageDataBuffer[j][i][2]);
                    this.grayDataBuffer[j][i] = grayVal;
                }
            }
        };
        ImageView.prototype.drawGrayImage = function () {
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
            var cvs = this.canvas;
            var imgData = this.getImageData();
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
        };
        ImageView.prototype.sobel_filter = function (data_buffer, idx_y, idx_x, type, kernel_size) {
            // 1  2  1   vertical     1  0  -1  horizontal
            // 0  0  0                2  0  -2
            //-1 -2 -1                1  0  -1
            if (type === void 0) { type = "vertical"; }
            if (kernel_size === void 0) { kernel_size = 3; }
            var vertical_sobel = [[-1, -2, -1],
                [0, 0, 0],
                [1, 2, 1]];
            var horizontal_sobel = [[-1, 0, 1],
                [-2, 0, 2],
                [-1, 0, 1]];
            var Val = 0;
            var center = Math.floor(kernel_size / 2);
            for (var i = -center; i <= center; i++) {
                for (var j = -center; j <= center; j++) {
                    //chk out of range
                    if (idx_y + i < 0 || idx_x + j < 0 || idx_y + i >= this.canvas.height || idx_x + j >= this.canvas.width)
                        continue;
                    if (type == "vertical") {
                        Val += data_buffer[idx_y + i][idx_x + j] * vertical_sobel[center + i][center + j];
                    }
                    else if (type == "horizontal") {
                        Val += data_buffer[idx_y + i][idx_x + j] * horizontal_sobel[center + i][center + j];
                    }
                }
            }
            return Val;
        };
        //algo referenced by 
        //https://stackoverflow.com/questions/2368728/can-normal-maps-be-generated-from-a-texture/2368794#2368794
        //https://github.com/cpetry/NormalMap-Online/blob/gh-pages/javascripts/normalMap.js
        ImageView.prototype.drawNormalMap = function (strength, level) {
            if (strength === void 0) { strength = 2.5; }
            if (level === void 0) { level = 7.0; }
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
            var cvs = this.canvas;
            var imgData = this.getImageData();
            for (var j = 0; j < cvs.height; j++) {
                for (var i = 0; i < cvs.width; i++) {
                    var index = (j * cvs.width + i) * 4;
                    var Dx = this.sobel_filter(this.grayDataBuffer, j, i, "horizontal");
                    var Dy = this.sobel_filter(this.grayDataBuffer, j, i, "vertical");
                    var Dz = 1.0 / strength * (1.0 + Math.pow(2.0, level));
                    //normalize
                    var v = new EcognitaMathLib.Vector(3, [Dx, Dy, Dz]);
                    v.normalize();
                    var data = v.data();
                    imgData.data[index + 0] = this.convEdgeVal2RGB(data[0]);
                    imgData.data[index + 1] = this.convEdgeVal2RGB(data[1]);
                    ;
                    imgData.data[index + 2] = this.convEdgeVal2RGB(data[2]);
                    ;
                    imgData.data[index + 3] = 255;
                }
            }
            this.context.putImageData(imgData, 0, 0);
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
 *  demo.ts
 *  demo for normal map generator
 *
 * ========================================================================= */
/// <reference path="../lib/image_utils.ts" />
var cvs_hm = document.getElementById('canvas_heightmap');
var cvs_nm = document.getElementById('canvas_normalmap');
var strength = parseFloat(document.getElementById("p_s").value);
var level = parseFloat(document.getElementById("p_l").value);
cvs_hm.height = 512;
cvs_hm.width = 512;
cvs_nm.height = 512;
cvs_nm.width = 512;
var HeightMapViewer = new EcognitaMathLib.ImageView(cvs_hm, "./project/NormalMapGenerator/img/heightmap.jpg");
HeightMapViewer.image.onload = (function () {
    HeightMapViewer.readImageData();
});
var NormalMapViewer = new EcognitaMathLib.ImageView(cvs_nm, "./project/NormalMapGenerator/img/heightmap.jpg");
NormalMapViewer.image.onload = (function () {
    NormalMapViewer.readImageData();
    NormalMapViewer.drawNormalMap(strength, level);
    document.getElementById("generate_normalmap").addEventListener("click", function () {
        strength = parseFloat(document.getElementById("p_s").value);
        level = parseFloat(document.getElementById("p_l").value);
        NormalMapViewer.drawNormalMap(strength, level);
    });
});
