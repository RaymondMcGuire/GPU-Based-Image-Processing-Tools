// by Jan Eric Kyprianidis <www.kyprianidis.com>
precision mediump float;

uniform sampler2D src;
uniform sampler2D tfm;

uniform bool b_lic;
uniform float cvsHeight;
uniform float cvsWidth;
uniform float sigma;

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
    vec2 src_size = vec2(cvsWidth, cvsHeight);
    float twoSigma2 = 2.0 * sigma * sigma;
    float halfWidth = 2.0 * sigma;
    vec2 uv = vec2(gl_FragCoord.x / src_size.x, (src_size.y - gl_FragCoord.y) / src_size.y);

    if(b_lic){
        const int MAX_NUM_ITERATION = 99999;
        vec3 c = texture2D( src, uv ).xyz;
        float w = 1.0;

        lic_t a, b;
        a.p = b.p = uv;
        a.t = texture2D( tfm, uv ).xy / src_size;
        b.t = -a.t;
        a.w = b.w = 0.0;

        for(int i = 0;i<MAX_NUM_ITERATION ;i++){
            if (a.w < halfWidth) {
                step(a);
                float k = a.dw * exp(-a.w * a.w / twoSigma2);
                c += k * texture2D(src, a.p).xyz;
                w += k;
            }else{
                break;
            }
        }

        for(int i = 0;i<MAX_NUM_ITERATION ;i++){
            if (b.w < halfWidth) {
                step(b);
                float k = b.dw * exp(-b.w * b.w / twoSigma2);
                c += k * texture2D(src, b.p).xyz;
                w += k;
            }else{
                break;
            }
        }
        
        gl_FragColor = vec4(c / w, 1.0);
    }else{
        gl_FragColor = texture2D(src, uv);
    }
   
}

