precision mediump float;

uniform vec3        eyePosition;
uniform sampler2D   normalMap;
uniform samplerCube cubeTexture;
uniform bool        reflection;
varying vec3        vPosition;
varying vec2        vTextureCoord;
varying vec3        vNormal;
varying vec3        tTangent;

varying vec4        vColor;

//reflect = I - 2.0 * dot(N, I) * N.
vec3 egt_reflect(vec3 p, vec3 n){
  return  p - 2.0* dot(n,p) * n;
}

void main(void){
	vec3 tBinormal = cross(vNormal, tTangent);
	mat3 mView     = mat3(tTangent, tBinormal, vNormal);
	vec3 mNormal   = mView * (texture2D(normalMap, vTextureCoord) * 2.0 - 1.0).rgb;
	vec3 ref;
	if(reflection){
		ref = reflect(vPosition - eyePosition, mNormal);
        //ref = egt_reflect(normalize(vPosition - eyePosition),normalize(vNormal));
	}else{
		ref = vNormal;
	}
	vec4 envColor  = textureCube(cubeTexture, ref);
	vec4 destColor = vColor * envColor;
	gl_FragColor   = destColor;
}