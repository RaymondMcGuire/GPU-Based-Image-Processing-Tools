attribute vec3 position;
attribute vec3 normal;
attribute vec4 color;
uniform   mat4 mvpMatrix;
uniform   bool edge;
varying   vec3 vNormal;
varying   vec4 vColor;

void main(void){
	vec3 pos    = position;
	if(edge){
		pos    += normal * 0.05;
	}
	vNormal     = normal;
	vColor      = color;
	gl_Position = mvpMatrix * vec4(pos, 1.0);
}