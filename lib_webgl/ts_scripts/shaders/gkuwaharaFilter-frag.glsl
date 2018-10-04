precision mediump float;

uniform sampler2D texture;

uniform float weight[49];
uniform bool b_gkuwahara;
uniform float cvsHeight;
uniform float cvsWidth;
varying vec2 vTexCoord;

void main(void){
    vec3  destColor = vec3(0.0);
    if(b_gkuwahara){
        float q = 3.0;
        vec3 mean[8];
        vec3 sigma[8];
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
        vec3 cur_std = vec3(0.0);
        float cur_weight = 0.0;
        vec3 total_ms = vec3(0.0);
        vec3 total_s = vec3(0.0);
        
        mean[0]=vec3(0.0);
        sigma[0]=vec3(0.0);
        cur_weight = 0.0;
        mean[0]  += texture2D(texture, (fc + offset[24]) * Frag).rgb * weight[24];
        sigma[0]  += texture2D(texture, (fc + offset[24]) * Frag).rgb * texture2D(texture, (fc + offset[24]) * Frag).rgb * weight[24];
        cur_weight+= weight[24];
        mean[0]  += texture2D(texture, (fc + offset[31]) * Frag).rgb * weight[31];
        sigma[0]  += texture2D(texture, (fc + offset[31]) * Frag).rgb * texture2D(texture, (fc + offset[31]) * Frag).rgb * weight[31];
        cur_weight+= weight[31];
        mean[0]  += texture2D(texture, (fc + offset[38]) * Frag).rgb * weight[38];
        sigma[0]  += texture2D(texture, (fc + offset[38]) * Frag).rgb * texture2D(texture, (fc + offset[38]) * Frag).rgb * weight[38];
        cur_weight+= weight[38];
        mean[0]  += texture2D(texture, (fc + offset[45]) * Frag).rgb * weight[45];
        sigma[0]  += texture2D(texture, (fc + offset[45]) * Frag).rgb * texture2D(texture, (fc + offset[45]) * Frag).rgb * weight[45];
        cur_weight+= weight[45];
        mean[0]  += texture2D(texture, (fc + offset[39]) * Frag).rgb * weight[39];
        sigma[0]  += texture2D(texture, (fc + offset[39]) * Frag).rgb * texture2D(texture, (fc + offset[39]) * Frag).rgb * weight[39];
        cur_weight+= weight[39];
        mean[0]  += texture2D(texture, (fc + offset[46]) * Frag).rgb * weight[46];
        sigma[0]  += texture2D(texture, (fc + offset[46]) * Frag).rgb * texture2D(texture, (fc + offset[46]) * Frag).rgb * weight[46];
        cur_weight+= weight[46];
        mean[0]  += texture2D(texture, (fc + offset[47]) * Frag).rgb * weight[47];
        sigma[0]  += texture2D(texture, (fc + offset[47]) * Frag).rgb * texture2D(texture, (fc + offset[47]) * Frag).rgb * weight[47];
        cur_weight+= weight[47];

        if(cur_weight!=0.0){
            mean[0] /= cur_weight;
            sigma[0] /= cur_weight;
        }

        cur_std = sigma[0] - mean[0] * mean[0];
        if(cur_std.r > 1e-10 && cur_std.g > 1e-10 && cur_std.b > 1e-10){
            cur_std = sqrt(cur_std);
        }else{
            cur_std = vec3(1e-10);
        }
        total_ms += mean[0] * pow(cur_std,vec3(-q));
        total_s  += pow(cur_std,vec3(-q));
        mean[1]=vec3(0.0);
        sigma[1]=vec3(0.0);
        cur_weight = 0.0;
        mean[1]  += texture2D(texture, (fc + offset[32]) * Frag).rgb * weight[32];
        sigma[1]  += texture2D(texture, (fc + offset[32]) * Frag).rgb * texture2D(texture, (fc + offset[32]) * Frag).rgb * weight[32];
        cur_weight+= weight[32];
        mean[1]  += texture2D(texture, (fc + offset[33]) * Frag).rgb * weight[33];
        sigma[1]  += texture2D(texture, (fc + offset[33]) * Frag).rgb * texture2D(texture, (fc + offset[33]) * Frag).rgb * weight[33];
        cur_weight+= weight[33];
        mean[1]  += texture2D(texture, (fc + offset[40]) * Frag).rgb * weight[40];
        sigma[1]  += texture2D(texture, (fc + offset[40]) * Frag).rgb * texture2D(texture, (fc + offset[40]) * Frag).rgb * weight[40];
        cur_weight+= weight[40];
        mean[1]  += texture2D(texture, (fc + offset[34]) * Frag).rgb * weight[34];
        sigma[1]  += texture2D(texture, (fc + offset[34]) * Frag).rgb * texture2D(texture, (fc + offset[34]) * Frag).rgb * weight[34];
        cur_weight+= weight[34];
        mean[1]  += texture2D(texture, (fc + offset[41]) * Frag).rgb * weight[41];
        sigma[1]  += texture2D(texture, (fc + offset[41]) * Frag).rgb * texture2D(texture, (fc + offset[41]) * Frag).rgb * weight[41];
        cur_weight+= weight[41];
        mean[1]  += texture2D(texture, (fc + offset[48]) * Frag).rgb * weight[48];
        sigma[1]  += texture2D(texture, (fc + offset[48]) * Frag).rgb * texture2D(texture, (fc + offset[48]) * Frag).rgb * weight[48];
        cur_weight+= weight[48];

        if(cur_weight!=0.0){
            mean[1] /= cur_weight;
            sigma[1] /= cur_weight;
        }

        cur_std = sigma[1] - mean[1] * mean[1];
        if(cur_std.r > 1e-10 && cur_std.g > 1e-10 && cur_std.b > 1e-10){
            cur_std = sqrt(cur_std);
        }else{
            cur_std = vec3(1e-10);
        }
        total_ms += mean[1] * pow(cur_std,vec3(-q));
        total_s  += pow(cur_std,vec3(-q));
        mean[2]=vec3(0.0);
        sigma[2]=vec3(0.0);
        cur_weight = 0.0;
        mean[2]  += texture2D(texture, (fc + offset[25]) * Frag).rgb * weight[25];
        sigma[2]  += texture2D(texture, (fc + offset[25]) * Frag).rgb * texture2D(texture, (fc + offset[25]) * Frag).rgb * weight[25];
        cur_weight+= weight[25];
        mean[2]  += texture2D(texture, (fc + offset[19]) * Frag).rgb * weight[19];
        sigma[2]  += texture2D(texture, (fc + offset[19]) * Frag).rgb * texture2D(texture, (fc + offset[19]) * Frag).rgb * weight[19];
        cur_weight+= weight[19];
        mean[2]  += texture2D(texture, (fc + offset[26]) * Frag).rgb * weight[26];
        sigma[2]  += texture2D(texture, (fc + offset[26]) * Frag).rgb * texture2D(texture, (fc + offset[26]) * Frag).rgb * weight[26];
        cur_weight+= weight[26];
        mean[2]  += texture2D(texture, (fc + offset[13]) * Frag).rgb * weight[13];
        sigma[2]  += texture2D(texture, (fc + offset[13]) * Frag).rgb * texture2D(texture, (fc + offset[13]) * Frag).rgb * weight[13];
        cur_weight+= weight[13];
        mean[2]  += texture2D(texture, (fc + offset[20]) * Frag).rgb * weight[20];
        sigma[2]  += texture2D(texture, (fc + offset[20]) * Frag).rgb * texture2D(texture, (fc + offset[20]) * Frag).rgb * weight[20];
        cur_weight+= weight[20];
        mean[2]  += texture2D(texture, (fc + offset[27]) * Frag).rgb * weight[27];
        sigma[2]  += texture2D(texture, (fc + offset[27]) * Frag).rgb * texture2D(texture, (fc + offset[27]) * Frag).rgb * weight[27];
        cur_weight+= weight[27];

        if(cur_weight!=0.0){
            mean[2] /= cur_weight;
            sigma[2] /= cur_weight;
        }

        cur_std = sigma[2] - mean[2] * mean[2];
        if(cur_std.r > 1e-10 && cur_std.g > 1e-10 && cur_std.b > 1e-10){
            cur_std = sqrt(cur_std);
        }else{
            cur_std = vec3(1e-10);
        }
        total_ms += mean[2] * pow(cur_std,vec3(-q));
        total_s  += pow(cur_std,vec3(-q));
        mean[3]=vec3(0.0);
        sigma[3]=vec3(0.0);
        cur_weight = 0.0;
        mean[3]  += texture2D(texture, (fc + offset[4]) * Frag).rgb * weight[4];
        sigma[3]  += texture2D(texture, (fc + offset[4]) * Frag).rgb * texture2D(texture, (fc + offset[4]) * Frag).rgb * weight[4];
        cur_weight+= weight[4];
        mean[3]  += texture2D(texture, (fc + offset[11]) * Frag).rgb * weight[11];
        sigma[3]  += texture2D(texture, (fc + offset[11]) * Frag).rgb * texture2D(texture, (fc + offset[11]) * Frag).rgb * weight[11];
        cur_weight+= weight[11];
        mean[3]  += texture2D(texture, (fc + offset[18]) * Frag).rgb * weight[18];
        sigma[3]  += texture2D(texture, (fc + offset[18]) * Frag).rgb * texture2D(texture, (fc + offset[18]) * Frag).rgb * weight[18];
        cur_weight+= weight[18];
        mean[3]  += texture2D(texture, (fc + offset[5]) * Frag).rgb * weight[5];
        sigma[3]  += texture2D(texture, (fc + offset[5]) * Frag).rgb * texture2D(texture, (fc + offset[5]) * Frag).rgb * weight[5];
        cur_weight+= weight[5];
        mean[3]  += texture2D(texture, (fc + offset[12]) * Frag).rgb * weight[12];
        sigma[3]  += texture2D(texture, (fc + offset[12]) * Frag).rgb * texture2D(texture, (fc + offset[12]) * Frag).rgb * weight[12];
        cur_weight+= weight[12];
        mean[3]  += texture2D(texture, (fc + offset[6]) * Frag).rgb * weight[6];
        sigma[3]  += texture2D(texture, (fc + offset[6]) * Frag).rgb * texture2D(texture, (fc + offset[6]) * Frag).rgb * weight[6];
        cur_weight+= weight[6];

        if(cur_weight!=0.0){
            mean[3] /= cur_weight;
            sigma[3] /= cur_weight;
        }

        cur_std = sigma[3] - mean[3] * mean[3];
        if(cur_std.r > 1e-10 && cur_std.g > 1e-10 && cur_std.b > 1e-10){
            cur_std = sqrt(cur_std);
        }else{
            cur_std = vec3(1e-10);
        }
        total_ms += mean[3] * pow(cur_std,vec3(-q));
        total_s  += pow(cur_std,vec3(-q));
        mean[4]=vec3(0.0);
        sigma[4]=vec3(0.0);
        cur_weight = 0.0;
        mean[4]  += texture2D(texture, (fc + offset[1]) * Frag).rgb * weight[1];
        sigma[4]  += texture2D(texture, (fc + offset[1]) * Frag).rgb * texture2D(texture, (fc + offset[1]) * Frag).rgb * weight[1];
        cur_weight+= weight[1];
        mean[4]  += texture2D(texture, (fc + offset[2]) * Frag).rgb * weight[2];
        sigma[4]  += texture2D(texture, (fc + offset[2]) * Frag).rgb * texture2D(texture, (fc + offset[2]) * Frag).rgb * weight[2];
        cur_weight+= weight[2];
        mean[4]  += texture2D(texture, (fc + offset[9]) * Frag).rgb * weight[9];
        sigma[4]  += texture2D(texture, (fc + offset[9]) * Frag).rgb * texture2D(texture, (fc + offset[9]) * Frag).rgb * weight[9];
        cur_weight+= weight[9];
        mean[4]  += texture2D(texture, (fc + offset[3]) * Frag).rgb * weight[3];
        sigma[4]  += texture2D(texture, (fc + offset[3]) * Frag).rgb * texture2D(texture, (fc + offset[3]) * Frag).rgb * weight[3];
        cur_weight+= weight[3];
        mean[4]  += texture2D(texture, (fc + offset[10]) * Frag).rgb * weight[10];
        sigma[4]  += texture2D(texture, (fc + offset[10]) * Frag).rgb * texture2D(texture, (fc + offset[10]) * Frag).rgb * weight[10];
        cur_weight+= weight[10];
        mean[4]  += texture2D(texture, (fc + offset[17]) * Frag).rgb * weight[17];
        sigma[4]  += texture2D(texture, (fc + offset[17]) * Frag).rgb * texture2D(texture, (fc + offset[17]) * Frag).rgb * weight[17];
        cur_weight+= weight[17];
        if(cur_weight!=0.0){
            mean[4] /= cur_weight;
            sigma[4] /= cur_weight;
        }
        cur_std = sigma[4] - mean[4] * mean[4];
        if(cur_std.r > 1e-10 && cur_std.g > 1e-10 && cur_std.b > 1e-10){
            cur_std = sqrt(cur_std);
        }else{
            cur_std = vec3(1e-10);
        }
        total_ms += mean[4] * pow(cur_std,vec3(-q));
        total_s  += pow(cur_std,vec3(-q));
        mean[5]=vec3(0.0);
        sigma[5]=vec3(0.0);
        cur_weight = 0.0;
        mean[5]  += texture2D(texture, (fc + offset[0]) * Frag).rgb * weight[0];
        sigma[5]  += texture2D(texture, (fc + offset[0]) * Frag).rgb * texture2D(texture, (fc + offset[0]) * Frag).rgb * weight[0];
        cur_weight+= weight[0];
        mean[5]  += texture2D(texture, (fc + offset[7]) * Frag).rgb * weight[7];
        sigma[5]  += texture2D(texture, (fc + offset[7]) * Frag).rgb * texture2D(texture, (fc + offset[7]) * Frag).rgb * weight[7];
        cur_weight+= weight[7];
        mean[5]  += texture2D(texture, (fc + offset[14]) * Frag).rgb * weight[14];
        sigma[5]  += texture2D(texture, (fc + offset[14]) * Frag).rgb * texture2D(texture, (fc + offset[14]) * Frag).rgb * weight[14];
        cur_weight+= weight[14];
        mean[5]  += texture2D(texture, (fc + offset[8]) * Frag).rgb * weight[8];
        sigma[5]  += texture2D(texture, (fc + offset[8]) * Frag).rgb * texture2D(texture, (fc + offset[8]) * Frag).rgb * weight[8];
        cur_weight+= weight[8];
        mean[5]  += texture2D(texture, (fc + offset[15]) * Frag).rgb * weight[15];
        sigma[5]  += texture2D(texture, (fc + offset[15]) * Frag).rgb * texture2D(texture, (fc + offset[15]) * Frag).rgb * weight[15];
        cur_weight+= weight[15];
        mean[5]  += texture2D(texture, (fc + offset[16]) * Frag).rgb * weight[16];
        sigma[5]  += texture2D(texture, (fc + offset[16]) * Frag).rgb * texture2D(texture, (fc + offset[16]) * Frag).rgb * weight[16];
        cur_weight+= weight[16];
        if(cur_weight!=0.0){
            mean[5] /= cur_weight;
            sigma[5] /= cur_weight;
        }
        cur_std = sigma[5] - mean[5] * mean[5];
        if(cur_std.r > 1e-10 && cur_std.g > 1e-10 && cur_std.b > 1e-10){
            cur_std = sqrt(cur_std);
        }else{
            cur_std = vec3(1e-10);
        }
        total_ms += mean[5] * pow(cur_std,vec3(-q));
        total_s  += pow(cur_std,vec3(-q));
        mean[6]=vec3(0.0);
        sigma[6]=vec3(0.0);
        cur_weight = 0.0;
        mean[6]  += texture2D(texture, (fc + offset[21]) * Frag).rgb * weight[21];
        sigma[6]  += texture2D(texture, (fc + offset[21]) * Frag).rgb * texture2D(texture, (fc + offset[21]) * Frag).rgb * weight[21];
        cur_weight+= weight[21];
        mean[6]  += texture2D(texture, (fc + offset[28]) * Frag).rgb * weight[28];
        sigma[6]  += texture2D(texture, (fc + offset[28]) * Frag).rgb * texture2D(texture, (fc + offset[28]) * Frag).rgb * weight[28];
        cur_weight+= weight[28];
        mean[6]  += texture2D(texture, (fc + offset[35]) * Frag).rgb * weight[35];
        sigma[6]  += texture2D(texture, (fc + offset[35]) * Frag).rgb * texture2D(texture, (fc + offset[35]) * Frag).rgb * weight[35];
        cur_weight+= weight[35];
        mean[6]  += texture2D(texture, (fc + offset[22]) * Frag).rgb * weight[22];
        sigma[6]  += texture2D(texture, (fc + offset[22]) * Frag).rgb * texture2D(texture, (fc + offset[22]) * Frag).rgb * weight[22];
        cur_weight+= weight[22];
        mean[6]  += texture2D(texture, (fc + offset[29]) * Frag).rgb * weight[29];
        sigma[6]  += texture2D(texture, (fc + offset[29]) * Frag).rgb * texture2D(texture, (fc + offset[29]) * Frag).rgb * weight[29];
        cur_weight+= weight[29];
        mean[6]  += texture2D(texture, (fc + offset[23]) * Frag).rgb * weight[23];
        sigma[6]  += texture2D(texture, (fc + offset[23]) * Frag).rgb * texture2D(texture, (fc + offset[23]) * Frag).rgb * weight[23];
        cur_weight+= weight[23];
        if(cur_weight!=0.0){
            mean[6] /= cur_weight;
            sigma[6] /= cur_weight;
        }
        cur_std = sigma[6] - mean[6] * mean[6];
        if(cur_std.r > 1e-10 && cur_std.g > 1e-10 && cur_std.b > 1e-10){
            cur_std = sqrt(cur_std);
        }else{
            cur_std = vec3(1e-10);
        }
        total_ms += mean[6] * pow(cur_std,vec3(-q));
        total_s  += pow(cur_std,vec3(-q));
        mean[7]=vec3(0.0);
        sigma[7]=vec3(0.0);
        cur_weight = 0.0;
        mean[7]  += texture2D(texture, (fc + offset[42]) * Frag).rgb * weight[42];
        sigma[7]  += texture2D(texture, (fc + offset[42]) * Frag).rgb * texture2D(texture, (fc + offset[42]) * Frag).rgb * weight[42];
        cur_weight+= weight[42];
        mean[7]  += texture2D(texture, (fc + offset[36]) * Frag).rgb * weight[36];
        sigma[7]  += texture2D(texture, (fc + offset[36]) * Frag).rgb * texture2D(texture, (fc + offset[36]) * Frag).rgb * weight[36];
        cur_weight+= weight[36];
        mean[7]  += texture2D(texture, (fc + offset[43]) * Frag).rgb * weight[43];
        sigma[7]  += texture2D(texture, (fc + offset[43]) * Frag).rgb * texture2D(texture, (fc + offset[43]) * Frag).rgb * weight[43];
        cur_weight+= weight[43];
        mean[7]  += texture2D(texture, (fc + offset[30]) * Frag).rgb * weight[30];
        sigma[7]  += texture2D(texture, (fc + offset[30]) * Frag).rgb * texture2D(texture, (fc + offset[30]) * Frag).rgb * weight[30];
        cur_weight+= weight[30];
        mean[7]  += texture2D(texture, (fc + offset[37]) * Frag).rgb * weight[37];
        sigma[7]  += texture2D(texture, (fc + offset[37]) * Frag).rgb * texture2D(texture, (fc + offset[37]) * Frag).rgb * weight[37];
        cur_weight+= weight[37];
        mean[7]  += texture2D(texture, (fc + offset[44]) * Frag).rgb * weight[44];
        sigma[7]  += texture2D(texture, (fc + offset[44]) * Frag).rgb * texture2D(texture, (fc + offset[44]) * Frag).rgb * weight[44];
        cur_weight+= weight[44];
        if(cur_weight!=0.0){
            mean[7] /= cur_weight;
            sigma[7] /= cur_weight;
        }
        cur_std = sigma[7] - mean[7] * mean[7];
        if(cur_std.r > 1e-10 && cur_std.g > 1e-10 && cur_std.b > 1e-10){
            cur_std = sqrt(cur_std);
        }else{
            cur_std = vec3(1e-10);
        }

        total_ms += mean[7] * pow(cur_std,vec3(-q));
        total_s  += pow(cur_std,vec3(-q));

        if(total_s.r> 1e-10 && total_s.g> 1e-10 && total_s.b> 1e-10){
            destColor = (total_ms/total_s).rgb;
            destColor = max(destColor, 0.0);
            destColor = min(destColor, 1.0);
        }else{
            destColor = texture2D(texture, vTexCoord).rgb;
        }

    }else{
        destColor = texture2D(texture, vTexCoord).rgb;
    }

    gl_FragColor = vec4(destColor, 1.0);
}