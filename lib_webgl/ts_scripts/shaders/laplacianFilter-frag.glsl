precision mediump float;

uniform sampler2D texture;

uniform bool b_laplacian;
uniform float cvsHeight;
uniform float cvsWidth;
uniform float coef[9];
varying vec2 vTexCoord;

const float redScale   = 0.298912;
const float greenScale = 0.586611;
const float blueScale  = 0.114478;
const vec3  monochromeScale = vec3(redScale, greenScale, blueScale);

void main(void){
    vec3  destColor = vec3(0.0);
    if(b_laplacian){
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
        
        destColor  += texture2D(texture, (fc + offset[0]) * Frag).rgb * coef[0];
        destColor  += texture2D(texture, (fc + offset[1]) * Frag).rgb * coef[1];
        destColor  += texture2D(texture, (fc + offset[2]) * Frag).rgb * coef[2];
        destColor  += texture2D(texture, (fc + offset[3]) * Frag).rgb * coef[3];
        destColor  += texture2D(texture, (fc + offset[4]) * Frag).rgb * coef[4];
        destColor  += texture2D(texture, (fc + offset[5]) * Frag).rgb * coef[5];
        destColor  += texture2D(texture, (fc + offset[6]) * Frag).rgb * coef[6];
        destColor  += texture2D(texture, (fc + offset[7]) * Frag).rgb * coef[7];
        destColor  += texture2D(texture, (fc + offset[8]) * Frag).rgb * coef[8];
        
        destColor =max(destColor, 0.0);
    }else{
        destColor = texture2D(texture, vTexCoord).rgb;
    }

    gl_FragColor = vec4(destColor, 1.0);
}