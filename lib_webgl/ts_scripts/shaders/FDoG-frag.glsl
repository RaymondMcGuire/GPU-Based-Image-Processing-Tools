precision mediump float;

uniform sampler2D src;
uniform sampler2D tfm;

uniform float cvsHeight;
uniform float cvsWidth;

uniform float sigma_m;
uniform float phi;

uniform bool b_FDoG;
varying vec2 vTexCoord;

struct lic_t { 
    vec2 p; 
    vec2 t;
    float w;
    float dw;
};

void step(inout lic_t s) {
    vec2 src_size = vec2(cvsWidth, cvsHeight);
    vec2 t = texture2D(tfm, s.p).xy;
    if (dot(t, s.t) < 0.0) t = -t;
    s.t = t;

    s.dw = (abs(t.x) > abs(t.y))? 
        abs((fract(s.p.x) - 0.5 - sign(t.x)) / t.x) : 
        abs((fract(s.p.y) - 0.5 - sign(t.y)) / t.y);

    s.p += t * s.dw / src_size;
    s.w += s.dw;
}

void main (void) {

    vec3 destColor = vec3(0.0);
    if(b_FDoG){
        vec2 src_size = vec2(cvsWidth, cvsHeight);
        vec2 uv = vec2(gl_FragCoord.x / src_size.x, (src_size.y - gl_FragCoord.y) / src_size.y);

        float twoSigmaMSquared = 2.0 * sigma_m * sigma_m;
        float halfWidth = 2.0 * sigma_m;

        float H = texture2D( src, uv ).x;
        float w = 1.0;

        lic_t a, b;
        a.p = b.p = uv;
        a.t = texture2D( tfm, uv ).xy / src_size;
        b.t = -a.t;
        a.w = b.w = 0.0;

        const int MAX_NUM_ITERATION = 99999;
        for(int i = 0;i<MAX_NUM_ITERATION ;i++){
            if (a.w < halfWidth) {
                step(a);
                float k = a.dw * exp(-a.w * a.w / twoSigmaMSquared);
                H += k * texture2D(src, a.p).x;
                w += k;
            }else{
                break;
            }
        }
        for(int i = 0;i<MAX_NUM_ITERATION ;i++){
            if (b.w < halfWidth) {
                step(b);
                float k = b.dw * exp(-b.w * b.w / twoSigmaMSquared);
                H += k * texture2D(src, b.p).x;
                w += k;
            }else{
                break;
            }
        }
        H /= w;
        float edge = ( H > 0.0 )? 1.0 : 2.0 * smoothstep(-2.0, 2.0, phi * H );
        destColor = vec3(edge);
    }
    else{
        destColor = texture2D(src, vTexCoord).rgb;
    }
    gl_FragColor = vec4(destColor, 1.0);
}