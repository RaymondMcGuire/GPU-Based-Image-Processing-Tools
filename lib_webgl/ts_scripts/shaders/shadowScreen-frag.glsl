precision mediump float;

uniform mat4      invMatrix;
uniform vec3      lightPosition;
uniform sampler2D texture;
uniform bool      depthBuffer;
varying vec3      vPosition;
varying vec3      vNormal;
varying vec4      vColor;
varying vec4      vTexCoord;
varying vec4      vDepth;

float restDepth(vec4 RGBA){
    const float rMask = 1.0;
    const float gMask = 1.0 / 255.0;
    const float bMask = 1.0 / (255.0 * 255.0);
    const float aMask = 1.0 / (255.0 * 255.0 * 255.0);
    float depth = dot(RGBA, vec4(rMask, gMask, bMask, aMask));
    return depth;
}

void main(void){
    vec3  light     = lightPosition - vPosition;
    vec3  invLight  = normalize(invMatrix * vec4(light, 0.0)).xyz;
    float diffuse   = clamp(dot(vNormal, invLight), 0.1, 1.0);
    float shadow    = restDepth(texture2DProj(texture, vTexCoord));
    vec4 depthColor = vec4(1.0);
    if(vDepth.w > 0.0){
        if(depthBuffer){
            vec4 lightCoord = vDepth / vDepth.w;
            if(lightCoord.z - 0.0001 > shadow){
                depthColor  = vec4(0.5, 0.5, 0.5, 1.0);
            }
        }else{
            float near = 0.1;
            float far  = 150.0;
            float linerDepth = 1.0 / (far - near);
            linerDepth *= length(vPosition.xyz - lightPosition);
            if(linerDepth - 0.0001 > shadow){
                depthColor  = vec4(0.5, 0.5, 0.5, 1.0);
            }
        }
    }
    gl_FragColor = vColor * (vec3(diffuse),1.0) * depthColor;
}