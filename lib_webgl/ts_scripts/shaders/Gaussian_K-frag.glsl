// by Jan Eric Kyprianidis <www.kyprianidis.com>
precision mediump float;

uniform sampler2D src;
uniform float sigma;
uniform float cvsHeight;
uniform float cvsWidth;

void main (void) {
    vec2 src_size = vec2(cvsWidth, cvsHeight);
    vec2 uv = gl_FragCoord.xy / src_size;
    
    float twoSigma2 = 2.0 * 2.0 * 2.0;
    const int halfWidth = 4;//int(ceil( 2.0 * sigma ));

    vec3 sum = vec3(0.0);
    float norm = 0.0;
    for ( int i = -halfWidth; i <= halfWidth; ++i ) {
        for ( int j = -halfWidth; j <= halfWidth; ++j ) {
            float d = length(vec2(i,j));
            float kernel = exp( -d *d / twoSigma2 );
            vec3 c = texture2D(src, uv + vec2(i,j) / src_size ).rgb;
            sum += kernel * c;
            norm += kernel;
        }
    }
    gl_FragColor = vec4(sum / norm, 1.0);
}
