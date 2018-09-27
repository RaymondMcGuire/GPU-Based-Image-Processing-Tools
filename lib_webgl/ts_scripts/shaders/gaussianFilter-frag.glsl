precision mediump float;

uniform sampler2D texture;
uniform float     weight[10];
uniform bool      horizontal;
varying vec2      vTexCoord;

void main(void){
    float tFrag = 1.0 / 512.0;
    vec2  fc;
    vec3  destColor = vec3(0.0);

	if(horizontal){
		fc = vec2(gl_FragCoord.s, 512.0 - gl_FragCoord.t);
		destColor += texture2D(texture, (fc + vec2(-9.0, 0.0)) * tFrag).rgb * weight[9];
		destColor += texture2D(texture, (fc + vec2(-8.0, 0.0)) * tFrag).rgb * weight[8];
		destColor += texture2D(texture, (fc + vec2(-7.0, 0.0)) * tFrag).rgb * weight[7];
		destColor += texture2D(texture, (fc + vec2(-6.0, 0.0)) * tFrag).rgb * weight[6];
		destColor += texture2D(texture, (fc + vec2(-5.0, 0.0)) * tFrag).rgb * weight[5];
		destColor += texture2D(texture, (fc + vec2(-4.0, 0.0)) * tFrag).rgb * weight[4];
		destColor += texture2D(texture, (fc + vec2(-3.0, 0.0)) * tFrag).rgb * weight[3];
		destColor += texture2D(texture, (fc + vec2(-2.0, 0.0)) * tFrag).rgb * weight[2];
		destColor += texture2D(texture, (fc + vec2(-1.0, 0.0)) * tFrag).rgb * weight[1];
		destColor += texture2D(texture, (fc + vec2( 0.0, 0.0)) * tFrag).rgb * weight[0];
		destColor += texture2D(texture, (fc + vec2( 1.0, 0.0)) * tFrag).rgb * weight[1];
		destColor += texture2D(texture, (fc + vec2( 2.0, 0.0)) * tFrag).rgb * weight[2];
		destColor += texture2D(texture, (fc + vec2( 3.0, 0.0)) * tFrag).rgb * weight[3];
		destColor += texture2D(texture, (fc + vec2( 4.0, 0.0)) * tFrag).rgb * weight[4];
		destColor += texture2D(texture, (fc + vec2( 5.0, 0.0)) * tFrag).rgb * weight[5];
		destColor += texture2D(texture, (fc + vec2( 6.0, 0.0)) * tFrag).rgb * weight[6];
		destColor += texture2D(texture, (fc + vec2( 7.0, 0.0)) * tFrag).rgb * weight[7];
		destColor += texture2D(texture, (fc + vec2( 8.0, 0.0)) * tFrag).rgb * weight[8];
		destColor += texture2D(texture, (fc + vec2( 9.0, 0.0)) * tFrag).rgb * weight[9];
	}else{
		fc = gl_FragCoord.st;
		destColor += texture2D(texture, (fc + vec2(0.0, -9.0)) * tFrag).rgb * weight[9];
		destColor += texture2D(texture, (fc + vec2(0.0, -8.0)) * tFrag).rgb * weight[8];
		destColor += texture2D(texture, (fc + vec2(0.0, -7.0)) * tFrag).rgb * weight[7];
		destColor += texture2D(texture, (fc + vec2(0.0, -6.0)) * tFrag).rgb * weight[6];
		destColor += texture2D(texture, (fc + vec2(0.0, -5.0)) * tFrag).rgb * weight[5];
		destColor += texture2D(texture, (fc + vec2(0.0, -4.0)) * tFrag).rgb * weight[4];
		destColor += texture2D(texture, (fc + vec2(0.0, -3.0)) * tFrag).rgb * weight[3];
		destColor += texture2D(texture, (fc + vec2(0.0, -2.0)) * tFrag).rgb * weight[2];
		destColor += texture2D(texture, (fc + vec2(0.0, -1.0)) * tFrag).rgb * weight[1];
		destColor += texture2D(texture, (fc + vec2(0.0,  0.0)) * tFrag).rgb * weight[0];
		destColor += texture2D(texture, (fc + vec2(0.0,  1.0)) * tFrag).rgb * weight[1];
		destColor += texture2D(texture, (fc + vec2(0.0,  2.0)) * tFrag).rgb * weight[2];
		destColor += texture2D(texture, (fc + vec2(0.0,  3.0)) * tFrag).rgb * weight[3];
		destColor += texture2D(texture, (fc + vec2(0.0,  4.0)) * tFrag).rgb * weight[4];
		destColor += texture2D(texture, (fc + vec2(0.0,  5.0)) * tFrag).rgb * weight[5];
		destColor += texture2D(texture, (fc + vec2(0.0,  6.0)) * tFrag).rgb * weight[6];
		destColor += texture2D(texture, (fc + vec2(0.0,  7.0)) * tFrag).rgb * weight[7];
		destColor += texture2D(texture, (fc + vec2(0.0,  8.0)) * tFrag).rgb * weight[8];
		destColor += texture2D(texture, (fc + vec2(0.0,  9.0)) * tFrag).rgb * weight[9];
	}
    
    gl_FragColor = vec4(destColor, 1.0);
}