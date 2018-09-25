precision mediump float;

uniform sampler2D texture;
uniform bool      grayScale;
varying vec2      vTexCoord;

const float redScale   = 0.298912;
const float greenScale = 0.586611;
const float blueScale  = 0.114478;
const vec3  monochromeScale = vec3(redScale, greenScale, blueScale);

void main(void){
	vec4 smpColor = texture2D(texture, vTexCoord);
	if(grayScale){
		float grayColor = dot(smpColor.rgb, monochromeScale);
		smpColor = vec4(vec3(grayColor), 1.0);
	}
	gl_FragColor = smpColor;
}