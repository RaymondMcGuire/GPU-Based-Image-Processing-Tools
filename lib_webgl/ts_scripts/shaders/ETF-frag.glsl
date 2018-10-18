// Edge Tangent Flow
precision mediump float;

uniform sampler2D src;
uniform float cvsHeight;
uniform float cvsWidth;

void main (void) {
    vec2 src_size = vec2(cvsWidth, cvsHeight);
    vec2 uv = gl_FragCoord.xy / src_size;
    vec2 d = 1.0 / src_size;
    vec3 c = texture2D(src, uv).xyz;
    float gx = c.z;
    vec2 tx = c.xy;
    const float kERNEL = 5.0;
    vec2 etf = vec2(0.0);
    vec2 sum = vec2(0,0);
    float weight = 0.0;
    for(float j = -kERNEL ; j<kERNEL;j++){
        for(float i=-kERNEL ; i<kERNEL;i++){
            vec2 ty = texture2D(src, uv + vec2(i * d.x, j * d.y)).xy;
            float wd = dot(tx,ty);
            float gy = texture2D(src, uv + vec2(i * d.x, j * d.y)).z;
            float wm = (gy - gx + 1.0)/2.0;

            sum += ty * (wm * wd);
            weight += wm * wd;
        }
    }

    if(weight != 0.0){
        etf = sum / weight;
    }
    
    float mag = sqrt(etf.x*etf.x + etf.y*etf.y);
    float vx = etf.x/mag;
    float vy = etf.y/mag;
    gl_FragColor = vec4(vx,vy,mag, 1.0);
}
