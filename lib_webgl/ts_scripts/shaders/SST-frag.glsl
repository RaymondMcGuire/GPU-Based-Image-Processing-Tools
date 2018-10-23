// by Jan Eric Kyprianidis <www.kyprianidis.com>
precision mediump float;

uniform sampler2D src;
uniform float cvsHeight;
uniform float cvsWidth;

void main (void) {
    vec2 src_size = vec2(cvsWidth, cvsHeight);
    vec2 uv = gl_FragCoord.xy / src_size;
    vec2 d = 1.0 / src_size;
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
