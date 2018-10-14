// by Jan Eric Kyprianidis <www.kyprianidis.com>
precision mediump float;

uniform sampler2D src;
uniform sampler2D visual;
uniform bool anisotropic;
uniform float cvsHeight;
uniform float cvsWidth;
varying vec2 vTexCoord;

void main (void) {
	vec2 uv = gl_FragCoord.xy /  vec2(cvsWidth, cvsHeight);
	vec4 t = texture2D( src, uv );

	if(anisotropic){
		gl_FragColor = texture2D(visual, vec2(t.w,0.5));
	}else{
		gl_FragColor = texture2D(src, vTexCoord);
	}
}
