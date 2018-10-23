precision mediump float;

uniform sampler2D src;

uniform bool b_DoG;
uniform float cvsHeight;
uniform float cvsWidth;

uniform float sigma_e;
uniform float sigma_r;
uniform float tau;
uniform float phi;
varying vec2 vTexCoord;

void main(void){
    vec3 destColor = vec3(0.0);
    if(b_DoG){
        float tFrag = 1.0 / cvsHeight;
        float sFrag = 1.0 / cvsWidth;
        vec2  Frag = vec2(sFrag,tFrag);
        vec2 uv = vec2(gl_FragCoord.s, cvsHeight - gl_FragCoord.t);
        float twoSigmaESquared = 2.0 * sigma_e * sigma_e;
        float twoSigmaRSquared = 2.0 * sigma_r * sigma_r;
        int halfWidth = int(ceil( 2.0 * sigma_r ));

        const int MAX_NUM_ITERATION = 99999;
        vec2 sum = vec2(0.0);
        vec2 norm = vec2(0.0);

        for(int cnt=0;cnt<MAX_NUM_ITERATION;cnt++){
            if(cnt > (2*halfWidth+1)*(2*halfWidth+1)){break;}
            int i = int(cnt / (2*halfWidth+1)) - halfWidth;
            int j = cnt - halfWidth - int(cnt / (2*halfWidth+1)) * (2*halfWidth+1);
            
            float d = length(vec2(i,j));
            vec2 kernel = vec2( exp( -d * d / twoSigmaESquared ), 
                                exp( -d * d / twoSigmaRSquared ));
                
            vec2 L = texture2D(src, (uv + vec2(i,j)) * Frag).xx;

            norm += 2.0 * kernel;
            sum += kernel * L;
        }
    
        sum /= norm;

        float H = 100.0 * (sum.x - tau * sum.y);
        float edge = ( H > 0.0 )? 1.0 : 2.0 * smoothstep(-2.0, 2.0, phi * H );
        destColor = vec3(edge);
    }else{
        destColor = texture2D(src, vTexCoord).rgb;
    }
    
    gl_FragColor = vec4(destColor, 1.0);
}