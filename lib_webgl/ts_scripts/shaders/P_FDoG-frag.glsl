precision mediump float;

uniform sampler2D src;
uniform sampler2D tfm;

uniform float cvsHeight;
uniform float cvsWidth;

uniform float sigma_e;
uniform float sigma_r;
uniform float tau;

uniform bool b_FDoG;
varying vec2 vTexCoord;

void main(void){

    vec3 destColor = vec3(0.0);
    vec2 src_size = vec2(cvsWidth, cvsHeight);
    vec2 uv = gl_FragCoord.xy /src_size;
    if(b_FDoG){
        float twoSigmaESquared = 2.0 * sigma_e * sigma_e;
        float twoSigmaRSquared = 2.0 * sigma_r * sigma_r;

        vec2 t = texture2D(tfm, uv).xy;
        vec2 n = vec2(t.y, -t.x);
        vec2 nabs = abs(n);
        float ds = 1.0 / ((nabs.x > nabs.y)? nabs.x : nabs.y);
        n /= src_size;

        vec2 sum = texture2D( src, uv ).xx;
        vec2 norm = vec2(1.0, 1.0);

        float halfWidth = 2.0 * sigma_r;
        float d = ds;
        const int MAX_NUM_ITERATION = 99999;
        for(int i = 0;i<MAX_NUM_ITERATION ;i++){

            if( d <= halfWidth) {
                vec2 kernel = vec2( exp( -d * d / twoSigmaESquared ), 
                                    exp( -d * d / twoSigmaRSquared ));
                norm += 2.0 * kernel;

                vec2 L0 = texture2D( src, uv - d*n ).xx;
                vec2 L1 = texture2D( src, uv + d*n ).xx;
                sum += kernel * ( L0 + L1 );
            }else{
                break;
            }
            d+=ds;
        }

        sum /= norm;

        float diff = 100.0 * (sum.x - tau * sum.y);
        destColor= vec3(diff);
    }else{
        destColor = texture2D(src, uv).rgb;
    }
    gl_FragColor = vec4(destColor, 1.0);
}