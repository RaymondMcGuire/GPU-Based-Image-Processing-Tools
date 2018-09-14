precision mediump float;

uniform mat4      invMatrix;
uniform vec3      lightPosition;
uniform sampler2D texture;
varying vec3      vPosition;
varying vec3      vNormal;
varying vec4      vColor;
varying vec4      vTexCoord;

void main(void){
	vec3  light    = lightPosition - vPosition;
	vec3  invLight = normalize(invMatrix * vec4(light, 0.0)).xyz;
	float diffuse  = clamp(dot(vNormal, invLight), 0.1, 1.0);
	vec4  smpColor = texture2DProj(texture, vTexCoord);
	gl_FragColor   = vColor * (0.5 + diffuse) * smpColor;
}