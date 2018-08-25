attribute vec3 position;
attribute vec4 color;
uniform   mat4 mvpMatrix;
uniform   float pointSize;
varying   vec4 vColor;

void main(void){
    vColor        = color;
    gl_Position   = mvpMatrix * vec4(position, 1.0);
    gl_PointSize  = pointSize;
}