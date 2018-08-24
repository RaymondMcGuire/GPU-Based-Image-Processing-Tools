/* =========================================================================
 *
 *  webgl_matrix.ts
 *  a matrix library developed for webgl
 *  part of source code referenced by minMatrix.js
 *  https://wgld.org/d/library/l001.html
 * ========================================================================= */
module EcognitaMathLib {
    export class WebGLMatrix {
        constructor() {}
        create(){return new Float32Array(16);}
        
        identity(mat:Float32Array){
            mat[0]  = 1; mat[1]  = 0; mat[2]  = 0; mat[3]  = 0;
            mat[4]  = 0; mat[5]  = 1; mat[6]  = 0; mat[7]  = 0;
            mat[8]  = 0; mat[9]  = 0; mat[10] = 1; mat[11] = 0;
            mat[12] = 0; mat[13] = 0; mat[14] = 0; mat[15] = 1;
            return mat;
        }

        //mat2 x mat1,give mat1 a transform(mat2)
        multiply(mat1:Float32Array,mat2:Float32Array){
            let mat = this.create();
            let a = mat1[0],  b = mat1[1],  c = mat1[2],  d = mat1[3],
                e = mat1[4],  f = mat1[5],  g = mat1[6],  h = mat1[7],
                i = mat1[8],  j = mat1[9],  k = mat1[10], l = mat1[11],
                m = mat1[12], n = mat1[13], o = mat1[14], p = mat1[15],
                
                A = mat2[0],  B = mat2[1],  C = mat2[2],  D = mat2[3],
                E = mat2[4],  F = mat2[5],  G = mat2[6],  H = mat2[7],
                I = mat2[8],  J = mat2[9],  K = mat2[10], L = mat2[11],
                M = mat2[12], N = mat2[13], O = mat2[14], P = mat2[15];
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
        }

        scale(mat1:Float32Array,param_scale:Array<number>){
            let mat = this.create();
            if(param_scale.length !=3)return undefined;
            mat[0]=mat1[0]*param_scale[0];
            mat[1]=mat1[1]*param_scale[0];
            mat[2]=mat1[2]*param_scale[0];
            mat[3]=mat1[3]*param_scale[0];

            mat[4]=mat1[4]*param_scale[1];
            mat[5]=mat1[5]*param_scale[1];
            mat[6]=mat1[6]*param_scale[1];
            mat[7]=mat1[7]*param_scale[1];

            mat[8]=mat1[8]*param_scale[2];
            mat[9]=mat1[9]*param_scale[2];
            mat[10]=mat1[10]*param_scale[2];
            mat[11]=mat1[11]*param_scale[2];

            mat[12]=mat1[12]
            mat[13]=mat1[13]
            mat[14]=mat1[14]
            mat[15]=mat1[15]
            
            return mat;
        }

        //vec * matrix,so translate matrix should use its transpose matrix
        translate(mat1:Float32Array,param_translate:Array<number>){
            let mat = this.create();
            if(param_translate.length !=3)return undefined;
            mat[0]=mat1[0];mat[1]=mat1[1];mat[2]=mat1[2];mat[3]=mat1[3];
            mat[4]=mat1[4];mat[5]=mat1[5];mat[6]=mat1[6];mat[7]=mat1[7];
            mat[8]=mat1[8];mat[9]=mat1[9];mat[10]=mat1[10];mat[11]=mat1[11];
            mat[12]=mat1[0]*param_translate[0]+mat1[4]*param_translate[1]+mat1[8]*param_translate[2]+mat1[12];
            mat[13]=mat1[1]*param_translate[0]+mat1[5]*param_translate[1]+mat1[9]*param_translate[2]+mat1[13];
            mat[14]=mat1[2]*param_translate[0]+mat1[6]*param_translate[1]+mat1[10]*param_translate[2]+mat1[14];
            mat[15]=mat1[3]*param_translate[0]+mat1[7]*param_translate[1]+mat1[11]*param_translate[2]+mat1[15];
            return mat;
        }

