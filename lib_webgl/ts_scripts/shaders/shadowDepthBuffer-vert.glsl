attribute vec3 position;
uniform mat4 mvpMatrix;

varying vec4 vPosition;

void main(void){
    vPosition = mvpMatrix * vec4(position, 1.0);
    gl_Position = vPosition;
}