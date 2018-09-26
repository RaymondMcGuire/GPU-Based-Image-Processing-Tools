attribute vec3 position;
attribute vec3 normal;
attribute vec4 color;
uniform   mat4 mMatrix;
uniform   mat4 mvpMatrix;
uniform   mat4 tMatrix;
uniform   mat4 lgtMatrix;
varying   vec3 vPosition;
varying   vec3 vNormal;
varying   vec4 vColor;
varying   vec4 vTexCoord;
varying   vec4 vDepth;

void main(void){
    vPosition   = (mMatrix * vec4(position, 1.0)).xyz;
    vNormal     = normal;
    vColor      = color;
    vTexCoord   = tMatrix * vec4(vPosition, 1.0);
    vDepth      = lgtMatrix * vec4(position, 1.0);
    gl_Position = mvpMatrix * vec4(position, 1.0);
}