        // https://dspace.lboro.ac.uk/dspace-jspui/handle/2134/18050
        rotate(mat1:Float32Array,angle:number, axis:Array<number>){
            let mat = this.create();
            if(axis.length !=3)return undefined;

            var sq = Math.sqrt(axis[0] * axis[0] + axis[1] * axis[1] + axis[2] * axis[2]);
            if(!sq){return undefined;}
            var a = axis[0], b = axis[1], c = axis[2];
            if(sq != 1){sq = 1 / sq; a *= sq; b *= sq; c *= sq;}
            var d = Math.sin(angle), e = Math.cos(angle), f = 1 - e,
                g = mat1[0],  h = mat1[1], i = mat1[2],  j = mat1[3],
                k = mat1[4],  l = mat1[5], m = mat1[6],  n = mat1[7],
                o = mat1[8],  p = mat1[9], q = mat1[10], r = mat1[11],
                s = a * a * f + e,
                t = b * a * f + c * d,
                u = c * a * f - b * d,
                v = a * b * f - c * d,
                w = b * b * f + e,
                x = c * b * f + a * d,
                y = a * c * f + b * d,
                z = b * c * f - a * d,
                A = c * c * f + e;
            if(angle){
                if(mat1 != mat){
                    mat[12] = mat1[12]; mat[13] = mat1[13];
                    mat[14] = mat1[14]; mat[15] = mat1[15];
                }
            } else {
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
        }

        viewMatrix(cam:Array<number>,target:Array<number>,up:Array<number>){
            let mat = this.identity(this.create());
            if(cam.length !=3 || target.length!=3  || up.length!=3)return undefined;
            let camX = cam[0],camY = cam[1],camZ = cam[2];
            let targetX = target[0],targetY=target[1],targetZ=target[2];
            let upX = up[0],upY=up[1],upZ=up[2];

            //cam and target have the same position
            if(camX==targetX &&camY==targetY &&camZ==targetZ)return mat;

            let forwardX = camX- targetX,forwardY = camY- targetY,forwardZ = camZ- targetZ;
            let l = 1/Math.sqrt(forwardX*forwardX+forwardY*forwardY+forwardZ*forwardZ);
            forwardX*=l;forwardY*=l;forwardZ*=l;
            let rightX = upY*forwardZ - upZ*forwardY;
            let rightY = upZ*forwardX - upX*forwardZ;
            let rightZ = upX*forwardY - upY*forwardX;
            l = Math.sqrt(rightX*rightX+rightY*rightY+rightZ*rightZ);
            if(!l){
                rightX =0;rightY =0;rightZ =0;
            }else{
                l = 1/Math.sqrt(rightX*rightX+rightY*rightY+rightZ*rightZ);
                rightX*=l;rightY*=l;rightZ*=l;
            }
            
            upX = forwardY*rightZ - forwardZ*rightY;
            upY = forwardZ*rightX - forwardX*rightZ;
            upZ = forwardX*rightY - forwardY*rightX;
            
            mat[0]  = rightX; mat[1]  = upX; mat[2]  = forwardX; mat[3]  = 0;
            mat[4]  = rightY; mat[5]  = upY; mat[6]  = forwardY; mat[7]  = 0;
            mat[8]  = rightZ; mat[9]  = upZ; mat[10] = forwardZ; mat[11] = 0;
            mat[12] = -(rightX*camX+rightY*camY+rightZ*camZ); 
            mat[13] = -(upX*camX+upY*camY+upZ*camZ); 
            mat[14] = -(forwardX*camX+forwardY*camY+forwardZ*camZ); 
            mat[15] = 1;
            return mat;
        }

        perspectiveMatrix(fovy:number, aspect:number, near:number, far:number){
            let mat = this.identity(this.create());
            var t = near * Math.tan(fovy * Math.PI / 360);
            var r = t * aspect;
            var a = r * 2, b = t * 2, c = far - near;
            mat[0] = near * 2 / a;  mat[1] = 0;             mat[2] = 0;                         mat[3] = 0;
            mat[4] = 0;             mat[5] = near * 2 / b;  mat[6] = 0;                         mat[7] = 0;
            mat[8] = 0;             mat[9] = 0;             mat[10] = -(far + near) / c;        mat[11] = -1;
            mat[12] = 0;            mat[13] = 0;            mat[14] = -(far * near * 2) / c;    mat[15] = 0;
            return mat;
        }

        orthoMatrix(left:number, right:number, top:number, bottom:number, near:number, far:number) {
            let mat = this.identity(this.create());
            var h = (right - left);
            var v = (top - bottom);
            var d = (far - near);
            mat[0]  = 2 / h;
            mat[1]  = 0;
            mat[2]  = 0;
            mat[3]  = 0;
            mat[4]  = 0;
            mat[5]  = 2 / v;
            mat[6]  = 0;
            mat[7]  = 0;
            mat[8]  = 0;
            mat[9]  = 0;
            mat[10] = -2 / d;
            mat[11] = 0;
            mat[12] = -(left + right) / h;
            mat[13] = -(top + bottom) / v;
            mat[14] = -(far + near) / d;
            mat[15] = 1;
            return mat;
        };

        transpose(mat1:Float32Array){
            let mat = this.create();
            mat[0]  = mat1[0];  mat[1]  = mat1[4];  mat[2]  = mat1[8];  mat[3]  = mat1[12];
            mat[4]  = mat1[1];  mat[5]  = mat1[5];  mat[6]  = mat1[9];  mat[7]  = mat1[13];
            mat[8]  = mat1[2];  mat[9]  = mat1[6];  mat[10] = mat1[10]; mat[11] = mat1[14];
            mat[12] = mat1[3];  mat[13] = mat1[7];  mat[14] = mat1[11]; mat[15] = mat1[15];
            return mat;
        }

        inverse = function(mat1:Float32Array){
            let mat = this.create();
            var a = mat1[0],  b = mat1[1],  c = mat1[2],  d = mat1[3],
                e = mat1[4],  f = mat1[5],  g = mat1[6],  h = mat1[7],
                i = mat1[8],  j = mat1[9],  k = mat1[10], l = mat1[11],
                m = mat1[12], n = mat1[13], o = mat1[14], p = mat1[15],
                q = a * f - b * e, r = a * g - c * e,
                s = a * h - d * e, t = b * g - c * f,
                u = b * h - d * f, v = c * h - d * g,
                w = i * n - j * m, x = i * o - k * m,
                y = i * p - l * m, z = j * o - k * n,
                A = j * p - l * n, B = k * p - l * o,
                ivd = 1 / (q * B - r * A + s * z + t * y - u * x + v * w);
            mat[0]  = ( f * B - g * A + h * z) * ivd;
            mat[1]  = (-b * B + c * A - d * z) * ivd;
            mat[2]  = ( n * v - o * u + p * t) * ivd;
            mat[3]  = (-j * v + k * u - l * t) * ivd;
            mat[4]  = (-e * B + g * y - h * x) * ivd;
            mat[5]  = ( a * B - c * y + d * x) * ivd;
            mat[6]  = (-m * v + o * s - p * r) * ivd;
            mat[7]  = ( i * v - k * s + l * r) * ivd;
            mat[8]  = ( e * A - f * y + h * w) * ivd;
            mat[9]  = (-a * A + b * y - d * w) * ivd;
            mat[10] = ( m * u - n * s + p * q) * ivd;
            mat[11] = (-i * u + j * s - l * q) * ivd;
            mat[12] = (-e * z + f * x - g * w) * ivd;
            mat[13] = ( a * z - b * x + c * w) * ivd;
            mat[14] = (-m * t + n * r - o * q) * ivd;
            mat[15] = ( i * t - j * r + k * q) * ivd;
            return mat;
        }
    }
    
}