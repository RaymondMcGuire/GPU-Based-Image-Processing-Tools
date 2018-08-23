/* =========================================================================
 *
 *  cv_imread.ts
 *  read the image file
 *
 * ========================================================================= */
var EcognitaMathLib;
(function (EcognitaMathLib) {
    function imread(file) {
        var img = new Image();
        img.src = file;
        return img;
    }
    EcognitaMathLib.imread = imread;
})(EcognitaMathLib || (EcognitaMathLib = {}));
/* =========================================================================
 *
 *  extra_utils.ts
 *  simple utils from extra library
 *
 * ========================================================================= */
var EcognitaMathLib;
(function (EcognitaMathLib) {
    var Hammer_Utils = /** @class */ (function () {
        //event listener dom,
        function Hammer_Utils(canvas) {
            //event listener
            //using hammer library
            this.hm = new Hammer(canvas);
            this.on_pan = undefined;
        }
        Hammer_Utils.prototype.enablePan = function () {
            if (this.on_pan == undefined) {
                console.log("please setting the PAN function!");
                return;
            }
            this.hm.add(new Hammer.Pan({ direction: Hammer.DIRECTION_ALL, threshold: 0 }));
            this.hm.on("pan", this.on_pan);
        };
        return Hammer_Utils;
    }());
    EcognitaMathLib.Hammer_Utils = Hammer_Utils;
})(EcognitaMathLib || (EcognitaMathLib = {}));
/* =========================================================================
 *
 *  webgl_matrix.ts
 *  a matrix library developed for webgl
 *  part of source code referenced by minMatrix.js
 *  https://wgld.org/d/library/l001.html
 * ========================================================================= */
