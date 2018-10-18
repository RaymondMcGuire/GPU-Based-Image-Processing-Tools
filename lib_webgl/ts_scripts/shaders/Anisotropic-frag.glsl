// by Jan Eric Kyprianidis <www.kyprianidis.com>
precision mediump float;

uniform sampler2D src;
uniform sampler2D tfm;
uniform sampler2D visual;
uniform bool anisotropic;
uniform float cvsHeight;
uniform float cvsWidth;
varying vec2 vTexCoord;

void main (void) {
	vec2 src_size = vec2(cvsWidth, cvsHeight);
	vec2 uv = gl_FragCoord.xy /  src_size;
	vec4 t = texture2D( tfm, uv );
	vec2 src_uv = vec2(gl_FragCoord.x / src_size.x, (src_size.y - gl_FragCoord.y) / src_size.y);
	if(anisotropic){
		gl_FragColor = texture2D(visual, vec2(t.w,0.5));
	}else{
		gl_FragColor = texture2D(src, src_uv);
	}
}
