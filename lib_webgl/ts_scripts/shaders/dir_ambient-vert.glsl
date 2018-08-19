attribute vec3 position;
attribute vec4 color;
attribute vec3 normal;

uniform mat4 mvpMatrix;
uniform mat4 invMatrix;
uniform vec3 lightDirection;
uniform vec4 ambientColor;
varying vec4 vColor;

void main(void){
    vec3 invLight = normalize(invMatrix*vec4(lightDirection,0)).xyz;
    float diffuse = clamp(dot(invLight,normal),0.1,1.0);
    vColor = color*vec4(vec3(diffuse),1.0) +ambientColor;
    gl_Position    = mvpMatrix * vec4(position, 1.0);
}