var EcognitaMathLib;
(function (EcognitaMathLib) {
    var WebGLMatrix = /** @class */ (function () {
        function WebGLMatrix() {
            this.inverse = function (mat1) {
                var mat = this.create();
                var a = mat1[0], b = mat1[1], c = mat1[2], d = mat1[3], e = mat1[4], f = mat1[5], g = mat1[6], h = mat1[7], i = mat1[8], j = mat1[9], k = mat1[10], l = mat1[11], m = mat1[12], n = mat1[13], o = mat1[14], p = mat1[15], q = a * f - b * e, r = a * g - c * e, s = a * h - d * e, t = b * g - c * f, u = b * h - d * f, v = c * h - d * g, w = i * n - j * m, x = i * o - k * m, y = i * p - l * m, z = j * o - k * n, A = j * p - l * n, B = k * p - l * o, ivd = 1 / (q * B - r * A + s * z + t * y - u * x + v * w);
                mat[0] = (f * B - g * A + h * z) * ivd;
                mat[1] = (-b * B + c * A - d * z) * ivd;
                mat[2] = (n * v - o * u + p * t) * ivd;
                mat[3] = (-j * v + k * u - l * t) * ivd;
                mat[4] = (-e * B + g * y - h * x) * ivd;
                mat[5] = (a * B - c * y + d * x) * ivd;
                mat[6] = (-m * v + o * s - p * r) * ivd;
                mat[7] = (i * v - k * s + l * r) * ivd;
                mat[8] = (e * A - f * y + h * w) * ivd;
                mat[9] = (-a * A + b * y - d * w) * ivd;
                mat[10] = (m * u - n * s + p * q) * ivd;
                mat[11] = (-i * u + j * s - l * q) * ivd;
                mat[12] = (-e * z + f * x - g * w) * ivd;
                mat[13] = (a * z - b * x + c * w) * ivd;
                mat[14] = (-m * t + n * r - o * q) * ivd;
                mat[15] = (i * t - j * r + k * q) * ivd;
                return mat;
            };
        }
        WebGLMatrix.prototype.create = function () { return new Float32Array(16); };
        WebGLMatrix.prototype.identity = function (mat) {
            mat[0] = 1;
            mat[1] = 0;
            mat[2] = 0;
            mat[3] = 0;
            mat[4] = 0;
            mat[5] = 1;
            mat[6] = 0;
            mat[7] = 0;
            mat[8] = 0;
            mat[9] = 0;
            mat[10] = 1;
            mat[11] = 0;
            mat[12] = 0;
            mat[13] = 0;
            mat[14] = 0;
            mat[15] = 1;
            return mat;
        };
        //mat2 x mat1,give mat1 a transform(mat2)
        WebGLMatrix.prototype.multiply = function (mat1, mat2) {
            var mat = this.create();
            var a = mat1[0], b = mat1[1], c = mat1[2], d = mat1[3], e = mat1[4], f = mat1[5], g = mat1[6], h = mat1[7], i = mat1[8], j = mat1[9], k = mat1[10], l = mat1[11], m = mat1[12], n = mat1[13], o = mat1[14], p = mat1[15], A = mat2[0], B = mat2[1], C = mat2[2], D = mat2[3], E = mat2[4], F = mat2[5], G = mat2[6], H = mat2[7], I = mat2[8], J = mat2[9], K = mat2[10], L = mat2[11], M = mat2[12], N = mat2[13], O = mat2[14], P = mat2[15];
            mat[0] = A * a + B * e + C * i + D * m;
            mat[1] = A * b + B * f + C * j + D * n;
            mat[2] = A * c + B * g + C * k + D * o;
            mat[3] = A * d + B * h + C * l + D * p;
            mat[4] = E * a + F * e + G * i + H * m;
            mat[5] = E * b + F * f + G * j + H * n;
            mat[6] = E * c + F * g + G * k + H * o;
            mat[7] = E * d + F * h + G * l + H * p;
            mat[8] = I * a + J * e + K * i + L * m;
            mat[9] = I * b + J * f + K * j + L * n;
            mat[10] = I * c + J * g + K * k + L * o;
            mat[11] = I * d + J * h + K * l + L * p;
            mat[12] = M * a + N * e + O * i + P * m;
            mat[13] = M * b + N * f + O * j + P * n;
            mat[14] = M * c + N * g + O * k + P * o;
            mat[15] = M * d + N * h + O * l + P * p;
            return mat;
        };
        WebGLMatrix.prototype.scale = function (mat1, param_scale) {
            var mat = this.create();
            if (param_scale.length != 3)
                return undefined;
            mat[0] = mat1[0] * param_scale[0];
            mat[1] = mat1[1] * param_scale[0];
            mat[2] = mat1[2] * param_scale[0];
            mat[3] = mat1[3] * param_scale[0];
            mat[4] = mat1[4] * param_scale[1];
            mat[5] = mat1[5] * param_scale[1];
            mat[6] = mat1[6] * param_scale[1];
            mat[7] = mat1[7] * param_scale[1];
            mat[8] = mat1[8] * param_scale[2];
            mat[9] = mat1[9] * param_scale[2];
            mat[10] = mat1[10] * param_scale[2];
            mat[11] = mat1[11] * param_scale[2];
            mat[12] = mat1[12];
            mat[13] = mat1[13];
            mat[14] = mat1[14];
            mat[15] = mat1[15];
            return mat;
        };
        //vec * matrix,so translate matrix should use its transpose matrix
        WebGLMatrix.prototype.translate = function (mat1, param_translate) {
            var mat = this.create();
            if (param_translate.length != 3)
                return undefined;
            mat[0] = mat1[0];
            mat[1] = mat1[1];
            mat[2] = mat1[2];
            mat[3] = mat1[3];
            mat[4] = mat1[4];
            mat[5] = mat1[5];
            mat[6] = mat1[6];
            mat[7] = mat1[7];
            mat[8] = mat1[8];
            mat[9] = mat1[9];
            mat[10] = mat1[10];
            mat[11] = mat1[11];
            mat[12] = mat1[0] * param_translate[0] + mat1[4] * param_translate[1] + mat1[8] * param_translate[2] + mat1[12];
            mat[13] = mat1[1] * param_translate[0] + mat1[5] * param_translate[1] + mat1[9] * param_translate[2] + mat1[13];
            mat[14] = mat1[2] * param_translate[0] + mat1[6] * param_translate[1] + mat1[10] * param_translate[2] + mat1[14];
            mat[15] = mat1[3] * param_translate[0] + mat1[7] * param_translate[1] + mat1[11] * param_translate[2] + mat1[15];
            return mat;
        };
        // https://dspace.lboro.ac.uk/dspace-jspui/handle/2134/18050
        WebGLMatrix.prototype.rotate = function (mat1, angle, axis) {
            var mat = this.create();
            if (axis.length != 3)
                return undefined;
            var sq = Math.sqrt(axis[0] * axis[0] + axis[1] * axis[1] + axis[2] * axis[2]);
            if (!sq) {
                return undefined;
            }
            var a = axis[0], b = axis[1], c = axis[2];
            if (sq != 1) {
                sq = 1 / sq;
                a *= sq;
                b *= sq;
                c *= sq;
            }
            var d = Math.sin(angle), e = Math.cos(angle), f = 1 - e, g = mat1[0], h = mat1[1], i = mat1[2], j = mat1[3], k = mat1[4], l = mat1[5], m = mat1[6], n = mat1[7], o = mat1[8], p = mat1[9], q = mat1[10], r = mat1[11], s = a * a * f + e, t = b * a * f + c * d, u = c * a * f - b * d, v = a * b * f - c * d, w = b * b * f + e, x = c * b * f + a * d, y = a * c * f + b * d, z = b * c * f - a * d, A = c * c * f + e;
            if (angle) {
                if (mat1 != mat) {
                    mat[12] = mat1[12];
                    mat[13] = mat1[13];
                    mat[14] = mat1[14];
                    mat[15] = mat1[15];
                }
            }
            else {
                mat = mat1;
            }
            mat[0] = g * s + k * t + o * u;
            mat[1] = h * s + l * t + p * u;
            mat[2] = i * s + m * t + q * u;
            mat[3] = j * s + n * t + r * u;
            mat[4] = g * v + k * w + o * x;
            mat[5] = h * v + l * w + p * x;
            mat[6] = i * v + m * w + q * x;
            mat[7] = j * v + n * w + r * x;
            mat[8] = g * y + k * z + o * A;
            mat[9] = h * y + l * z + p * A;
            mat[10] = i * y + m * z + q * A;
            mat[11] = j * y + n * z + r * A;
            return mat;
        };
        WebGLMatrix.prototype.viewMatrix = function (cam, target, up) {
            var mat = this.identity(this.create());
            if (cam.length != 3 || target.length != 3 || up.length != 3)
                return undefined;
            var camX = cam[0], camY = cam[1], camZ = cam[2];
            var targetX = target[0], targetY = target[1], targetZ = target[2];
            var upX = up[0], upY = up[1], upZ = up[2];
            //cam and target have the same position
            if (camX == targetX && camY == targetY && camZ == targetZ)
                return mat;
            var forwardX = camX - targetX, forwardY = camY - targetY, forwardZ = camZ - targetZ;
            var l = 1 / Math.sqrt(forwardX * forwardX + forwardY * forwardY + forwardZ * forwardZ);
            forwardX *= l;
            forwardY *= l;
            forwardZ *= l;
            var rightX = upY * forwardZ - upZ * forwardY;
            var rightY = upZ * forwardX - upX * forwardZ;
            var rightZ = upX * forwardY - upY * forwardX;
            l = Math.sqrt(rightX * rightX + rightY * rightY + rightZ * rightZ);
            if (!l) {
                rightX = 0;
                rightY = 0;
                rightZ = 0;
            }
            else {
                l = 1 / Math.sqrt(rightX * rightX + rightY * rightY + rightZ * rightZ);
                rightX *= l;
                rightY *= l;
                rightZ *= l;
            }
            upX = forwardY * rightZ - forwardZ * rightY;
            upY = forwardZ * rightX - forwardX * rightZ;
            upZ = forwardX * rightY - forwardY * rightX;
            mat[0] = rightX;
            mat[1] = upX;
            mat[2] = forwardX;
            mat[3] = 0;
            mat[4] = rightY;
            mat[5] = upY;
            mat[6] = forwardY;
            mat[7] = 0;
            mat[8] = rightZ;
            mat[9] = upZ;
            mat[10] = forwardZ;
            mat[11] = 0;
            mat[12] = -(rightX * camX + rightY * camY + rightZ * camZ);
            mat[13] = -(upX * camX + upY * camY + upZ * camZ);
            mat[14] = -(forwardX * camX + forwardY * camY + forwardZ * camZ);
            mat[15] = 1;
            return mat;
        };
        WebGLMatrix.prototype.perspectiveMatrix = function (fovy, aspect, near, far) {
            var mat = this.identity(this.create());
            var t = near * Math.tan(fovy * Math.PI / 360);
            var r = t * aspect;
            var a = r * 2, b = t * 2, c = far - near;
            mat[0] = near * 2 / a;
            mat[1] = 0;
            mat[2] = 0;
            mat[3] = 0;
            mat[4] = 0;
            mat[5] = near * 2 / b;
            mat[6] = 0;
            mat[7] = 0;
            mat[8] = 0;
            mat[9] = 0;
            mat[10] = -(far + near) / c;
            mat[11] = -1;
            mat[12] = 0;
            mat[13] = 0;
            mat[14] = -(far * near * 2) / c;
            mat[15] = 0;
            return mat;
        };
        WebGLMatrix.prototype.transpose = function (mat1) {
            var mat = this.create();
            mat[0] = mat1[0];
            mat[1] = mat1[4];
            mat[2] = mat1[8];
            mat[3] = mat1[12];
            mat[4] = mat1[1];
            mat[5] = mat1[5];
            mat[6] = mat1[9];
            mat[7] = mat1[13];
            mat[8] = mat1[2];
            mat[9] = mat1[6];
            mat[10] = mat1[10];
            mat[11] = mat1[14];
            mat[12] = mat1[3];
            mat[13] = mat1[7];
            mat[14] = mat1[11];
            mat[15] = mat1[15];
            return mat;
        };
        return WebGLMatrix;
    }());
    EcognitaMathLib.WebGLMatrix = WebGLMatrix;
})(EcognitaMathLib || (EcognitaMathLib = {}));
/* =========================================================================
 *
 *  webgl_quaternion.ts
 *  a quaternion library developed for webgl
 *  part of source code referenced by minMatrix.js
 *  https://wgld.org/d/library/l001.html
 * ========================================================================= */
