precision mediump float;

uniform sampler2D texture;

uniform bool b_sobel;
uniform float cvsHeight;
uniform float cvsWidth;
uniform float hCoef[9];
uniform float vCoef[9];
varying vec2 vTexCoord;

void main(void){
    vec3 destColor = vec3(0.0);
    if(b_sobel){
        vec2 offset[9];
        offset[0] = vec2(-1.0, -1.0);
        offset[1] = vec2( 0.0, -1.0);
        offset[2] = vec2( 1.0, -1.0);
        offset[3] = vec2(-1.0,  0.0);
        offset[4] = vec2( 0.0,  0.0);
        offset[5] = vec2( 1.0,  0.0);
        offset[6] = vec2(-1.0,  1.0);
        offset[7] = vec2( 0.0,  1.0);
        offset[8] = vec2( 1.0,  1.0);
        float tFrag = 1.0 / cvsHeight;
        float sFrag = 1.0 / cvsWidth;
        vec2  Frag = vec2(sFrag,tFrag);
        vec2  fc = vec2(gl_FragCoord.s, cvsHeight - gl_FragCoord.t);
        vec3  horizonColor = vec3(0.0);
        vec3  verticalColor = vec3(0.0);

        horizonColor  += texture2D(texture, (fc + offset[0]) * Frag).rgb * hCoef[0];
        horizonColor  += texture2D(texture, (fc + offset[1]) * Frag).rgb * hCoef[1];
        horizonColor  += texture2D(texture, (fc + offset[2]) * Frag).rgb * hCoef[2];
        horizonColor  += texture2D(texture, (fc + offset[3]) * Frag).rgb * hCoef[3];
        horizonColor  += texture2D(texture, (fc + offset[4]) * Frag).rgb * hCoef[4];
        horizonColor  += texture2D(texture, (fc + offset[5]) * Frag).rgb * hCoef[5];
        horizonColor  += texture2D(texture, (fc + offset[6]) * Frag).rgb * hCoef[6];
        horizonColor  += texture2D(texture, (fc + offset[7]) * Frag).rgb * hCoef[7];
        horizonColor  += texture2D(texture, (fc + offset[8]) * Frag).rgb * hCoef[8];
        
        verticalColor += texture2D(texture, (fc + offset[0]) * Frag).rgb * vCoef[0];
        verticalColor += texture2D(texture, (fc + offset[1]) * Frag).rgb * vCoef[1];
        verticalColor += texture2D(texture, (fc + offset[2]) * Frag).rgb * vCoef[2];
        verticalColor += texture2D(texture, (fc + offset[3]) * Frag).rgb * vCoef[3];
        verticalColor += texture2D(texture, (fc + offset[4]) * Frag).rgb * vCoef[4];
        verticalColor += texture2D(texture, (fc + offset[5]) * Frag).rgb * vCoef[5];
        verticalColor += texture2D(texture, (fc + offset[6]) * Frag).rgb * vCoef[6];
        verticalColor += texture2D(texture, (fc + offset[7]) * Frag).rgb * vCoef[7];
        verticalColor += texture2D(texture, (fc + offset[8]) * Frag).rgb * vCoef[8];
        destColor = vec3(sqrt(horizonColor * horizonColor + verticalColor * verticalColor));
    }else{
        destColor = texture2D(texture, vTexCoord).rgb;
    }
    
    gl_FragColor = vec4(destColor, 1.0);
}