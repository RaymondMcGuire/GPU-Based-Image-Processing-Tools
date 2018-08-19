attribute vec3 position;
attribute vec4 color;
attribute vec3 normal;

uniform mat4 mvpMatrix;
uniform mat4 invMatrix;

uniform vec3 lightDirection;
uniform vec3 eyeDirection;
uniform vec4 ambientColor;
varying vec4 vColor;

void main(void){
    vec3 invLight = normalize(invMatrix*vec4(lightDirection,0.0)).xyz;
    vec3 invEye = normalize(invMatrix* vec4(eyeDirection,0.0)).xyz;
    vec3 halfLE = normalize(invLight+invEye);

    float diffuse = clamp(dot(invLight,normal),0.0,1.0);
    float specular = pow(clamp(dot(normal,halfLE),0.0,1.0),50.0);
    vec4 light = color*vec4(vec3(diffuse),1.0)+vec4(vec3(specular),1.0);
    vColor = light + ambientColor;
    gl_Position    = mvpMatrix * vec4(position, 1.0);
}