var EcognitaMathLib;
(function (EcognitaMathLib) {
    var WebGLQuaternion = /** @class */ (function () {
        function WebGLQuaternion() {
        }
        WebGLQuaternion.prototype.create = function () { return new Float32Array(4); };
        WebGLQuaternion.prototype.identity = function (qat) {
            qat[0] = 0;
            qat[1] = 0;
            qat[2] = 0;
            qat[3] = 1;
            return qat;
        };
        WebGLQuaternion.prototype.inverse = function (qat) {
            var out_qat = this.create();
            out_qat[0] = -qat[0];
            out_qat[1] = -qat[1];
            out_qat[2] = -qat[2];
            out_qat[3] = qat[3];
            return out_qat;
        };
        WebGLQuaternion.prototype.normalize = function (qat) {
            var x = qat[0], y = qat[1], z = qat[2], w = qat[3];
            var l = Math.sqrt(x * x + y * y + z * z + w * w);
            if (l === 0) {
                qat[0] = 0;
                qat[1] = 0;
                qat[2] = 0;
                qat[3] = 0;
            }
            else {
                l = 1 / l;
                qat[0] = x * l;
                qat[1] = y * l;
                qat[2] = z * l;
                qat[3] = w * l;
            }
            return qat;
        };
        //q1(v1,w1) q2(v2,w2)
        //v(Im) =  xi + yj + zk
        //w(Re)
        //q1q2 = (v1 x v2 + w2v1 + w1v2,w1w2 - v1・v2)
        WebGLQuaternion.prototype.multiply = function (qat1, qat2) {
            var out_qat = this.create();
            var ax = qat1[0], ay = qat1[1], az = qat1[2], aw = qat1[3];
            var bx = qat2[0], by = qat2[1], bz = qat2[2], bw = qat2[3];
            out_qat[0] = ax * bw + aw * bx + ay * bz - az * by;
            out_qat[1] = ay * bw + aw * by + az * bx - ax * bz;
            out_qat[2] = az * bw + aw * bz + ax * by - ay * bx;
            out_qat[3] = aw * bw - ax * bx - ay * by - az * bz;
            return out_qat;
        };
        WebGLQuaternion.prototype.rotate = function (angle, axis) {
            var sq = Math.sqrt(axis[0] * axis[0] + axis[1] * axis[1] + axis[2] * axis[2]);
            if (!sq) {
                console.log("need a axis value");
                return undefined;
            }
            var a = axis[0], b = axis[1], c = axis[2];
            if (sq != 1) {
                sq = 1 / sq;
                a *= sq;
                b *= sq;
                c *= sq;
            }
            var s = Math.sin(angle * 0.5);
            var out_qat = this.create();
            out_qat[0] = a * s;
            out_qat[1] = b * s;
            out_qat[2] = c * s;
            out_qat[3] = Math.cos(angle * 0.5);
            return out_qat;
        };
        //P' = qPq^(-1)
        WebGLQuaternion.prototype.ToV3 = function (p_v3, q) {
            var out_p = new Array(3);
            var inv_q = this.inverse(q);
            var in_p = this.create();
            in_p[0] = p_v3[0];
            in_p[1] = p_v3[1];
            in_p[2] = p_v3[2];
            var p_invq = this.multiply(inv_q, in_p);
            var q_p_invq = this.multiply(p_invq, q);
            out_p[0] = q_p_invq[0];
            out_p[1] = q_p_invq[1];
            out_p[2] = q_p_invq[2];
            return out_p;
        };
        WebGLQuaternion.prototype.ToMat4x4 = function (q) {
            var out_mat = new Float32Array(16);
            var x = q[0], y = q[1], z = q[2], w = q[3];
            var x2 = x + x, y2 = y + y, z2 = z + z;
            var xx = x * x2, xy = x * y2, xz = x * z2;
            var yy = y * y2, yz = y * z2, zz = z * z2;
            var wx = w * x2, wy = w * y2, wz = w * z2;
            out_mat[0] = 1 - (yy + zz);
            out_mat[1] = xy - wz;
            out_mat[2] = xz + wy;
            out_mat[3] = 0;
            out_mat[4] = xy + wz;
            out_mat[5] = 1 - (xx + zz);
            out_mat[6] = yz - wx;
            out_mat[7] = 0;
            out_mat[8] = xz - wy;
            out_mat[9] = yz + wx;
            out_mat[10] = 1 - (xx + yy);
            out_mat[11] = 0;
            out_mat[12] = 0;
            out_mat[13] = 0;
            out_mat[14] = 0;
            out_mat[15] = 1;
            return out_mat;
        };
        WebGLQuaternion.prototype.slerp = function (qtn1, qtn2, time) {
            if (time < 0 || time > 1) {
                console.log("parameter time's setting is wrong!");
                return undefined;
            }
            var out_q = this.create();
            var ht = qtn1[0] * qtn2[0] + qtn1[1] * qtn2[1] + qtn1[2] * qtn2[2] + qtn1[3] * qtn2[3];
            var hs = 1.0 - ht * ht;
            if (hs <= 0.0) {
                out_q[0] = qtn1[0];
                out_q[1] = qtn1[1];
                out_q[2] = qtn1[2];
                out_q[3] = qtn1[3];
            }
            else {
                hs = Math.sqrt(hs);
                if (Math.abs(hs) < 0.0001) {
                    out_q[0] = (qtn1[0] * 0.5 + qtn2[0] * 0.5);
                    out_q[1] = (qtn1[1] * 0.5 + qtn2[1] * 0.5);
                    out_q[2] = (qtn1[2] * 0.5 + qtn2[2] * 0.5);
                    out_q[3] = (qtn1[3] * 0.5 + qtn2[3] * 0.5);
                }
                else {
                    var ph = Math.acos(ht);
                    var pt = ph * time;
                    var t0 = Math.sin(ph - pt) / hs;
                    var t1 = Math.sin(pt) / hs;
                    out_q[0] = qtn1[0] * t0 + qtn2[0] * t1;
                    out_q[1] = qtn1[1] * t0 + qtn2[1] * t1;
                    out_q[2] = qtn1[2] * t0 + qtn2[2] * t1;
                    out_q[3] = qtn1[3] * t0 + qtn2[3] * t1;
                }
            }
            return out_q;
        };
        return WebGLQuaternion;
    }());
    EcognitaMathLib.WebGLQuaternion = WebGLQuaternion;
})(EcognitaMathLib || (EcognitaMathLib = {}));
/* =========================================================================
 *
 *  webgl_utils.ts
 *  utils for webgl
 *  part of source code referenced by tantalum-gl.js
 * ========================================================================= */
