precision mediump float;

uniform sampler2D texture;

uniform float coef[9];
varying vec2 vTexCoord;

const float redScale   = 0.298912;
const float greenScale = 0.586611;
const float blueScale  = 0.114478;
const vec3  monochromeScale = vec3(redScale, greenScale, blueScale);

void main(void){
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
    float tFrag = 1.0 / 512.0;
    vec2  fc = vec2(gl_FragCoord.s, 512.0 - gl_FragCoord.t);
    vec3  destColor = vec3(0.0);
    
    destColor  += texture2D(texture, (fc + offset[0]) * tFrag).rgb * coef[0];
    destColor  += texture2D(texture, (fc + offset[1]) * tFrag).rgb * coef[1];
    destColor  += texture2D(texture, (fc + offset[2]) * tFrag).rgb * coef[2];
    destColor  += texture2D(texture, (fc + offset[3]) * tFrag).rgb * coef[3];
    destColor  += texture2D(texture, (fc + offset[4]) * tFrag).rgb * coef[4];
    destColor  += texture2D(texture, (fc + offset[5]) * tFrag).rgb * coef[5];
    destColor  += texture2D(texture, (fc + offset[6]) * tFrag).rgb * coef[6];
    destColor  += texture2D(texture, (fc + offset[7]) * tFrag).rgb * coef[7];
    destColor  += texture2D(texture, (fc + offset[8]) * tFrag).rgb * coef[8];
    
    destColor =max(destColor, 0.0);
    gl_FragColor = vec4(destColor, 1.0);
}