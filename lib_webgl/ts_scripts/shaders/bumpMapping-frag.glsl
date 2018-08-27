precision mediump float;

uniform sampler2D texture;
varying vec4      vColor;
varying vec2      vTextureCoord;
varying vec3      vEyeDirection;
varying vec3      vLightDirection;

void main(void){
	vec3 mNormal    = (texture2D(texture, vTextureCoord) * 2.0 - 1.0).rgb;
	vec3 light      = normalize(vLightDirection);
	vec3 eye        = normalize(vEyeDirection);
	vec3 halfLE     = normalize(light + eye);
	float diffuse   = clamp(dot(mNormal, light), 0.1, 1.0);
	float specular  = pow(clamp(dot(mNormal, halfLE), 0.0, 1.0), 50.0);
	vec4  destColor = vColor * vec4(vec3(diffuse), 1.0) + vec4(vec3(specular), 1.0);
	gl_FragColor    = destColor;
}