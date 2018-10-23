// Tangent Field
precision mediump float;

uniform sampler2D src;
uniform float cvsHeight;
uniform float cvsWidth;
uniform float hCoef[9];
uniform float vCoef[9];

const float redScale   = 0.298912;
const float greenScale = 0.586611;
const float blueScale  = 0.114478;
const vec3  monochromeScale = vec3(redScale, greenScale, blueScale);

void main (void) {
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
    vec2  uv = vec2(gl_FragCoord.s, gl_FragCoord.t);
    float  horizonColor = 0.0;
    float  verticalColor = 0.0;

    horizonColor  += dot(texture2D(src, (uv + offset[0]) * Frag).rgb, monochromeScale) * hCoef[0];
    horizonColor  += dot(texture2D(src, (uv + offset[1]) * Frag).rgb, monochromeScale) * hCoef[1];
    horizonColor  += dot(texture2D(src, (uv + offset[2]) * Frag).rgb, monochromeScale) * hCoef[2];
    horizonColor  += dot(texture2D(src, (uv + offset[3]) * Frag).rgb, monochromeScale) * hCoef[3];
    horizonColor  += dot(texture2D(src, (uv + offset[4]) * Frag).rgb, monochromeScale) * hCoef[4];
    horizonColor  += dot(texture2D(src, (uv + offset[5]) * Frag).rgb, monochromeScale) * hCoef[5];
    horizonColor  += dot(texture2D(src, (uv + offset[6]) * Frag).rgb, monochromeScale) * hCoef[6];
    horizonColor  += dot(texture2D(src, (uv + offset[7]) * Frag).rgb, monochromeScale) * hCoef[7];
    horizonColor  += dot(texture2D(src, (uv + offset[8]) * Frag).rgb, monochromeScale) * hCoef[8];
    
    verticalColor += dot(texture2D(src, (uv + offset[0]) * Frag).rgb, monochromeScale) * vCoef[0];
    verticalColor += dot(texture2D(src, (uv + offset[1]) * Frag).rgb, monochromeScale) * vCoef[1];
    verticalColor += dot(texture2D(src, (uv + offset[2]) * Frag).rgb, monochromeScale) * vCoef[2];
    verticalColor += dot(texture2D(src, (uv + offset[3]) * Frag).rgb, monochromeScale) * vCoef[3];
    verticalColor += dot(texture2D(src, (uv + offset[4]) * Frag).rgb, monochromeScale) * vCoef[4];
    verticalColor += dot(texture2D(src, (uv + offset[5]) * Frag).rgb, monochromeScale) * vCoef[5];
    verticalColor += dot(texture2D(src, (uv + offset[6]) * Frag).rgb, monochromeScale) * vCoef[6];
    verticalColor += dot(texture2D(src, (uv + offset[7]) * Frag).rgb, monochromeScale) * vCoef[7];
    verticalColor += dot(texture2D(src, (uv + offset[8]) * Frag).rgb, monochromeScale) * vCoef[8];

    float mag = sqrt(horizonColor * horizonColor + verticalColor * verticalColor);
    float vx = verticalColor/mag;
    float vy = horizonColor/mag;

    gl_FragColor = vec4(vx, vy, mag, 1.0);
}
