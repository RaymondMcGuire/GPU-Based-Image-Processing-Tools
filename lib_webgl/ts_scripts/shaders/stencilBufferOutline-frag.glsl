precision mediump float;

uniform sampler2D texture;
uniform bool      useTexture;
varying vec4      vColor;
varying vec2      vTextureCoord;

void main(void){
	vec4 smpColor = vec4(1.0);
	if(useTexture){
		smpColor = texture2D(texture, vTextureCoord);
	}
	gl_FragColor = vColor * smpColor;
}