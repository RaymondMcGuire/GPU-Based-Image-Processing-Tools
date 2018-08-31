precision mediump float;

uniform vec3        eyePosition;
uniform samplerCube cubeTexture;
uniform bool        refraction;
varying vec3        vPosition;
varying vec3        vNormal;
varying vec4        vColor;

//reflact calculation TODO
//vec3 egt_refract(vec3 p, vec3 n,float eta){
//}

void main(void){
	vec3 ref;
	if(refraction){
		ref = refract(normalize(vPosition - eyePosition), vNormal,0.6);
	}else{
		ref = vNormal;
	}
	vec4 envColor  = textureCube(cubeTexture, ref);
	vec4 destColor = vColor * envColor;
	gl_FragColor   = destColor;
}