var EcognitaMathLib;
(function (EcognitaMathLib) {
    function GetGLTypeSize(type) {
        switch (type) {
            case gl.BYTE:
            case gl.UNSIGNED_BYTE:
                return 1;
            case gl.SHORT:
            case gl.UNSIGNED_SHORT:
                return 2;
            case gl.INT:
            case gl.UNSIGNED_INT:
            case gl.FLOAT:
                return 4;
            default:
                return 0;
        }
    }
    EcognitaMathLib.GetGLTypeSize = GetGLTypeSize;
    var WebGL_Texture = /** @class */ (function () {
        function WebGL_Texture(channels, isFloat, texels) {
            this.type = isFloat ? gl.FLOAT : gl.UNSIGNED_BYTE;
            this.format = [gl.LUMINANCE, gl.RG, gl.RGB, gl.RGBA][channels - 1];
            this.glName = gl.createTexture();
            this.bind(this.glName);
            gl.texImage2D(gl.TEXTURE_2D, 0, this.format, this.format, this.type, texels);
            gl.generateMipmap(gl.TEXTURE_2D);
            this.bind(null);
            this.texture = this.glName;
        }
        WebGL_Texture.prototype.bind = function (tex) {
            gl.bindTexture(gl.TEXTURE_2D, tex);
        };
        return WebGL_Texture;
    }());
    EcognitaMathLib.WebGL_Texture = WebGL_Texture;
    var WebGL_RenderTarget = /** @class */ (function () {
        function WebGL_RenderTarget() {
            this.glName = gl.createFramebuffer();
        }
        WebGL_RenderTarget.prototype.bind = function () { gl.bindFramebuffer(gl.FRAMEBUFFER, this.glName); };
        WebGL_RenderTarget.prototype.unbind = function () { gl.bindFramebuffer(gl.FRAMEBUFFER, null); };
        WebGL_RenderTarget.prototype.attachTexture = function (texture, index) {
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0 + index, gl.TEXTURE_2D, texture.glName, 0);
        };
        WebGL_RenderTarget.prototype.detachTexture = function (index) {
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0 + index, gl.TEXTURE_2D, null, 0);
        };
        WebGL_RenderTarget.prototype.drawBuffers = function (numBufs) {
            var buffers = [];
            for (var i = 0; i < numBufs; ++i)
                buffers.push(gl.COLOR_ATTACHMENT0 + i);
            multiBufExt.drawBuffersWEBGL(buffers);
        };
        return WebGL_RenderTarget;
    }());
    EcognitaMathLib.WebGL_RenderTarget = WebGL_RenderTarget;
    var WebGL_Shader = /** @class */ (function () {
        function WebGL_Shader(shaderDict, vert, frag) {
            this.vertex = this.createShaderObject(shaderDict, vert, false);
            this.fragment = this.createShaderObject(shaderDict, frag, true);
            this.program = gl.createProgram();
            gl.attachShader(this.program, this.vertex);
            gl.attachShader(this.program, this.fragment);
            gl.linkProgram(this.program);
            this.uniforms = {};
            if (!gl.getProgramParameter(this.program, gl.LINK_STATUS))
                alert("Could not initialise shaders");
        }
        WebGL_Shader.prototype.bind = function () {
            gl.useProgram(this.program);
        };
        WebGL_Shader.prototype.createShaderObject = function (shaderDict, name, isFragment) {
            var shaderSource = this.resolveShaderSource(shaderDict, name);
            var shaderObject = gl.createShader(isFragment ? gl.FRAGMENT_SHADER : gl.VERTEX_SHADER);
            gl.shaderSource(shaderObject, shaderSource);
            gl.compileShader(shaderObject);
            if (!gl.getShaderParameter(shaderObject, gl.COMPILE_STATUS)) {
                /* Add some line numbers for convenience */
                var lines = shaderSource.split("\n");
                for (var i = 0; i < lines.length; ++i)
                    lines[i] = ("   " + (i + 1)).slice(-4) + " | " + lines[i];
                shaderSource = lines.join("\n");
                throw new Error((isFragment ? "Fragment" : "Vertex") + " shader compilation error for shader '" + name + "':\n\n    " +
                    gl.getShaderInfoLog(shaderObject).split("\n").join("\n    ") +
                    "\nThe expanded shader source code was:\n\n" +
                    shaderSource);
            }
            return shaderObject;
        };
        WebGL_Shader.prototype.resolveShaderSource = function (shaderDict, name) {
            if (!(name in shaderDict))
                throw new Error("Unable to find shader source for '" + name + "'");
            var shaderSource = shaderDict[name];
            /* Rudimentary include handling for convenience.
               Not the most robust, but it will do for our purposes */
            var pattern = new RegExp('#include "(.+)"');
            var match;
            while (match = pattern.exec(shaderSource)) {
                shaderSource = shaderSource.slice(0, match.index) +
                    this.resolveShaderSource(shaderDict, match[1]) +
                    shaderSource.slice(match.index + match[0].length);
            }
            return shaderSource;
        };
        WebGL_Shader.prototype.uniformIndex = function (name) {
            if (!(name in this.uniforms))
                this.uniforms[name] = gl.getUniformLocation(this.program, name);
            return this.uniforms[name];
        };
        WebGL_Shader.prototype.uniformTexture = function (name, texture) {
            var id = this.uniformIndex(name);
            if (id != -1)
                gl.uniform1i(id, texture.boundUnit);
        };
        WebGL_Shader.prototype.uniformF = function (name, f) {
            var id = this.uniformIndex(name);
            if (id != -1)
                gl.uniform1f(id, f);
        };
        WebGL_Shader.prototype.uniform2F = function (name, f1, f2) {
            var id = this.uniformIndex(name);
            if (id != -1)
                gl.uniform2f(id, f1, f2);
        };
        return WebGL_Shader;
    }());
    EcognitaMathLib.WebGL_Shader = WebGL_Shader;
    //add attribute -> init -> copy -> bind -> draw -> release
    var WebGL_VertexBuffer = /** @class */ (function () {
        function WebGL_VertexBuffer() {
            this.attributes = [];
            this.elementSize = 0;
        }
        WebGL_VertexBuffer.prototype.bind = function (shader) {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.glName);
            for (var i = 0; i < this.attributes.length; ++i) {
                this.attributes[i].index = gl.getAttribLocation(shader.program, this.attributes[i].name);
                if (this.attributes[i].index >= 0) {
                    var attr = this.attributes[i];
                    gl.enableVertexAttribArray(attr.index);
                    gl.vertexAttribPointer(attr.index, attr.size, attr.type, attr.norm, this.elementSize, attr.offset);
                }
            }
        };
        WebGL_VertexBuffer.prototype.release = function () {
            for (var i = 0; i < this.attributes.length; ++i) {
                if (this.attributes[i].index >= 0) {
                    gl.disableVertexAttribArray(this.attributes[i].index);
                    this.attributes[i].index = -1;
                }
            }
        };
        WebGL_VertexBuffer.prototype.addAttribute = function (name, size, type, norm) {
            this.attributes.push({
                "name": name,
                "size": size,
                "type": type,
                "norm": norm,
                "offset": this.elementSize,
                "index": -1
            });
            this.elementSize += size * GetGLTypeSize(type);
        };
        WebGL_VertexBuffer.prototype.init = function (numVerts) {
            this.length = numVerts;
            this.glName = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this.glName);
            gl.bufferData(gl.ARRAY_BUFFER, this.length * this.elementSize, gl.STATIC_DRAW);
        };
        WebGL_VertexBuffer.prototype.copy = function (data) {
            data = new Float32Array(data);
            if (data.byteLength != this.length * this.elementSize)
                throw new Error("Resizing VBO during copy strongly discouraged");
            gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
            gl.bindBuffer(gl.ARRAY_BUFFER, null);
        };
        WebGL_VertexBuffer.prototype.draw = function (mode, length) {
            gl.drawArrays(mode, 0, length ? length : this.length);
        };
        return WebGL_VertexBuffer;
    }());
    EcognitaMathLib.WebGL_VertexBuffer = WebGL_VertexBuffer;
    var WebGL_IndexBuffer = /** @class */ (function () {
        function WebGL_IndexBuffer() {
        }
        WebGL_IndexBuffer.prototype.bind = function () {
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.glName);
        };
        WebGL_IndexBuffer.prototype.init = function (index) {
            this.length = index.length;
            this.glName = gl.createBuffer();
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.glName);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(index), gl.STATIC_DRAW);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        };
        WebGL_IndexBuffer.prototype.draw = function (mode, length) {
            gl.drawElements(mode, length ? length : this.length, gl.UNSIGNED_SHORT, 0);
        };
        return WebGL_IndexBuffer;
    }());
    EcognitaMathLib.WebGL_IndexBuffer = WebGL_IndexBuffer;
})(EcognitaMathLib || (EcognitaMathLib = {}));
var Shaders = {
    'demo-frag': 'void main(void){\n' +
        '	gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);\n' +
        '}\n',
    'demo-vert': 'attribute vec3 position;\n' +
        'uniform   mat4 mvpMatrix;\n\n' +
        'void main(void){\n' +
        '	gl_Position = mvpMatrix * vec4(position, 1.0);\n' +
        '}\n',
    'demo1-frag': 'precision mediump float;\n' +
        'varying vec4 vColor;\n\n' +
        'void main(void){\n' +
        '	gl_FragColor = vColor;\n' +
        '}\n',
    'demo1-vert': 'attribute vec3 position;\n' +
        'attribute vec4 color;\n' +
        'uniform   mat4 mvpMatrix;\n' +
        'varying vec4 vColor;\n\n' +
        'void main(void){\n' +
        '	vColor = color;\n' +
        '	gl_Position = mvpMatrix * vec4(position, 1.0);\n' +
        '}\n',
    'directionLighting-frag': 'precision mediump float;\n\n' +
        'varying vec4 vColor;\n\n' +
        'void main(void){\n' +
        '	gl_FragColor = vColor;\n' +
        '}\n',
    'directionLighting-vert': 'attribute vec3 position;\n' +
        'attribute vec4 color;\n' +
        'attribute vec3 normal;\n\n' +
        'uniform mat4 mvpMatrix;\n' +
        'uniform mat4 invMatrix;\n' +
        'uniform vec3 lightDirection;\n' +
        'varying vec4 vColor;\n\n' +
        'void main(void){\n' +
        '    vec3 invLight = normalize(invMatrix*vec4(lightDirection,0)).xyz;\n' +
        '    float diffuse = clamp(dot(invLight,normal),0.1,1.0);\n' +
        '    vColor = color*vec4(vec3(diffuse),1.0);\n' +
        '    gl_Position    = mvpMatrix * vec4(position, 1.0);\n' +
        '}\n',
    'dir_ambient-frag': 'precision mediump float;\n\n' +
        'varying vec4 vColor;\n\n' +
        'void main(void){\n' +
        '	gl_FragColor = vColor;\n' +
        '}\n',
    'dir_ambient-vert': 'attribute vec3 position;\n' +
        'attribute vec4 color;\n' +
        'attribute vec3 normal;\n\n' +
        'uniform mat4 mvpMatrix;\n' +
        'uniform mat4 invMatrix;\n' +
        'uniform vec3 lightDirection;\n' +
        'uniform vec4 ambientColor;\n' +
        'varying vec4 vColor;\n\n' +
        'void main(void){\n' +
        '    vec3 invLight = normalize(invMatrix*vec4(lightDirection,0)).xyz;\n' +
        '    float diffuse = clamp(dot(invLight,normal),0.1,1.0);\n' +
        '    vColor = color*vec4(vec3(diffuse),1.0) +ambientColor;\n' +
        '    gl_Position    = mvpMatrix * vec4(position, 1.0);\n' +
        '}\n',
    'phong-frag': 'precision mediump float;\n\n' +
        'uniform mat4 invMatrix;\n' +
        'uniform vec3 lightDirection;\n' +
        'uniform vec3 eyeDirection;\n' +
        'uniform vec4 ambientColor;\n' +
        'varying vec4 vColor;\n' +
        'varying vec3 vNormal;\n\n' +
        'void main(void){\n' +
        '	vec3 invLight = normalize(invMatrix*vec4(lightDirection,0.0)).xyz;\n' +
        '	vec3 invEye = normalize(invMatrix*vec4(eyeDirection,0.0)).xyz;\n' +
        '	vec3 halfLE = normalize(invLight+invEye);\n' +
        '	float diffuse = clamp(dot(vNormal,invLight),0.0,1.0);\n' +
        '	float specular = pow(clamp(dot(vNormal,halfLE),0.0,1.0),50.0);\n' +
        '	vec4 destColor = vColor * vec4(vec3(diffuse),1.0) + vec4(vec3(specular),1.0) + ' +
        'ambientColor;\n' +
        '	gl_FragColor = destColor;\n' +
        '}\n',
    'phong-vert': 'attribute vec3 position;\n' +
        'attribute vec4 color;\n' +
        'attribute vec3 normal;\n\n' +
        'uniform mat4 mvpMatrix;\n\n' +
        'varying vec4 vColor;\n' +
        'varying vec3 vNormal;\n\n' +
        'void main(void){\n' +
        '    vNormal = normal;\n' +
        '    vColor = color;\n' +
        '    gl_Position    = mvpMatrix * vec4(position, 1.0);\n' +
        '}\n',
    'point-frag': 'precision mediump float;\n' +
        'varying vec4      vColor;\n\n' +
        'void main(void){\n' +
        '    gl_FragColor = vColor;\n' +
        '}\n',
    'point-vert': 'attribute vec3 position;\n' +
        'attribute vec4 color;\n' +
        'uniform   mat4 mvpMatrix;\n' +
        'uniform   float pointSize;\n' +
        'varying   vec4 vColor;\n\n' +
        'void main(void){\n' +
        '    vColor        = color;\n' +
        '    gl_Position   = mvpMatrix * vec4(position, 1.0);\n' +
        '    gl_PointSize  = pointSize;\n' +
        '}\n',
    'pointLighting-frag': 'precision mediump float;\n\n' +
        'uniform mat4 invMatrix;\n' +
        'uniform vec3 lightPosition;\n' +
        'uniform vec3 eyeDirection;\n' +
        'uniform vec4 ambientColor;\n\n' +
        'varying vec4 vColor;\n' +
        'varying vec3 vNormal;\n' +
        'varying vec3 vPosition;\n\n' +
        'void main(void){\n' +
        '	vec3 lightVec = lightPosition -vPosition;\n' +
        '	vec3 invLight = normalize(invMatrix*vec4(lightVec,0.0)).xyz;\n' +
        '	vec3 invEye = normalize(invMatrix*vec4(eyeDirection,0.0)).xyz;\n' +
        '	vec3 halfLE = normalize(invLight+invEye);\n' +
        '	float diffuse = clamp(dot(vNormal,invLight),0.0,1.0);\n' +
        '	float specular = pow(clamp(dot(vNormal,halfLE),0.0,1.0),50.0);\n' +
        '	vec4 destColor = vColor * vec4(vec3(diffuse),1.0) + vec4(vec3(specular),1.0) + ' +
        'ambientColor;\n' +
        '	gl_FragColor = destColor;\n' +
        '}\n',
    'pointLighting-vert': 'attribute vec3 position;\n' +
        'attribute vec4 color;\n' +
        'attribute vec3 normal;\n\n' +
        'uniform mat4 mvpMatrix;\n' +
        'uniform mat4 mMatrix;\n\n' +
        'varying vec3 vPosition;\n' +
        'varying vec4 vColor;\n' +
        'varying vec3 vNormal;\n\n' +
        'void main(void){\n' +
        '    vPosition = (mMatrix*vec4(position,1.0)).xyz;\n' +
        '    vNormal = normal;\n' +
        '    vColor = color;\n' +
        '    gl_Position    = mvpMatrix * vec4(position, 1.0);\n' +
        '}\n',
    'pointSprite-frag': 'precision mediump float;\n\n' +
        'uniform sampler2D texture;\n' +
        'varying vec4      vColor;\n\n' +
        'void main(void){\n' +
        '    vec4 smpColor = vec4(1.0);\n' +
        '    smpColor = texture2D(texture,gl_PointCoord);\n' +
        '    if(smpColor.a == 0.0){\n' +
        '        discard;\n' +
        '    }else{\n' +
        '        gl_FragColor = vColor * smpColor;\n' +
        '    }\n' +
        '}\n',
    'pointSprite-vert': 'attribute vec3 position;\n' +
        'attribute vec4 color;\n' +
        'uniform   mat4 mvpMatrix;\n' +
        'uniform   float pointSize;\n' +
        'varying   vec4 vColor;\n\n' +
        'void main(void){\n' +
        '    vColor        = color;\n' +
        '    gl_Position   = mvpMatrix * vec4(position, 1.0);\n' +
        '    gl_PointSize  = pointSize;\n' +
        '}\n',
    'renderToTexture-frag': 'precision mediump float;\n\n' +
        'uniform sampler2D texture;\n' +
        'varying vec4      vColor;\n' +
        'varying vec2      vTextureCoord;\n\n' +
        'void main(void){\n' +
        '	vec4 smpColor = texture2D(texture, vTextureCoord);\n' +
        '	gl_FragColor  = vColor * smpColor;\n' +
        '}\n',
    'renderToTexture-vert': 'attribute vec3 position;\n' +
        'attribute vec3 normal;\n' +
        'attribute vec4 color;\n' +
        'attribute vec2 textureCoord;\n' +
        'uniform   mat4 mMatrix;\n' +
        'uniform   mat4 mvpMatrix;\n' +
        'uniform   mat4 invMatrix;\n' +
        'uniform   vec3 lightDirection;\n' +
        'uniform   bool useLight;\n' +
        'varying   vec4 vColor;\n' +
        'varying   vec2 vTextureCoord;\n\n' +
        'void main(void){\n' +
        '	if(useLight){\n' +
        '		vec3  invLight = normalize(invMatrix * vec4(lightDirection, 0.0)).xyz;\n' +
        '		float diffuse  = clamp(dot(normal, invLight), 0.2, 1.0);\n' +
        '		vColor         = vec4(color.xyz * vec3(diffuse), 1.0);\n' +
        '	}else{\n' +
        '		vColor         = color;\n' +
        '	}\n' +
        '	vTextureCoord  = textureCoord;\n' +
        '	gl_Position    = mvpMatrix * vec4(position, 1.0);\n' +
        '}\n',
    'specular-frag': 'precision mediump float;\n\n' +
        'varying vec4 vColor;\n\n' +
        'void main(void){\n' +
        '	gl_FragColor = vColor;\n' +
        '}\n',
    'specular-vert': 'attribute vec3 position;\n' +
        'attribute vec4 color;\n' +
        'attribute vec3 normal;\n\n' +
        'uniform mat4 mvpMatrix;\n' +
        'uniform mat4 invMatrix;\n\n' +
        'uniform vec3 lightDirection;\n' +
        'uniform vec3 eyeDirection;\n' +
        'uniform vec4 ambientColor;\n' +
        'varying vec4 vColor;\n\n' +
        'void main(void){\n' +
        '    vec3 invLight = normalize(invMatrix*vec4(lightDirection,0.0)).xyz;\n' +
        '    vec3 invEye = normalize(invMatrix* vec4(eyeDirection,0.0)).xyz;\n' +
        '    vec3 halfLE = normalize(invLight+invEye);\n\n' +
        '    float diffuse = clamp(dot(invLight,normal),0.0,1.0);\n' +
        '    float specular = pow(clamp(dot(normal,halfLE),0.0,1.0),50.0);\n' +
        '    vec4 light = color*vec4(vec3(diffuse),1.0)+vec4(vec3(specular),1.0);\n' +
        '    vColor = light + ambientColor;\n' +
        '    gl_Position    = mvpMatrix * vec4(position, 1.0);\n' +
        '}\n',
    'stencilBufferOutline-frag': 'precision mediump float;\n\n' +
        'uniform sampler2D texture;\n' +
        'uniform bool      useTexture;\n' +
        'varying vec4      vColor;\n' +
        'varying vec2      vTextureCoord;\n\n' +
        'void main(void){\n' +
        '	vec4 smpColor = vec4(1.0);\n' +
        '	if(useTexture){\n' +
        '		smpColor = texture2D(texture, vTextureCoord);\n' +
        '	}\n' +
        '	gl_FragColor = vColor * smpColor;\n' +
        '}\n',
    'stencilBufferOutline-vert': 'attribute vec3 position;\n' +
        'attribute vec3 normal;\n' +
        'attribute vec4 color;\n' +
        'attribute vec2 textureCoord;\n' +
        'uniform   mat4 mvpMatrix;\n' +
        'uniform   mat4 invMatrix;\n' +
        'uniform   vec3 lightDirection;\n' +
        'uniform   bool useLight;\n' +
        'uniform   bool outline;\n' +
        'varying   vec4 vColor;\n' +
        'varying   vec2 vTextureCoord;\n\n' +
        'void main(void){\n' +
        '	if(useLight){\n' +
        '		vec3  invLight = normalize(invMatrix * vec4(lightDirection, 0.0)).xyz;\n' +
        '		float diffuse  = clamp(dot(normal, invLight), 0.1, 1.0);\n' +
        '		vColor         = color * vec4(vec3(diffuse), 1.0);\n' +
        '	}else{\n' +
        '		vColor         = color;\n' +
        '	}\n' +
        '	vTextureCoord      = textureCoord;\n' +
        '	vec3 oPosition     = position;\n' +
        '	if(outline){\n' +
        '		oPosition     += normal * 0.1;\n' +
        '	}\n' +
        '	gl_Position = mvpMatrix * vec4(oPosition, 1.0);\n' +
        '}\n',
    'texture-frag': 'precision mediump float;\n\n' +
        'uniform sampler2D texture;\n' +
        'varying vec4      vColor;\n' +
        'varying vec2      vTextureCoord;\n\n' +
        'void main(void){\n' +
        '    vec4 smpColor = texture2D(texture, vTextureCoord);\n' +
        '    gl_FragColor  = vColor * smpColor;\n' +
        '}\n',
    'texture-vert': 'attribute vec3 position;\n' +
        'attribute vec4 color;\n' +
        'attribute vec2 textureCoord;\n' +
        'uniform   mat4 mvpMatrix;\n' +
        'varying   vec4 vColor;\n' +
        'varying   vec2 vTextureCoord;\n\n' +
        'void main(void){\n' +
        '    vColor        = color;\n' +
        '    vTextureCoord = textureCoord;\n' +
        '    gl_Position   = mvpMatrix * vec4(position, 1.0);\n' +
        '}\n'
};
/* =========================================================================
 *
 *  cv_colorSpace.ts
 *  color space transformation
 *
 * ========================================================================= */
