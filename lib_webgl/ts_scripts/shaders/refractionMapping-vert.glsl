attribute vec3 position;
attribute vec3 normal;
attribute vec4 color;
uniform   mat4 mMatrix;
uniform   mat4 mvpMatrix;
varying   vec3 vPosition;
varying   vec3 vNormal;
varying   vec4 vColor;

void main(void){
	vPosition   = (mMatrix * vec4(position, 1.0)).xyz;
	vNormal     = normalize((mMatrix * vec4(normal, 0.0)).xyz);
	vColor      = color;
	gl_Position = mvpMatrix * vec4(position, 1.0);
}