attribute vec3 position;
attribute vec4 color;
attribute vec3 normal;

uniform mat4 mvpMatrix;

varying vec4 vColor;
varying vec3 vNormal;

void main(void){
    vNormal = normal;
    vColor = color;
    gl_Position    = mvpMatrix * vec4(position, 1.0);
}