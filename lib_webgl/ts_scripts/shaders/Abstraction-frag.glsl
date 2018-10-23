// by Jan Eric Kyprianidis <www.kyprianidis.com>
precision mediump float;

uniform sampler2D src;
uniform sampler2D akf;
uniform sampler2D fxdog;
uniform vec3 edge_color;

uniform bool b_Abstraction;
uniform float cvsHeight;
uniform float cvsWidth;

void main (void) {
    vec2 src_size = vec2(cvsWidth, cvsHeight);
	vec2 uv = gl_FragCoord.xy / src_size ; 
    vec2 uv_src = vec2(gl_FragCoord.x / src_size.x, (src_size.y - gl_FragCoord.y) / src_size.y);
    if(b_Abstraction){
        vec2 d = 1.0 / src_size;
        vec3 c = texture2D(akf, uv).xyz;
        float e = texture2D(fxdog, uv).x;
        gl_FragColor = vec4(mix(edge_color, c, e), 1.0);
    }else{
        gl_FragColor = texture2D(src, uv_src);
    }
}
