precision mediump float;

uniform sampler2D texture;
uniform float threshold;
varying vec2 vTexCoord;

const float redScale   = 0.298912;
const float greenScale = 0.586611;
const float blueScale  = 0.114478;
const vec3  monochromeScale = vec3(redScale, greenScale, blueScale);

void main(void){
	
	vec4 smpColor = texture2D(texture, vec2(vTexCoord.s, 1.0 - vTexCoord.t));
	float luminance = dot(smpColor.rgb, monochromeScale);
	if(luminance<threshold){luminance = 0.0;}

	smpColor = vec4(vec3(luminance), 1.0);
	gl_FragColor =smpColor;
}