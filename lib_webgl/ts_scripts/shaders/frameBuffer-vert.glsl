attribute vec3 position;
attribute vec3 normal;
attribute vec4 color;
attribute vec2 textureCoord;
uniform   mat4 mMatrix;
uniform   mat4 mvpMatrix;
uniform   mat4 invMatrix;
uniform   vec3 lightDirection;
uniform   bool useLight;
varying   vec4 vColor;
varying   vec2 vTextureCoord;

void main(void){
	if(useLight){
		vec3  invLight = normalize(invMatrix * vec4(lightDirection, 0.0)).xyz;
		float diffuse  = clamp(dot(normal, invLight), 0.2, 1.0);
		vColor         = vec4(color.xyz * vec3(diffuse), 1.0);
	}else{
		vColor         = color;
	}
	vTextureCoord  = textureCoord;
	gl_Position    = mvpMatrix * vec4(position, 1.0);
}