var EcognitaMathLib;
(function (EcognitaMathLib) {
    //hsv space transform to rgb space
    //h(0~360) sva(0~1)
    function HSV2RGB(h, s, v, a) {
        if (s > 1 || v > 1 || a > 1) {
            return;
        }
        var th = h % 360;
        var i = Math.floor(th / 60);
        var f = th / 60 - i;
        var m = v * (1 - s);
        var n = v * (1 - s * f);
        var k = v * (1 - s * (1 - f));
        var color = new Array();
        if (!(s > 0) && !(s < 0)) {
            color.push(v, v, v, a);
        }
        else {
            var r = new Array(v, n, m, m, k, v);
            var g = new Array(k, v, v, n, m, m);
            var b = new Array(m, m, k, v, v, n);
            color.push(r[i], g[i], b[i], a);
        }
        return color;
    }
    EcognitaMathLib.HSV2RGB = HSV2RGB;
})(EcognitaMathLib || (EcognitaMathLib = {}));
/* =========================================================================
 *
 *  webgl_model.ts
 *  simple 3d model for webgl
 *
 * ========================================================================= */
/// <reference path="./cv_colorSpace.ts" />
var EcognitaMathLib;
(function (EcognitaMathLib) {
    var TorusModel = /** @class */ (function () {
        function TorusModel(vcrs, hcrs, vr, hr, color, need_normal, need_texture) {
            if (need_texture === void 0) { need_texture = false; }
            this.verCrossSectionSmooth = vcrs;
            this.horCrossSectionSmooth = hcrs;
            this.verRadius = vr;
            this.horRadius = hr;
            this.data = new Array();
            this.index = new Array();
            this.preCalculate(color, need_normal, need_texture);
        }
        TorusModel.prototype.preCalculate = function (color, need_normal, need_texture) {
            if (need_texture === void 0) { need_texture = false; }
            //calculate pos and col
            for (var i = 0; i <= this.verCrossSectionSmooth; i++) {
                var verIncrement = Math.PI * 2 / this.verCrossSectionSmooth * i;
                var verX = Math.cos(verIncrement);
                var verY = Math.sin(verIncrement);
                for (var ii = 0; ii <= this.horCrossSectionSmooth; ii++) {
                    var horIncrement = Math.PI * 2 / this.horCrossSectionSmooth * ii;
                    var horX = (verX * this.verRadius + this.horRadius) * Math.cos(horIncrement);
                    var horY = verY * this.verRadius;
                    var horZ = (verX * this.verRadius + this.horRadius) * Math.sin(horIncrement);
                    this.data.push(horX, horY, horZ);
                    if (need_normal) {
                        var nx = verX * Math.cos(horIncrement);
                        var nz = verX * Math.sin(horIncrement);
                        this.data.push(nx, verY, nz);
                    }
                    //hsv2rgb
                    if (color == undefined) {
                        var rgba = EcognitaMathLib.HSV2RGB(360 / this.horCrossSectionSmooth * ii, 1, 1, 1);
                        this.data.push(rgba[0], rgba[1], rgba[2], rgba[3]);
                    }
                    else {
                        this.data.push(color[0], color[1], color[2], color[3]);
                    }
                    if (need_texture) {
                        var rs = 1 / this.horCrossSectionSmooth * ii;
                        var rt = 1 / this.verCrossSectionSmooth * i + 0.5;
                        if (rt > 1.0) {
                            rt -= 1.0;
                        }
                        rt = 1.0 - rt;
                        this.data.push(rs, rt);
                    }
                }
            }
            //calculate index
            for (i = 0; i < this.verCrossSectionSmooth; i++) {
                for (ii = 0; ii < this.horCrossSectionSmooth; ii++) {
                    verIncrement = (this.horCrossSectionSmooth + 1) * i + ii;
                    this.index.push(verIncrement, verIncrement + this.horCrossSectionSmooth + 1, verIncrement + 1);
                    this.index.push(verIncrement + this.horCrossSectionSmooth + 1, verIncrement + this.horCrossSectionSmooth + 2, verIncrement + 1);
                }
            }
        };
        return TorusModel;
    }());
    EcognitaMathLib.TorusModel = TorusModel;
    var ShpereModel = /** @class */ (function () {
        function ShpereModel(vcrs, hcrs, rad, color, need_normal, need_texture) {
            if (need_texture === void 0) { need_texture = false; }
            this.verCrossSectionSmooth = vcrs;
            this.horCrossSectionSmooth = hcrs;
            this.Radius = rad;
            this.data = new Array();
            this.index = new Array();
            this.preCalculate(color, need_normal, need_texture);
        }
        ShpereModel.prototype.preCalculate = function (color, need_normal, need_texture) {
            if (need_texture === void 0) { need_texture = false; }
            //calculate pos and col
            for (var i = 0; i <= this.verCrossSectionSmooth; i++) {
                var verIncrement = Math.PI / this.verCrossSectionSmooth * i;
                var verX = Math.cos(verIncrement);
                var verY = Math.sin(verIncrement);
                for (var ii = 0; ii <= this.horCrossSectionSmooth; ii++) {
                    var horIncrement = Math.PI * 2 / this.horCrossSectionSmooth * ii;
                    var horX = verY * this.Radius * Math.cos(horIncrement);
                    var horY = verX * this.Radius;
                    var horZ = verY * this.Radius * Math.sin(horIncrement);
                    this.data.push(horX, horY, horZ);
                    if (need_normal) {
                        var nx = verY * Math.cos(horIncrement);
                        var nz = verY * Math.sin(horIncrement);
                        this.data.push(nx, verX, nz);
                    }
                    //hsv2rgb
                    if (color == undefined) {
                        var rgba = EcognitaMathLib.HSV2RGB(360 / this.horCrossSectionSmooth * ii, 1, 1, 1);
                        this.data.push(rgba[0], rgba[1], rgba[2], rgba[3]);
                    }
                    else {
                        this.data.push(color[0], color[1], color[2], color[3]);
                    }
                    if (need_texture) {
                        this.data.push(1 - 1 / this.horCrossSectionSmooth * ii, 1 / this.verCrossSectionSmooth * i);
                    }
                }
            }
            //calculate index
            for (i = 0; i < this.verCrossSectionSmooth; i++) {
                for (ii = 0; ii < this.horCrossSectionSmooth; ii++) {
                    verIncrement = (this.horCrossSectionSmooth + 1) * i + ii;
                    this.index.push(verIncrement, verIncrement + 1, verIncrement + this.horCrossSectionSmooth + 2);
                    this.index.push(verIncrement, verIncrement + this.horCrossSectionSmooth + 2, verIncrement + this.horCrossSectionSmooth + 1);
                }
            }
        };
        return ShpereModel;
    }());
    EcognitaMathLib.ShpereModel = ShpereModel;
    var CubeModel = /** @class */ (function () {
        function CubeModel(side, color, need_normal, need_texture) {
            if (need_texture === void 0) { need_texture = false; }
            this.side = side;
            this.data = new Array();
            this.index = [
                0, 1, 2, 0, 2, 3,
                4, 5, 6, 4, 6, 7,
                8, 9, 10, 8, 10, 11,
                12, 13, 14, 12, 14, 15,
                16, 17, 18, 16, 18, 19,
                20, 21, 22, 20, 22, 23
            ];
            var hs = side * 0.5;
            var pos = [
                -hs, -hs, hs, hs, -hs, hs, hs, hs, hs, -hs, hs, hs,
                -hs, -hs, -hs, -hs, hs, -hs, hs, hs, -hs, hs, -hs, -hs,
                -hs, hs, -hs, -hs, hs, hs, hs, hs, hs, hs, hs, -hs,
                -hs, -hs, -hs, hs, -hs, -hs, hs, -hs, hs, -hs, -hs, hs,
                hs, -hs, -hs, hs, hs, -hs, hs, hs, hs, hs, -hs, hs,
                -hs, -hs, -hs, -hs, -hs, hs, -hs, hs, hs, -hs, hs, -hs
            ];
            var normal = [
                -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0,
                -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0,
                -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0,
                -1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0,
                1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0,
                -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0
            ];
            var col = new Array();
            for (var i = 0; i < pos.length / 3; i++) {
                if (color != undefined) {
                    var tc = color;
                }
                else {
                    tc = EcognitaMathLib.HSV2RGB(360 / pos.length / 3 * i, 1, 1, 1);
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
            for (var i = 0; i < cubeVertexNum; i++) {
                //pos
                this.data.push(pos[i * 3 + 0], pos[i * 3 + 1], pos[i * 3 + 2]);
                //normal
                if (need_normal) {
                    this.data.push(normal[i * 3 + 0], normal[i * 3 + 1], normal[i * 3 + 2]);
                }
                //color
                this.data.push(col[i * 4 + 0], col[i * 4 + 1], col[i * 4 + 2], col[i * 4 + 3]);
                //texture
                if (need_texture) {
                    this.data.push(st[i * 2 + 0], st[i * 2 + 1]);
                }
            }
        }
        return CubeModel;
    }());
    EcognitaMathLib.CubeModel = CubeModel;
})(EcognitaMathLib || (EcognitaMathLib = {}));
/* =========================================================================
 *
 *  demo19.ts
 *  test some webgl demo
 *
 * ========================================================================= */
/// <reference path="../lib/cv_imread.ts" />
/// <reference path="../lib/extra_utils.ts" />
/// <reference path="../lib/webgl_matrix.ts" />
/// <reference path="../lib/webgl_quaternion.ts" />
/// <reference path="../lib/webgl_utils.ts" />
/// <reference path="../lib/webgl_shaders.ts" />
/// <reference path="../lib/webgl_model.ts" />
var canvas = document.getElementById('canvas');
canvas.width = 512;
canvas.height = 512;
try {
    var gl = canvas.getContext("webgl", { stencil: true }) || canvas.getContext("experimental-webgl", { stencil: true });
}
catch (e) { }
if (!gl)
    throw new Error("Could not initialise WebGL");
var shader = new EcognitaMathLib.WebGL_Shader(Shaders, "renderToTexture-vert", "renderToTexture-frag");
var cubeData = new EcognitaMathLib.CubeModel(2.0, [1.0, 1.0, 1.0, 1.0], true, true);
var vbo_cube = new EcognitaMathLib.WebGL_VertexBuffer();
var ibo_cube = new EcognitaMathLib.WebGL_IndexBuffer();
vbo_cube.addAttribute("position", 3, gl.FLOAT, false);
vbo_cube.addAttribute("normal", 3, gl.FLOAT, false);
vbo_cube.addAttribute("color", 4, gl.FLOAT, false);
vbo_cube.addAttribute("textureCoord", 2, gl.FLOAT, false);
vbo_cube.init(cubeData.data.length / 12);
vbo_cube.copy(cubeData.data);
ibo_cube.init(cubeData.index);
ibo_cube.bind();
var earthData = new EcognitaMathLib.ShpereModel(64, 64, 1, [1, 1, 1, 1], true, true);
var vbo_earth = new EcognitaMathLib.WebGL_VertexBuffer();
var ibo_earth = new EcognitaMathLib.WebGL_IndexBuffer();
vbo_earth.addAttribute("position", 3, gl.FLOAT, false);
vbo_earth.addAttribute("normal", 3, gl.FLOAT, false);
vbo_earth.addAttribute("color", 4, gl.FLOAT, false);
vbo_earth.addAttribute("textureCoord", 2, gl.FLOAT, false);
vbo_earth.init(earthData.data.length / 12);
vbo_earth.copy(earthData.data);
ibo_earth.init(earthData.index);
ibo_earth.bind();
var m = new EcognitaMathLib.WebGLMatrix();
var q = new EcognitaMathLib.WebGLQuaternion();
var mMatrix = m.identity(m.create());
var vMatrix = m.identity(m.create());
var pMatrix = m.identity(m.create());
var tmpMatrix = m.identity(m.create());
var mvpMatrix = m.identity(m.create());
var invMatrix = m.identity(m.create());
var qMatrix = m.identity(m.create());
var xQuaternion = q.identity(q.create());
var lightDirection = [1.0, 1.0, 1.0];
shader.bind();
var uniLocation = new Array();
uniLocation.push(shader.uniformIndex('mMatrix'));
uniLocation.push(shader.uniformIndex('mvpMatrix'));
uniLocation.push(shader.uniformIndex('invMatrix'));
uniLocation.push(shader.uniformIndex('lightDirection'));
uniLocation.push(shader.uniformIndex('useLight'));
uniLocation.push(shader.uniformIndex('texture'));
var lastPosX = 0;
var lastPosY = 0;
var isDragging = false;
var hammer = new EcognitaMathLib.Hammer_Utils(canvas);
hammer.on_pan = function (ev) {
    var elem = ev.target;
    if (!isDragging) {
        isDragging = true;
        lastPosX = elem.offsetLeft;
        lastPosY = elem.offsetTop;
    }
    var posX = ev.center.x - lastPosX;
    var posY = ev.center.y - lastPosY;
    var cw = canvas.width;
    var ch = canvas.height;
    var wh = 1 / Math.sqrt(cw * cw + ch * ch);
    var x = posX - cw * 0.5;
    var y = posY - ch * 0.5;
    var sq = Math.sqrt(x * x + y * y);
    var r = sq * 2.0 * Math.PI * wh;
    if (sq != 1) {
        sq = 1 / sq;
        x *= sq;
        y *= sq;
    }
    xQuaternion = q.rotate(r, [y, x, 0.0]);
    if (ev.isFinal) {
        isDragging = false;
    }
};
hammer.enablePan();
//depth test
gl.enable(gl.DEPTH_TEST);
gl.depthFunc(gl.LEQUAL);
var cnt = 0;
var tex3 = null;
var tex4 = null;
var img3 = EcognitaMathLib.imread("./img/tex3.png");
var img4 = EcognitaMathLib.imread("./img/tex4.png");
img3.onload = function () {
    tex3 = new EcognitaMathLib.WebGL_Texture(4, false, img3);
};
img4.onload = function () {
    tex4 = new EcognitaMathLib.WebGL_Texture(4, false, img4);
};
gl.activeTexture(gl.TEXTURE0);
var fBufferWidth = 512;
var fBufferHeight = 512;
//need refactor
function create_framebuffer(width, height) {
    // フレームバッファの生成
    var frameBuffer = gl.createFramebuffer();
    // フレームバッファをWebGLにバインド
    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
    // 深度バッファ用レンダーバッファの生成とバインド
    var depthRenderBuffer = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, depthRenderBuffer);
    // レンダーバッファを深度バッファとして設定
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
    // フレームバッファにレンダーバッファを関連付ける
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthRenderBuffer);
    // フレームバッファ用テクスチャの生成
    var fTexture = gl.createTexture();
    // フレームバッファ用のテクスチャをバインド
    gl.bindTexture(gl.TEXTURE_2D, fTexture);
    // フレームバッファ用のテクスチャにカラー用のメモリ領域を確保
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    // テクスチャパラメータ
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    // フレームバッファにテクスチャを関連付ける
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, fTexture, 0);
    // 各種オブジェクトのバインドを解除
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    // オブジェクトを返して終了
    return { f: frameBuffer, d: depthRenderBuffer, t: fTexture };
}
var fBuffer = create_framebuffer(fBufferWidth, fBufferHeight);
(function () {
    //bind frame buff
    gl.bindFramebuffer(gl.FRAMEBUFFER, fBuffer.f);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    cnt++;
    var rad = (cnt % 360) * Math.PI / 180;
    var rad2 = (cnt % 720) * Math.PI / 360;
    var lightDirection = [-1.0, 2.0, 1.0];
    qMatrix = q.ToMat4x4(xQuaternion);
    var camPosition = [0.0, 0.0, 5.0];
    var camUpDirection = [0.0, 1.0, 0.0];
    //camera setting
    vMatrix = m.viewMatrix(camPosition, [0, 0, 0], camUpDirection);
    pMatrix = m.perspectiveMatrix(45, fBufferWidth / fBufferHeight, 0.1, 100);
    tmpMatrix = m.multiply(pMatrix, vMatrix);
    //render earth scene's skybox
    if (tex4 != null) {
        //gl.activeTexture(gl.TEXTURE1);
        tex4.bind(tex4.texture);
    }
    vbo_earth.bind(shader);
    ibo_earth.bind();
    mMatrix = m.identity(mMatrix);
    mMatrix = m.scale(mMatrix, [50.0, 50.0, 50.0]);
    mvpMatrix = m.multiply(tmpMatrix, mMatrix);
    invMatrix = m.inverse(mMatrix);
    gl.uniformMatrix4fv(uniLocation[0], false, mMatrix);
    gl.uniformMatrix4fv(uniLocation[1], false, mvpMatrix);
    gl.uniformMatrix4fv(uniLocation[2], false, invMatrix);
    gl.uniform3fv(uniLocation[3], lightDirection);
    gl.uniform1i(uniLocation[4], false);
    gl.uniform1i(uniLocation[5], 0);
    ibo_earth.draw(gl.TRIANGLES);
    //render earth
    if (tex3 != null) {
        //gl.activeTexture(gl.TEXTURE0);
        tex3.bind(tex3.texture);
    }
    m.identity(mMatrix);
    mMatrix = m.rotate(mMatrix, rad, [0, 1, 0]);
    mvpMatrix = m.multiply(tmpMatrix, mMatrix);
    invMatrix = m.inverse(mMatrix);
    gl.uniformMatrix4fv(uniLocation[0], false, mMatrix);
    gl.uniformMatrix4fv(uniLocation[1], false, mvpMatrix);
    gl.uniformMatrix4fv(uniLocation[2], false, invMatrix);
    gl.uniform1i(uniLocation[4], true);
    ibo_earth.draw(gl.TRIANGLES);
    //release frame buffer
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    //reset canvas scene
    gl.clearColor(0.0, 0.7, 0.7, 1.0);
    gl.clearDepth(1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    //render cube
    vbo_cube.bind(shader);
    ibo_cube.bind();
    //bind rendered texture
    gl.bindTexture(gl.TEXTURE_2D, fBuffer.t);
    lightDirection = [-1.0, 0.0, 0.0];
    vMatrix = m.multiply(vMatrix, qMatrix);
    tmpMatrix = m.multiply(pMatrix, vMatrix);
    m.identity(mMatrix);
    mMatrix = m.rotate(mMatrix, rad2, [1, 1, 0]);
    mvpMatrix = m.multiply(tmpMatrix, mMatrix);
    invMatrix = m.inverse(mMatrix);
    gl.uniformMatrix4fv(uniLocation[0], false, mMatrix);
    gl.uniformMatrix4fv(uniLocation[1], false, mvpMatrix);
    gl.uniformMatrix4fv(uniLocation[2], false, invMatrix);
    ibo_cube.draw(gl.TRIANGLES);
    gl.flush();
    setTimeout(arguments.callee, 1000 / 30);
})();
