attribute vec3 position;
attribute vec3 normal;
attribute vec4 color;
attribute vec2 textureCoord;
uniform   mat4 mMatrix;
uniform   mat4 mvpMatrix;
uniform   mat4 invMatrix;
uniform   vec3 lightPosition;
uniform   vec3 eyePosition;
varying   vec4 vColor;
varying   vec2 vTextureCoord;
varying   vec3 vEyeDirection;
varying   vec3 vLightDirection;

void main(void){
	vec3 pos      = (mMatrix * vec4(position, 0.0)).xyz;
	vec3 invEye   = (invMatrix * vec4(eyePosition, 0.0)).xyz;
	vec3 invLight = (invMatrix * vec4(lightPosition, 0.0)).xyz;
	vec3 eye      = invEye - pos;
	vec3 light    = invLight - pos;
	vec3 n = normalize(normal);
	vec3 t = normalize(cross(normal, vec3(0.0, 1.0, 0.0)));
	vec3 b = cross(n, t);
	vEyeDirection.x   = dot(t, eye);
	vEyeDirection.y   = dot(b, eye);
	vEyeDirection.z   = dot(n, eye);
	normalize(vEyeDirection);
	vLightDirection.x = dot(t, light);
	vLightDirection.y = dot(b, light);
	vLightDirection.z = dot(n, light);
	normalize(vLightDirection);
	vColor         = color;
	vTextureCoord  = textureCoord;
	gl_Position    = mvpMatrix * vec4(position, 1.0);
}