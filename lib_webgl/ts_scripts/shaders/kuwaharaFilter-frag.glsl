precision mediump float;

uniform sampler2D texture;

uniform bool b_kuwahara;
uniform float cvsHeight;
uniform float cvsWidth;
varying vec2 vTexCoord;

void main(void){
    vec3  destColor = vec3(0.0);
    if(b_kuwahara){
        float minVal =0.0;
        vec3 mean[4];
        vec3 sigma[4];
        vec2 offset[49];
        offset[0] = vec2(-3.0, -3.0);
        offset[1] = vec2(-2.0, -3.0);
        offset[2] = vec2(-1.0, -3.0);
        offset[3] = vec2( 0.0, -3.0);
        offset[4] = vec2( 1.0, -3.0);
        offset[5] = vec2( 2.0, -3.0);
        offset[6] = vec2( 3.0, -3.0);

        offset[7]  = vec2(-3.0, -2.0);
        offset[8]  = vec2(-2.0, -2.0);
        offset[9]  = vec2(-1.0, -2.0);
        offset[10] = vec2( 0.0, -2.0);
        offset[11] = vec2( 1.0, -2.0);
        offset[12] = vec2( 2.0, -2.0);
        offset[13] = vec2( 3.0, -2.0);

        offset[14] = vec2(-3.0, -1.0);
        offset[15] = vec2(-2.0, -1.0);
        offset[16] = vec2(-1.0, -1.0);
        offset[17] = vec2( 0.0, -1.0);
        offset[18] = vec2( 1.0, -1.0);
        offset[19] = vec2( 2.0, -1.0);
        offset[20] = vec2( 3.0, -1.0);
        
        offset[21] = vec2(-3.0,  0.0);
        offset[22] = vec2(-2.0,  0.0);
        offset[23] = vec2(-1.0,  0.0);
        offset[24] = vec2( 0.0,  0.0);
        offset[25] = vec2( 1.0,  0.0);
        offset[26] = vec2( 2.0,  0.0);
        offset[27] = vec2( 3.0,  0.0);
        
        offset[28] = vec2(-3.0,  1.0);
        offset[29] = vec2(-2.0,  1.0);
        offset[30] = vec2(-1.0,  1.0);
        offset[31] = vec2( 0.0,  1.0);
        offset[32] = vec2( 1.0,  1.0);
        offset[33] = vec2( 2.0,  1.0);
        offset[34] = vec2( 3.0,  1.0);
        
        offset[35] = vec2(-3.0,  2.0);
        offset[36] = vec2(-2.0,  2.0);
        offset[37] = vec2(-1.0,  2.0);
        offset[38] = vec2( 0.0,  2.0);
        offset[39] = vec2( 1.0,  2.0);
        offset[40] = vec2( 2.0,  2.0);
        offset[41] = vec2( 3.0,  2.0);
        
        offset[42] = vec2(-3.0,  3.0);
        offset[43] = vec2(-2.0,  3.0);
        offset[44] = vec2(-1.0,  3.0);
        offset[45] = vec2( 0.0,  3.0);
        offset[46] = vec2( 1.0,  3.0);
        offset[47] = vec2( 2.0,  3.0);
        offset[48] = vec2( 3.0,  3.0);

        float tFrag = 1.0 / cvsHeight;
        float sFrag = 1.0 / cvsWidth;
        vec2  Frag = vec2(sFrag,tFrag);
        vec2  fc = vec2(gl_FragCoord.s, cvsHeight - gl_FragCoord.t);
        
        //calculate mean
        mean[0] = vec3(0.0);
        sigma[0] = vec3(0.0);
        mean[0]  += texture2D(texture, (fc + offset[3]) * Frag).rgb;
        mean[0]  += texture2D(texture, (fc + offset[4]) * Frag).rgb;
        mean[0]  += texture2D(texture, (fc + offset[5]) * Frag).rgb;
        mean[0]  += texture2D(texture, (fc + offset[6]) * Frag).rgb;
        mean[0]  += texture2D(texture, (fc + offset[10]) * Frag).rgb;
        mean[0]  += texture2D(texture, (fc + offset[11]) * Frag).rgb;
        mean[0]  += texture2D(texture, (fc + offset[12]) * Frag).rgb;
        mean[0]  += texture2D(texture, (fc + offset[13]) * Frag).rgb;
        mean[0]  += texture2D(texture, (fc + offset[17]) * Frag).rgb;
        mean[0]  += texture2D(texture, (fc + offset[18]) * Frag).rgb;
        mean[0]  += texture2D(texture, (fc + offset[19]) * Frag).rgb;
        mean[0]  += texture2D(texture, (fc + offset[20]) * Frag).rgb;
        mean[0]  += texture2D(texture, (fc + offset[24]) * Frag).rgb;
        mean[0]  += texture2D(texture, (fc + offset[25]) * Frag).rgb;
        mean[0]  += texture2D(texture, (fc + offset[26]) * Frag).rgb;
        mean[0]  += texture2D(texture, (fc + offset[27]) * Frag).rgb;

        sigma[0]  += texture2D(texture, (fc + offset[3]) * Frag).rgb * texture2D(texture, (fc + offset[3]) * Frag).rgb;
        sigma[0]  += texture2D(texture, (fc + offset[4]) * Frag).rgb * texture2D(texture, (fc + offset[4]) * Frag).rgb;
        sigma[0]  += texture2D(texture, (fc + offset[5]) * Frag).rgb * texture2D(texture, (fc + offset[5]) * Frag).rgb;
        sigma[0]  += texture2D(texture, (fc + offset[6]) * Frag).rgb * texture2D(texture, (fc + offset[6]) * Frag).rgb;
        sigma[0]  += texture2D(texture, (fc + offset[10]) * Frag).rgb * texture2D(texture, (fc + offset[10]) * Frag).rgb;
        sigma[0]  += texture2D(texture, (fc + offset[11]) * Frag).rgb * texture2D(texture, (fc + offset[11]) * Frag).rgb;
        sigma[0]  += texture2D(texture, (fc + offset[12]) * Frag).rgb * texture2D(texture, (fc + offset[12]) * Frag).rgb;
        sigma[0]  += texture2D(texture, (fc + offset[13]) * Frag).rgb * texture2D(texture, (fc + offset[13]) * Frag).rgb;
        sigma[0]  += texture2D(texture, (fc + offset[17]) * Frag).rgb * texture2D(texture, (fc + offset[17]) * Frag).rgb;
        sigma[0]  += texture2D(texture, (fc + offset[18]) * Frag).rgb * texture2D(texture, (fc + offset[18]) * Frag).rgb;
        sigma[0]  += texture2D(texture, (fc + offset[19]) * Frag).rgb * texture2D(texture, (fc + offset[19]) * Frag).rgb;
        sigma[0]  += texture2D(texture, (fc + offset[20]) * Frag).rgb * texture2D(texture, (fc + offset[20]) * Frag).rgb;
        sigma[0]  += texture2D(texture, (fc + offset[24]) * Frag).rgb * texture2D(texture, (fc + offset[24]) * Frag).rgb;
        sigma[0]  += texture2D(texture, (fc + offset[25]) * Frag).rgb * texture2D(texture, (fc + offset[25]) * Frag).rgb;
        sigma[0]  += texture2D(texture, (fc + offset[26]) * Frag).rgb * texture2D(texture, (fc + offset[26]) * Frag).rgb;
        sigma[0]  += texture2D(texture, (fc + offset[27]) * Frag).rgb * texture2D(texture, (fc + offset[27]) * Frag).rgb;

        mean[0] /= 16.0;
        sigma[0] = abs(sigma[0]/16.0 -  mean[0]* mean[0]);
        minVal = sigma[0].r + sigma[0].g + sigma[0].b;

        mean[1] = vec3(0.0);
        sigma[1] = vec3(0.0);
        mean[1]  += texture2D(texture, (fc + offset[0]) * Frag).rgb;
        mean[1]  += texture2D(texture, (fc + offset[1]) * Frag).rgb;
        mean[1]  += texture2D(texture, (fc + offset[2]) * Frag).rgb;
        mean[1]  += texture2D(texture, (fc + offset[3]) * Frag).rgb;
        mean[1]  += texture2D(texture, (fc + offset[7]) * Frag).rgb;
        mean[1]  += texture2D(texture, (fc + offset[8]) * Frag).rgb;
        mean[1]  += texture2D(texture, (fc + offset[9]) * Frag).rgb;
        mean[1]  += texture2D(texture, (fc + offset[10]) * Frag).rgb;
        mean[1]  += texture2D(texture, (fc + offset[14]) * Frag).rgb;
        mean[1]  += texture2D(texture, (fc + offset[15]) * Frag).rgb;
        mean[1]  += texture2D(texture, (fc + offset[16]) * Frag).rgb;
        mean[1]  += texture2D(texture, (fc + offset[17]) * Frag).rgb;
        mean[1]  += texture2D(texture, (fc + offset[21]) * Frag).rgb;
        mean[1]  += texture2D(texture, (fc + offset[22]) * Frag).rgb;
        mean[1]  += texture2D(texture, (fc + offset[23]) * Frag).rgb;
        mean[1]  += texture2D(texture, (fc + offset[24]) * Frag).rgb;

        sigma[1]  += texture2D(texture, (fc + offset[0]) * Frag).rgb * texture2D(texture, (fc + offset[0]) * Frag).rgb;
        sigma[1]  += texture2D(texture, (fc + offset[1]) * Frag).rgb * texture2D(texture, (fc + offset[1]) * Frag).rgb;
        sigma[1]  += texture2D(texture, (fc + offset[2]) * Frag).rgb * texture2D(texture, (fc + offset[2]) * Frag).rgb;
        sigma[1]  += texture2D(texture, (fc + offset[3]) * Frag).rgb * texture2D(texture, (fc + offset[3]) * Frag).rgb;
        sigma[1]  += texture2D(texture, (fc + offset[7]) * Frag).rgb * texture2D(texture, (fc + offset[7]) * Frag).rgb;
        sigma[1]  += texture2D(texture, (fc + offset[8]) * Frag).rgb * texture2D(texture, (fc + offset[8]) * Frag).rgb;
        sigma[1]  += texture2D(texture, (fc + offset[9]) * Frag).rgb * texture2D(texture, (fc + offset[9]) * Frag).rgb;
        sigma[1]  += texture2D(texture, (fc + offset[10]) * Frag).rgb * texture2D(texture, (fc + offset[10]) * Frag).rgb;
        sigma[1]  += texture2D(texture, (fc + offset[14]) * Frag).rgb * texture2D(texture, (fc + offset[14]) * Frag).rgb;
        sigma[1]  += texture2D(texture, (fc + offset[15]) * Frag).rgb * texture2D(texture, (fc + offset[15]) * Frag).rgb;
        sigma[1]  += texture2D(texture, (fc + offset[16]) * Frag).rgb * texture2D(texture, (fc + offset[16]) * Frag).rgb;
        sigma[1]  += texture2D(texture, (fc + offset[17]) * Frag).rgb * texture2D(texture, (fc + offset[17]) * Frag).rgb;
        sigma[1]  += texture2D(texture, (fc + offset[21]) * Frag).rgb * texture2D(texture, (fc + offset[21]) * Frag).rgb;
        sigma[1]  += texture2D(texture, (fc + offset[22]) * Frag).rgb * texture2D(texture, (fc + offset[22]) * Frag).rgb;
        sigma[1]  += texture2D(texture, (fc + offset[23]) * Frag).rgb * texture2D(texture, (fc + offset[23]) * Frag).rgb;
        sigma[1]  += texture2D(texture, (fc + offset[24]) * Frag).rgb * texture2D(texture, (fc + offset[24]) * Frag).rgb;

        mean[1] /= 16.0;
        sigma[1] = abs(sigma[1]/16.0 -  mean[1]* mean[1]);
        float sigmaVal = sigma[1].r + sigma[1].g + sigma[1].b;
        if(sigmaVal<minVal){
            destColor = mean[1].rgb;
            minVal = sigmaVal;
        }else{
            destColor = mean[0].rgb;
        }

        mean[2] = vec3(0.0);
        sigma[2] = vec3(0.0);
        mean[2]  += texture2D(texture, (fc + offset[21]) * Frag).rgb;
        mean[2]  += texture2D(texture, (fc + offset[22]) * Frag).rgb;
        mean[2]  += texture2D(texture, (fc + offset[23]) * Frag).rgb;
        mean[2]  += texture2D(texture, (fc + offset[24]) * Frag).rgb;
        mean[2]  += texture2D(texture, (fc + offset[28]) * Frag).rgb;
        mean[2]  += texture2D(texture, (fc + offset[29]) * Frag).rgb;
        mean[2]  += texture2D(texture, (fc + offset[30]) * Frag).rgb;
        mean[2]  += texture2D(texture, (fc + offset[31]) * Frag).rgb;
        mean[2]  += texture2D(texture, (fc + offset[35]) * Frag).rgb;
        mean[2]  += texture2D(texture, (fc + offset[36]) * Frag).rgb;
        mean[2]  += texture2D(texture, (fc + offset[37]) * Frag).rgb;
        mean[2]  += texture2D(texture, (fc + offset[38]) * Frag).rgb;
        mean[2]  += texture2D(texture, (fc + offset[42]) * Frag).rgb;
        mean[2]  += texture2D(texture, (fc + offset[43]) * Frag).rgb;
        mean[2]  += texture2D(texture, (fc + offset[44]) * Frag).rgb;
        mean[2]  += texture2D(texture, (fc + offset[45]) * Frag).rgb;

        sigma[2]  += texture2D(texture, (fc + offset[21]) * Frag).rgb * texture2D(texture, (fc + offset[21]) * Frag).rgb;
        sigma[2]  += texture2D(texture, (fc + offset[22]) * Frag).rgb * texture2D(texture, (fc + offset[22]) * Frag).rgb;
        sigma[2]  += texture2D(texture, (fc + offset[23]) * Frag).rgb * texture2D(texture, (fc + offset[23]) * Frag).rgb;
        sigma[2]  += texture2D(texture, (fc + offset[24]) * Frag).rgb * texture2D(texture, (fc + offset[24]) * Frag).rgb;
        sigma[2]  += texture2D(texture, (fc + offset[28]) * Frag).rgb * texture2D(texture, (fc + offset[28]) * Frag).rgb;
        sigma[2]  += texture2D(texture, (fc + offset[29]) * Frag).rgb * texture2D(texture, (fc + offset[29]) * Frag).rgb;
        sigma[2]  += texture2D(texture, (fc + offset[30]) * Frag).rgb * texture2D(texture, (fc + offset[30]) * Frag).rgb;
        sigma[2]  += texture2D(texture, (fc + offset[31]) * Frag).rgb * texture2D(texture, (fc + offset[31]) * Frag).rgb;
        sigma[2]  += texture2D(texture, (fc + offset[35]) * Frag).rgb * texture2D(texture, (fc + offset[35]) * Frag).rgb;
        sigma[2]  += texture2D(texture, (fc + offset[36]) * Frag).rgb * texture2D(texture, (fc + offset[36]) * Frag).rgb;
        sigma[2]  += texture2D(texture, (fc + offset[37]) * Frag).rgb * texture2D(texture, (fc + offset[37]) * Frag).rgb;
        sigma[2]  += texture2D(texture, (fc + offset[38]) * Frag).rgb * texture2D(texture, (fc + offset[38]) * Frag).rgb;
        sigma[2]  += texture2D(texture, (fc + offset[42]) * Frag).rgb * texture2D(texture, (fc + offset[42]) * Frag).rgb;
        sigma[2]  += texture2D(texture, (fc + offset[43]) * Frag).rgb * texture2D(texture, (fc + offset[43]) * Frag).rgb;
        sigma[2]  += texture2D(texture, (fc + offset[44]) * Frag).rgb * texture2D(texture, (fc + offset[44]) * Frag).rgb;
        sigma[2]  += texture2D(texture, (fc + offset[45]) * Frag).rgb * texture2D(texture, (fc + offset[45]) * Frag).rgb;

        mean[2] /= 16.0;
        sigma[2] = abs(sigma[2]/16.0 -  mean[2]* mean[2]);
        sigmaVal = sigma[2].r + sigma[2].g + sigma[2].b;
        if(sigmaVal<minVal){
            destColor = mean[2].rgb;
            minVal = sigmaVal;
        }

        mean[3] = vec3(0.0);
        sigma[3] = vec3(0.0);
        mean[3]  += texture2D(texture, (fc + offset[24]) * Frag).rgb;
        mean[3]  += texture2D(texture, (fc + offset[25]) * Frag).rgb;
        mean[3]  += texture2D(texture, (fc + offset[26]) * Frag).rgb;
        mean[3]  += texture2D(texture, (fc + offset[27]) * Frag).rgb;
        mean[3]  += texture2D(texture, (fc + offset[31]) * Frag).rgb;
        mean[3]  += texture2D(texture, (fc + offset[32]) * Frag).rgb;
        mean[3]  += texture2D(texture, (fc + offset[33]) * Frag).rgb;
        mean[3]  += texture2D(texture, (fc + offset[34]) * Frag).rgb;
        mean[3]  += texture2D(texture, (fc + offset[38]) * Frag).rgb;
        mean[3]  += texture2D(texture, (fc + offset[39]) * Frag).rgb;
        mean[3]  += texture2D(texture, (fc + offset[40]) * Frag).rgb;
        mean[3]  += texture2D(texture, (fc + offset[41]) * Frag).rgb;
        mean[3]  += texture2D(texture, (fc + offset[45]) * Frag).rgb;
        mean[3]  += texture2D(texture, (fc + offset[46]) * Frag).rgb;
        mean[3]  += texture2D(texture, (fc + offset[47]) * Frag).rgb;
        mean[3]  += texture2D(texture, (fc + offset[48]) * Frag).rgb;

        sigma[3]  += texture2D(texture, (fc + offset[24]) * Frag).rgb * texture2D(texture, (fc + offset[24]) * Frag).rgb;
        sigma[3]  += texture2D(texture, (fc + offset[25]) * Frag).rgb * texture2D(texture, (fc + offset[25]) * Frag).rgb;
        sigma[3]  += texture2D(texture, (fc + offset[26]) * Frag).rgb * texture2D(texture, (fc + offset[26]) * Frag).rgb;
        sigma[3]  += texture2D(texture, (fc + offset[27]) * Frag).rgb * texture2D(texture, (fc + offset[27]) * Frag).rgb;
        sigma[3]  += texture2D(texture, (fc + offset[31]) * Frag).rgb * texture2D(texture, (fc + offset[31]) * Frag).rgb;
        sigma[3]  += texture2D(texture, (fc + offset[32]) * Frag).rgb * texture2D(texture, (fc + offset[32]) * Frag).rgb;
        sigma[3]  += texture2D(texture, (fc + offset[33]) * Frag).rgb * texture2D(texture, (fc + offset[33]) * Frag).rgb;
        sigma[3]  += texture2D(texture, (fc + offset[34]) * Frag).rgb * texture2D(texture, (fc + offset[34]) * Frag).rgb;
        sigma[3]  += texture2D(texture, (fc + offset[38]) * Frag).rgb * texture2D(texture, (fc + offset[38]) * Frag).rgb;
        sigma[3]  += texture2D(texture, (fc + offset[39]) * Frag).rgb * texture2D(texture, (fc + offset[39]) * Frag).rgb;
        sigma[3]  += texture2D(texture, (fc + offset[40]) * Frag).rgb * texture2D(texture, (fc + offset[40]) * Frag).rgb;
        sigma[3]  += texture2D(texture, (fc + offset[41]) * Frag).rgb * texture2D(texture, (fc + offset[41]) * Frag).rgb;
        sigma[3]  += texture2D(texture, (fc + offset[45]) * Frag).rgb * texture2D(texture, (fc + offset[45]) * Frag).rgb;
        sigma[3]  += texture2D(texture, (fc + offset[46]) * Frag).rgb * texture2D(texture, (fc + offset[46]) * Frag).rgb;
        sigma[3]  += texture2D(texture, (fc + offset[47]) * Frag).rgb * texture2D(texture, (fc + offset[47]) * Frag).rgb;
        sigma[3]  += texture2D(texture, (fc + offset[48]) * Frag).rgb * texture2D(texture, (fc + offset[48]) * Frag).rgb;
        
        mean[3] /= 16.0;
        sigma[3] = abs(sigma[3]/16.0 -  mean[3]* mean[3]);
        sigmaVal = sigma[3].r + sigma[3].g + sigma[3].b;
        if(sigmaVal<minVal){
            destColor = mean[3].rgb;
            minVal = sigmaVal;
        }  

    }else{
        destColor = texture2D(texture, vTexCoord).rgb;
    }

    gl_FragColor = vec4(destColor, 1.0);
}