// by Jan Eric Kyprianidis <www.kyprianidis.com>
precision mediump float;

uniform sampler2D src;
uniform float cvsHeight;
uniform float cvsWidth;

const float redScale   = 0.298912;
const float greenScale = 0.586611;
const float blueScale  = 0.114478;
const vec3  monochromeScale = vec3(redScale, greenScale, blueScale);

void main (void) {
    vec2 src_size = vec2(cvsWidth, cvsHeight);
    vec2 uv = vec2(gl_FragCoord.x / src_size.x, (src_size.y - gl_FragCoord.y) / src_size.y);
    vec2 d = 1.0 / src_size;
    vec3 c = texture2D(src, uv).xyz;

    vec3 u = (
        -1.0 * texture2D(src, uv + vec2(-d.x, -d.y)).xyz +
        -2.0 * texture2D(src, uv + vec2(-d.x,  0.0)).xyz + 
        -1.0 * texture2D(src, uv + vec2(-d.x,  d.y)).xyz +
        +1.0 * texture2D(src, uv + vec2( d.x, -d.y)).xyz +
        +2.0 * texture2D(src, uv + vec2( d.x,  0.0)).xyz + 
        +1.0 * texture2D(src, uv + vec2( d.x,  d.y)).xyz
        ) / 4.0;

    vec3 v = (
           -1.0 * texture2D(src, uv + vec2(-d.x, -d.y)).xyz + 
           -2.0 * texture2D(src, uv + vec2( 0.0, -d.y)).xyz + 
           -1.0 * texture2D(src, uv + vec2( d.x, -d.y)).xyz +
           +1.0 * texture2D(src, uv + vec2(-d.x,  d.y)).xyz +
           +2.0 * texture2D(src, uv + vec2( 0.0,  d.y)).xyz + 
           +1.0 * texture2D(src, uv + vec2( d.x,  d.y)).xyz
           ) / 4.0;

    gl_FragColor = vec4(dot(u, u), dot(v, v), dot(u, v), 1.0);
}
