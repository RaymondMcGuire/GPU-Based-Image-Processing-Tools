precision mediump float;

uniform sampler2D src;

uniform bool b_XDoG;
uniform float cvsHeight;
uniform float cvsWidth;

uniform float sigma;
uniform float k;
uniform float p;
uniform float epsilon;
uniform float phi;
varying vec2 vTexCoord;

float cosh(float val)
{
    float tmp = exp(val);
    float cosH = (tmp + 1.0 / tmp) / 2.0;
    return cosH;
}
 
float tanh(float val)
{
    float tmp = exp(val);
    float tanH = (tmp - 1.0 / tmp) / (tmp + 1.0 / tmp);
    return tanH;
}
 
float sinh(float val)
{
    float tmp = exp(val);
    float sinH = (tmp - 1.0 / tmp) / 2.0;
    return sinH;
}

void main(void){
    vec3 destColor = vec3(0.0);
    if(b_XDoG){
        float tFrag = 1.0 / cvsHeight;
        float sFrag = 1.0 / cvsWidth;
        vec2  Frag = vec2(sFrag,tFrag);
        vec2 uv = vec2(gl_FragCoord.s, cvsHeight - gl_FragCoord.t);
        float twoSigmaESquared = 2.0 * sigma * sigma;
        float twoSigmaRSquared = twoSigmaESquared * k * k;
        int halfWidth = int(ceil( 1.0 * sigma * k ));

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

            norm += kernel;
            sum += kernel * L;
        }
    
        sum /= norm;

        float H = 100.0 * ((1.0 + p) * sum.x - p * sum.y);
        float edge = ( H > epsilon )? 1.0 : 1.0 + tanh( phi * (H - epsilon));
        destColor = vec3(edge);
    }else{
        destColor = texture2D(src, vTexCoord).rgb;
    }
    
    gl_FragColor = vec4(destColor, 1.0);
}