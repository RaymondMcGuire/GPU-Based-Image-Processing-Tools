/* =========================================================================
 *
 *  webgl_quaternion.ts
 *  a quaternion library developed for webgl
 *  part of source code referenced by minMatrix.js
 *  https://wgld.org/d/library/l001.html
 * ========================================================================= */
module EcognitaMathLib {
    export class WebGLQuaternion {
        constructor() {}
        create(){return new Float32Array(4);}
        
        identity(qat:Float32Array){
            qat[0] = 0;qat[1] = 0;qat[2] = 0;qat[3] = 1;
            return qat;
        }

        inverse(qat:Float32Array){
            let out_qat = this.create();
            out_qat[0] = -qat[0];
            out_qat[1] = -qat[1]; 
            out_qat[2] = -qat[2];
            out_qat[3] =  qat[3];
            return out_qat;
        }

        normalize(qat:Float32Array){
            var x = qat[0], y = qat[1], z = qat[2], w = qat[3];
            var l = Math.sqrt(x * x + y * y + z * z + w * w); 
            if(l === 0){
                qat[0] = 0;
                qat[1] = 0;
                qat[2] = 0;
                qat[3] = 0;
            }else{
                l = 1 / l;
                qat[0] = x * l;
                qat[1] = y * l;
                qat[2] = z * l;
                qat[3] = w * l;
            }
            return qat;
        }

        //q1(v1,w1) q2(v2,w2)
        //v(Im) =  xi + yj + zk
        //w(Re)
        //q1q2 = (v1 x v2 + w2v1 + w1v2,w1w2 - v1・v2)
        multiply(qat1:Float32Array,qat2:Float32Array){
            let out_qat = this.create();
            var ax = qat1[0], ay = qat1[1], az = qat1[2], aw = qat1[3];
            var bx = qat2[0], by = qat2[1], bz = qat2[2], bw = qat2[3];
            out_qat[0] = ax * bw + aw * bx + ay * bz - az * by;
            out_qat[1] = ay * bw + aw * by + az * bx - ax * bz;
            out_qat[2] = az * bw + aw * bz + ax * by - ay * bx;
            out_qat[3] = aw * bw - ax * bx - ay * by - az * bz;
            return out_qat;
        }

        rotate(angle:number, axis:Array<number>){
            var sq = Math.sqrt(axis[0] * axis[0] + axis[1] * axis[1] + axis[2] * axis[2]);
            if(!sq){
                console.log("need a axis value")
                return undefined;
            }
            var a = axis[0], b = axis[1], c = axis[2];
            if(sq != 1){sq = 1 / sq; a *= sq; b *= sq; c *= sq;}
            var s = Math.sin(angle * 0.5);
            let out_qat = this.create();
            out_qat[0] = a * s;
            out_qat[1] = b * s;
            out_qat[2] = c * s;
            out_qat[3] = Math.cos(angle * 0.5);
            return out_qat;
        }

        //P' = qPq^(-1)
        ToV3(p_v3:Array<number>,q:Float32Array){
            let out_p = new Array<number>(3);
            let inv_q = this.inverse(q);
            let in_p = this.create();
            in_p[0] = p_v3[0];
            in_p[1] = p_v3[1];
            in_p[2] = p_v3[2];
            let p_invq = this.multiply(inv_q,in_p);
            let q_p_invq = this.multiply(p_invq,q);
            out_p[0] = q_p_invq[0];
            out_p[1] = q_p_invq[1];
            out_p[2] = q_p_invq[2];
            return out_p;
        }

        ToMat4x4(q:Float32Array){
            let out_mat = new Float32Array(16);
            var x = q[0], y = q[1], z = q[2], w = q[3];
            var x2 = x + x, y2 = y + y, z2 = z + z;
            var xx = x * x2, xy = x * y2, xz = x * z2;
            var yy = y * y2, yz = y * z2, zz = z * z2;
            var wx = w * x2, wy = w * y2, wz = w * z2;
            out_mat[0]  = 1 - (yy + zz);
            out_mat[1]  = xy - wz;
            out_mat[2]  = xz + wy;
            out_mat[3]  = 0;
            out_mat[4]  = xy + wz;
            out_mat[5]  = 1 - (xx + zz);
            out_mat[6]  = yz - wx;
            out_mat[7]  = 0;
            out_mat[8]  = xz - wy;
            out_mat[9]  = yz + wx;
            out_mat[10] = 1 - (xx + yy);
            out_mat[11] = 0;
            out_mat[12] = 0;
            out_mat[13] = 0;
            out_mat[14] = 0;
            out_mat[15] = 1;
            return out_mat;
        }


        slerp(qtn1:Float32Array,qtn2:Float32Array,time:number){
            if(time < 0 || time > 1){
                console.log("parameter time's setting is wrong!");
                return undefined;
            }

            let out_q = this.create();
            var ht = qtn1[0] * qtn2[0] + qtn1[1] * qtn2[1] + qtn1[2] * qtn2[2] + qtn1[3] * qtn2[3];
            var hs = 1.0 - ht * ht;
            if(hs <= 0.0){
                out_q[0] = qtn1[0];
                out_q[1] = qtn1[1];
                out_q[2] = qtn1[2];
                out_q[3] = qtn1[3];
            }else{
                hs = Math.sqrt(hs);
                if(Math.abs(hs) < 0.0001){
                    out_q[0] = (qtn1[0] * 0.5 + qtn2[0] * 0.5);
                    out_q[1] = (qtn1[1] * 0.5 + qtn2[1] * 0.5);
                    out_q[2] = (qtn1[2] * 0.5 + qtn2[2] * 0.5);
                    out_q[3] = (qtn1[3] * 0.5 + qtn2[3] * 0.5);
                }else{
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
        }

    }
    
}