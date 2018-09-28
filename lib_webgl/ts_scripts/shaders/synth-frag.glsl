precision mediump float;

uniform sampler2D texture1;
uniform sampler2D texture2;
uniform bool      glare;
varying vec2      vTexCoord;

void main(void){
	vec4  destColor = texture2D(texture1, vTexCoord);
	vec4  smpColor  = texture2D(texture2, vec2(vTexCoord.s, 1.0 - vTexCoord.t));
	if(glare){
		destColor += smpColor * 2.0;
	}
	gl_FragColor = destColor;
}