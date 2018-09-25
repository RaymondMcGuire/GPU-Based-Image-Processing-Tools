precision mediump float;

uniform sampler2D texture;

uniform float hCoef[9];
uniform float vCoef[9];
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
    vec3  horizonColor = vec3(0.0);
    vec3  verticalColor = vec3(0.0);
    vec4  destColor = vec4(0.0);
    
    horizonColor  += texture2D(texture, (fc + offset[0]) * tFrag).rgb * hCoef[0];
    horizonColor  += texture2D(texture, (fc + offset[1]) * tFrag).rgb * hCoef[1];
    horizonColor  += texture2D(texture, (fc + offset[2]) * tFrag).rgb * hCoef[2];
    horizonColor  += texture2D(texture, (fc + offset[3]) * tFrag).rgb * hCoef[3];
    horizonColor  += texture2D(texture, (fc + offset[4]) * tFrag).rgb * hCoef[4];
    horizonColor  += texture2D(texture, (fc + offset[5]) * tFrag).rgb * hCoef[5];
    horizonColor  += texture2D(texture, (fc + offset[6]) * tFrag).rgb * hCoef[6];
    horizonColor  += texture2D(texture, (fc + offset[7]) * tFrag).rgb * hCoef[7];
    horizonColor  += texture2D(texture, (fc + offset[8]) * tFrag).rgb * hCoef[8];
    
    verticalColor += texture2D(texture, (fc + offset[0]) * tFrag).rgb * vCoef[0];
    verticalColor += texture2D(texture, (fc + offset[1]) * tFrag).rgb * vCoef[1];
    verticalColor += texture2D(texture, (fc + offset[2]) * tFrag).rgb * vCoef[2];
    verticalColor += texture2D(texture, (fc + offset[3]) * tFrag).rgb * vCoef[3];
    verticalColor += texture2D(texture, (fc + offset[4]) * tFrag).rgb * vCoef[4];
    verticalColor += texture2D(texture, (fc + offset[5]) * tFrag).rgb * vCoef[5];
    verticalColor += texture2D(texture, (fc + offset[6]) * tFrag).rgb * vCoef[6];
    verticalColor += texture2D(texture, (fc + offset[7]) * tFrag).rgb * vCoef[7];
    verticalColor += texture2D(texture, (fc + offset[8]) * tFrag).rgb * vCoef[8];
    
    destColor = vec4(vec3(sqrt(horizonColor * horizonColor + verticalColor * verticalColor)), 1.0);
    gl_FragColor = destColor;
}