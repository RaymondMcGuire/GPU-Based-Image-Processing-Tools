var Shaders = {
    'AKF-frag':
        '// by Jan Eric Kyprianidis <www.kyprianidis.com>\n'                               +
        'precision mediump float;\n\n'                                                     +

        'uniform sampler2D src;\n'                                                         +
        'uniform sampler2D k0;\n'                                                          +
        'uniform sampler2D tfm;\n'                                                         +
        'uniform float radius;\n'                                                          +
        'uniform float q;\n'                                                               +
        'uniform float alpha;\n\n'                                                         +

        'uniform bool anisotropic;\n'                                                      +
        'uniform float cvsHeight;\n'                                                       +
        'uniform float cvsWidth;\n\n'                                                      +

        'const float PI = 3.14159265358979323846;\n'                                       +
        'const int N = 8;\n\n'                                                             +

        'void main (void) {\n'                                                             +
        '    vec2 src_size = vec2(cvsWidth, cvsHeight);\n'                                 +
        '    vec2 uv = gl_FragCoord.xy / src_size;\n'                                      +
        '	vec2 src_uv = vec2(gl_FragCoord.x / src_size.x, (src_size.y - gl_FragCoord.y) /' +
                                                                       ' src_size.y);\n\n' +

        '    if(anisotropic){\n'                                                           +
        '        vec4 m[8];\n'                                                             +
        '        vec3 s[8];\n'                                                             +
        '        for (int k = 0; k < N; ++k) {\n'                                          +
        '            m[k] = vec4(0.0);\n'                                                  +
        '            s[k] = vec3(0.0);\n'                                                  +
        '        }\n\n'                                                                    +

        '        float piN = 2.0 * PI / float(N);\n'                                       +
        '        mat2 X = mat2(cos(piN), sin(piN), -sin(piN), cos(piN));\n\n'              +

        '        vec4 t = texture2D(tfm, uv);\n'                                           +
        '        float a = radius * clamp((alpha + t.w) / alpha, 0.1, 2.0); \n'            +
        '        float b = radius * clamp(alpha / (alpha + t.w), 0.1, 2.0);\n\n'           +

        '        float cos_phi = cos(t.z);\n'                                              +
        '        float sin_phi = sin(t.z);\n\n'                                            +

        '        mat2 R = mat2(cos_phi, -sin_phi, sin_phi, cos_phi);\n'                    +
        '        mat2 S = mat2(0.5/a, 0.0, 0.0, 0.5/b);\n'                                 +
        '        mat2 SR = S * R;\n\n'                                                     +

        '        // int max_x = int(sqrt(a*a * cos_phi*cos_phi +\n'                        +
        '        //                     b*b * sin_phi*sin_phi));\n'                        +
        '        // int max_y = int(sqrt(a*a * sin_phi*sin_phi +\n'                        +
        '        //                     b*b * cos_phi*cos_phi));\n\n'                      +

        '        // const int MAX_ITERATIONS = 100;\n'                                     +
        '        // int numBreak = (2*max_x+1) * (2*max_y+1);\n\n'                         +

        '        // for (int i = 0; i <= MAX_ITERATIONS; i += 1) {\n'                      +
        '        //     if(i>=numBreak){break;}\n\n'                                       +

        '        //     int i_idx = (i - (int(i / (max_x*2+1)))*(max_x*2+1)) - max_x;\n'   +
        '        //     int j_idx = (int(i / (max_x*2+1))) - max_y;\n'                     +
        '        //     vec2 v = SR * vec2(i_idx,j_idx);\n\n'                              +

        '        //     float lim = 0.25*255.0;\n'                                         +
        '        //     if (dot(v,v) <= lim) {\n'                                          +
        '        //     vec4 c_fix = texture2D(src, src_uv + vec2(i_idx,j_idx) / src_size' +
                                                                                  ');\n'   +
        '        //     vec3 c = c_fix.rgb;\n'                                             +
        '        //     for (int k = 0; k < N; ++k) {\n'                                   +
        '        //         float w = texture2D(k0, vec2(0.5, 0.5) + v).x;\n\n'            +

        '        //         m[k] += vec4(c * w, w);\n'                                     +
        '        //         s[k] += c * c * w;\n\n'                                        +

        '        //         v *= X;\n'                                                     +
        '        //         }\n'                                                           +
        '        //     }\n'                                                               +
        '        // }\n\n'                                                                 +

        '        const int max_x = 8;\n'                                                   +
        '        const int max_y = 8;\n\n'                                                 +

        '        for (int j = -max_y; j <= max_y; ++j) {\n'                                +
        '            for (int i = -max_x; i <= max_x; ++i) {\n'                            +
        '                vec2 v = SR * vec2(i,j);\n'                                       +
        '                if (dot(v,v) <= 0.25) {\n'                                        +
        '                vec4 c_fix = texture2D(src, src_uv + vec2(i,j) / src_size);\n'    +
        '                vec3 c = c_fix.rgb;\n'                                            +
        '                for (int k = 0; k < N; ++k) {\n'                                  +
        '                    float w = texture2D(k0, vec2(0.5, 0.5) + v).x;\n\n'           +

        '                    m[k] += vec4(c * w, w);\n'                                    +
        '                    s[k] += c * c * w;\n\n'                                       +

        '                    v *= X;\n'                                                    +
        '                    }\n'                                                          +
        '                }\n'                                                              +
        '            }\n'                                                                  +
        '        }\n\n'                                                                    +

        '        vec4 o = vec4(0.0);\n'                                                    +
        '        for (int k = 0; k < N; ++k) {\n'                                          +
        '            m[k].rgb /= m[k].w;\n'                                                +
        '            s[k] = abs(s[k] / m[k].w - m[k].rgb * m[k].rgb);\n\n'                 +

        '            float sigma2 = s[k].r + s[k].g + s[k].b;\n'                           +
        '            float w = 1.0 / (1.0 + pow(255.0 * sigma2, 0.5 * q));\n\n'            +

        '            o += vec4(m[k].rgb * w, w);\n'                                        +
        '        }\n\n'                                                                    +

        '        gl_FragColor = vec4(o.rgb / o.w, 1.0);\n'                                 +
        '    }else{\n'                                                                     +
        '        gl_FragColor = texture2D(src, src_uv);\n'                                 +
        '    }\n\n'                                                                        +

        '}\n',

    'AKF-vert':
        'attribute vec3 position;\n'                        +
        'attribute vec2 texCoord;\n'                        +
        'uniform   mat4 mvpMatrix;\n'                       +
        'varying   vec2 vTexCoord;\n\n'                     +

        'void main(void){\n'                                +
        '	vTexCoord   = texCoord;\n'                        +
        '	gl_Position = mvpMatrix * vec4(position, 1.0);\n' +
        '}\n',

    'Anisotropic-frag':
        '// by Jan Eric Kyprianidis <www.kyprianidis.com>\n'         +
        'precision mediump float;\n\n'                               +

        'uniform sampler2D src;\n'                                   +
        'uniform sampler2D visual;\n'                                +
        'uniform bool anisotropic;\n'                                +
        'uniform float cvsHeight;\n'                                 +
        'uniform float cvsWidth;\n'                                  +
        'varying vec2 vTexCoord;\n\n'                                +

        'void main (void) {\n'                                       +
        '	vec2 uv = gl_FragCoord.xy /  vec2(cvsWidth, cvsHeight);\n' +
        '	vec4 t = texture2D( src, uv );\n\n'                        +

        '	if(anisotropic){\n'                                        +
        '		gl_FragColor = texture2D(visual, vec2(t.w,0.5));\n'       +
        '	}else{\n'                                                  +
        '		gl_FragColor = texture2D(src, vTexCoord);\n'              +
        '	}\n'                                                       +
        '}\n',

    'Anisotropic-vert':
        'attribute vec3 position;\n'                        +
        'attribute vec2 texCoord;\n'                        +
        'uniform   mat4 mvpMatrix;\n'                       +
        'varying   vec2 vTexCoord;\n\n'                     +

        'void main(void){\n'                                +
        '	vTexCoord   = texCoord;\n'                        +
        '	gl_Position = mvpMatrix * vec4(position, 1.0);\n' +
        '}\n',

    'blurEffect-frag':
        'precision mediump float;\n\n'                                                     +

        'uniform sampler2D texture;\n'                                                     +
        'varying vec4      vColor;\n\n'                                                    +

        'void main(void){\n'                                                               +
        '	vec2 tFrag = vec2(1.0 / 512.0);\n'                                               +
        '	vec4 destColor = texture2D(texture, gl_FragCoord.st * tFrag);\n'                 +
        '	destColor *= 0.36;\n'                                                            +
        '	destColor += texture2D(texture, (gl_FragCoord.st + vec2(-1.0,  1.0)) * tFrag) *' +
                                                                              ' 0.04;\n'   +
        '	destColor += texture2D(texture, (gl_FragCoord.st + vec2( 0.0,  1.0)) * tFrag) *' +
                                                                              ' 0.04;\n'   +
        '	destColor += texture2D(texture, (gl_FragCoord.st + vec2( 1.0,  1.0)) * tFrag) *' +
                                                                              ' 0.04;\n'   +
        '	destColor += texture2D(texture, (gl_FragCoord.st + vec2(-1.0,  0.0)) * tFrag) *' +
                                                                              ' 0.04;\n'   +
        '	destColor += texture2D(texture, (gl_FragCoord.st + vec2( 1.0,  0.0)) * tFrag) *' +
                                                                              ' 0.04;\n'   +
        '	destColor += texture2D(texture, (gl_FragCoord.st + vec2(-1.0, -1.0)) * tFrag) *' +
                                                                              ' 0.04;\n'   +
        '	destColor += texture2D(texture, (gl_FragCoord.st + vec2( 0.0, -1.0)) * tFrag) *' +
                                                                              ' 0.04;\n'   +
        '	destColor += texture2D(texture, (gl_FragCoord.st + vec2( 1.0, -1.0)) * tFrag) *' +
                                                                              ' 0.04;\n'   +
        '	destColor += texture2D(texture, (gl_FragCoord.st + vec2(-2.0,  2.0)) * tFrag) *' +
                                                                              ' 0.02;\n'   +
        '	destColor += texture2D(texture, (gl_FragCoord.st + vec2(-1.0,  2.0)) * tFrag) *' +
                                                                              ' 0.02;\n'   +
        '	destColor += texture2D(texture, (gl_FragCoord.st + vec2( 0.0,  2.0)) * tFrag) *' +
                                                                              ' 0.02;\n'   +
        '	destColor += texture2D(texture, (gl_FragCoord.st + vec2( 1.0,  2.0)) * tFrag) *' +
                                                                              ' 0.02;\n'   +
        '	destColor += texture2D(texture, (gl_FragCoord.st + vec2( 2.0,  2.0)) * tFrag) *' +
                                                                              ' 0.02;\n'   +
        '	destColor += texture2D(texture, (gl_FragCoord.st + vec2(-2.0,  1.0)) * tFrag) *' +
                                                                              ' 0.02;\n'   +
        '	destColor += texture2D(texture, (gl_FragCoord.st + vec2( 2.0,  1.0)) * tFrag) *' +
                                                                              ' 0.02;\n'   +
        '	destColor += texture2D(texture, (gl_FragCoord.st + vec2(-2.0,  0.0)) * tFrag) *' +
                                                                              ' 0.02;\n'   +
        '	destColor += texture2D(texture, (gl_FragCoord.st + vec2( 2.0,  0.0)) * tFrag) *' +
                                                                              ' 0.02;\n'   +
        '	destColor += texture2D(texture, (gl_FragCoord.st + vec2(-2.0, -1.0)) * tFrag) *' +
                                                                              ' 0.02;\n'   +
        '	destColor += texture2D(texture, (gl_FragCoord.st + vec2( 2.0, -1.0)) * tFrag) *' +
                                                                              ' 0.02;\n'   +
        '	destColor += texture2D(texture, (gl_FragCoord.st + vec2(-2.0, -2.0)) * tFrag) *' +
                                                                              ' 0.02;\n'   +
        '	destColor += texture2D(texture, (gl_FragCoord.st + vec2(-1.0, -2.0)) * tFrag) *' +
                                                                              ' 0.02;\n'   +
        '	destColor += texture2D(texture, (gl_FragCoord.st + vec2( 0.0, -2.0)) * tFrag) *' +
                                                                              ' 0.02;\n'   +
        '	destColor += texture2D(texture, (gl_FragCoord.st + vec2( 1.0, -2.0)) * tFrag) *' +
                                                                              ' 0.02;\n'   +
        '	destColor += texture2D(texture, (gl_FragCoord.st + vec2( 2.0, -2.0)) * tFrag) *' +
                                                                              ' 0.02;\n\n' +

        '	gl_FragColor = vColor * destColor;\n'                                            +
        '}\n',

    'blurEffect-vert':
        'attribute vec3 position;\n'                        +
        'attribute vec4 color;\n'                           +
        'uniform   mat4 mvpMatrix;\n'                       +
        'varying   vec4 vColor;\n\n'                        +

        'void main(void){\n'                                +
        '	vColor      = color;\n'                           +
        '	gl_Position = mvpMatrix * vec4(position, 1.0);\n' +
        '}\n',

    'bumpMapping-frag':
        'precision mediump float;\n\n'                                                     +

        'uniform sampler2D texture;\n'                                                     +
        'varying vec4      vColor;\n'                                                      +
        'varying vec2      vTextureCoord;\n'                                               +
        'varying vec3      vEyeDirection;\n'                                               +
        'varying vec3      vLightDirection;\n\n'                                           +

        'void main(void){\n'                                                               +
        '	vec3 mNormal    = (texture2D(texture, vTextureCoord) * 2.0 - 1.0).rgb;\n'        +
        '	vec3 light      = normalize(vLightDirection);\n'                                 +
        '	vec3 eye        = normalize(vEyeDirection);\n'                                   +
        '	vec3 halfLE     = normalize(light + eye);\n'                                     +
        '	float diffuse   = clamp(dot(mNormal, light), 0.1, 1.0);\n'                       +
        '	float specular  = pow(clamp(dot(mNormal, halfLE), 0.0, 1.0), 50.0);\n'           +
        '	vec4  destColor = vColor * vec4(vec3(diffuse), 1.0) + vec4(vec3(specular), 1.0)' +
                                                                                   ';\n'   +
        '	gl_FragColor    = destColor;\n'                                                  +
        '}\n',

    'bumpMapping-vert':
        'attribute vec3 position;\n'                                     +
        'attribute vec3 normal;\n'                                       +
        'attribute vec4 color;\n'                                        +
        'attribute vec2 textureCoord;\n'                                 +
        'uniform   mat4 mMatrix;\n'                                      +
        'uniform   mat4 mvpMatrix;\n'                                    +
        'uniform   mat4 invMatrix;\n'                                    +
        'uniform   vec3 lightPosition;\n'                                +
        'uniform   vec3 eyePosition;\n'                                  +
        'varying   vec4 vColor;\n'                                       +
        'varying   vec2 vTextureCoord;\n'                                +
        'varying   vec3 vEyeDirection;\n'                                +
        'varying   vec3 vLightDirection;\n\n'                            +

        'void main(void){\n'                                             +
        '	vec3 pos      = (mMatrix * vec4(position, 0.0)).xyz;\n'        +
        '	vec3 invEye   = (invMatrix * vec4(eyePosition, 0.0)).xyz;\n'   +
        '	vec3 invLight = (invMatrix * vec4(lightPosition, 0.0)).xyz;\n' +
        '	vec3 eye      = invEye - pos;\n'                               +
        '	vec3 light    = invLight - pos;\n'                             +
        '	vec3 n = normalize(normal);\n'                                 +
        '	vec3 t = normalize(cross(normal, vec3(0.0, 1.0, 0.0)));\n'     +
        '	vec3 b = cross(n, t);\n'                                       +
        '	vEyeDirection.x   = dot(t, eye);\n'                            +
        '	vEyeDirection.y   = dot(b, eye);\n'                            +
        '	vEyeDirection.z   = dot(n, eye);\n'                            +
        '	normalize(vEyeDirection);\n'                                   +
        '	vLightDirection.x = dot(t, light);\n'                          +
        '	vLightDirection.y = dot(b, light);\n'                          +
        '	vLightDirection.z = dot(n, light);\n'                          +
        '	normalize(vLightDirection);\n'                                 +
        '	vColor         = color;\n'                                     +
        '	vTextureCoord  = textureCoord;\n'                              +
        '	gl_Position    = mvpMatrix * vec4(position, 1.0);\n'           +
        '}\n',

    'cubeTexBumpMapping-frag':
        'precision mediump float;\n\n'                                                       +

        'uniform vec3        eyePosition;\n'                                                 +
        'uniform sampler2D   normalMap;\n'                                                   +
        'uniform samplerCube cubeTexture;\n'                                                 +
        'uniform bool        reflection;\n'                                                  +
        'varying vec3        vPosition;\n'                                                   +
        'varying vec2        vTextureCoord;\n'                                               +
        'varying vec3        vNormal;\n'                                                     +
        'varying vec3        tTangent;\n\n'                                                  +

        'varying vec4        vColor;\n\n'                                                    +

        '//reflect = I - 2.0 * dot(N, I) * N.\n'                                             +
        'vec3 egt_reflect(vec3 p, vec3 n){\n'                                                +
        '  return  p - 2.0* dot(n,p) * n;\n'                                                 +
        '}\n\n'                                                                              +

        'void main(void){\n'                                                                 +
        '	vec3 tBinormal = cross(vNormal, tTangent);\n'                                      +
        '	mat3 mView     = mat3(tTangent, tBinormal, vNormal);\n'                            +
        '	vec3 mNormal   = mView * (texture2D(normalMap, vTextureCoord) * 2.0 - 1.0).rgb;\n' +
        '	vec3 ref;\n'                                                                       +
        '	if(reflection){\n'                                                                 +
        '		ref = reflect(vPosition - eyePosition, mNormal);\n'                               +
        '        //ref = egt_reflect(normalize(vPosition - eyePosition),normalize(vNormal'   +
                                                                                 '));\n'     +
        '	}else{\n'                                                                          +
        '		ref = vNormal;\n'                                                                 +
        '	}\n'                                                                               +
        '	vec4 envColor  = textureCube(cubeTexture, ref);\n'                                 +
        '	vec4 destColor = vColor * envColor;\n'                                             +
        '	gl_FragColor   = destColor;\n'                                                     +
        '}\n',

    'cubeTexBumpMapping-vert':
        'attribute vec3 position;\n'                              +
        'attribute vec3 normal;\n'                                +
        'attribute vec4 color;\n'                                 +
        'attribute vec2 textureCoord;\n\n'                        +

        'uniform   mat4 mMatrix;\n'                               +
        'uniform   mat4 mvpMatrix;\n'                             +
        'varying   vec3 vPosition;\n'                             +
        'varying   vec2 vTextureCoord;\n'                         +
        'varying   vec3 vNormal;\n'                               +
        'varying   vec4 vColor;\n'                                +
        'varying   vec3 tTangent;\n\n'                            +

        'void main(void){\n'                                      +
        '	vPosition   = (mMatrix * vec4(position, 1.0)).xyz;\n'   +
        '	vNormal     = (mMatrix * vec4(normal, 0.0)).xyz;\n'     +
        '	vTextureCoord = textureCoord;\n'                        +
        '	vColor      = color;\n'                                 +
        '	tTangent      = cross(vNormal, vec3(0.0, 1.0, 0.0));\n' +
        '	gl_Position = mvpMatrix * vec4(position, 1.0);\n'       +
        '}\n',

    'cubeTexMapping-frag':
        'precision mediump float;\n\n'                                                     +

        'uniform vec3        eyePosition;\n'                                               +
        'uniform samplerCube cubeTexture;\n'                                               +
        'uniform bool        reflection;\n'                                                +
        'varying vec3        vPosition;\n'                                                 +
        'varying vec3        vNormal;\n'                                                   +
        'varying vec4        vColor;\n\n'                                                  +

        '//reflect = I - 2.0 * dot(N, I) * N.\n'                                           +
        'vec3 egt_reflect(vec3 p, vec3 n){\n'                                              +
        '  return  p - 2.0* dot(n,p) * n;\n'                                               +
        '}\n\n'                                                                            +

        'void main(void){\n'                                                               +
        '	vec3 ref;\n'                                                                     +
        '	if(reflection){\n'                                                               +
        '		ref = reflect(vPosition - eyePosition, vNormal);\n'                             +
        '        //ref = egt_reflect(normalize(vPosition - eyePosition),normalize(vNormal' +
                                                                                 '));\n'   +
        '	}else{\n'                                                                        +
        '		ref = vNormal;\n'                                                               +
        '	}\n'                                                                             +
        '	vec4 envColor  = textureCube(cubeTexture, ref);\n'                               +
        '	vec4 destColor = vColor * envColor;\n'                                           +
        '	gl_FragColor   = destColor;\n'                                                   +
        '}\n',

    'cubeTexMapping-vert':
        'attribute vec3 position;\n'                            +
        'attribute vec3 normal;\n'                              +
        'attribute vec4 color;\n'                               +
        'uniform   mat4 mMatrix;\n'                             +
        'uniform   mat4 mvpMatrix;\n'                           +
        'varying   vec3 vPosition;\n'                           +
        'varying   vec3 vNormal;\n'                             +
        'varying   vec4 vColor;\n\n'                            +

        'void main(void){\n'                                    +
        '	vPosition   = (mMatrix * vec4(position, 1.0)).xyz;\n' +
        '	vNormal     = (mMatrix * vec4(normal, 0.0)).xyz;\n'   +
        '	vColor      = color;\n'                               +
        '	gl_Position = mvpMatrix * vec4(position, 1.0);\n'     +
        '}\n',

    'demo-frag':
        'void main(void){\n'                          +
        '	gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);\n' +
        '}\n',

    'demo-vert':
        'attribute vec3 position;\n'                        +
        'uniform   mat4 mvpMatrix;\n\n'                     +

        'void main(void){\n'                                +
        '	gl_Position = mvpMatrix * vec4(position, 1.0);\n' +
        '}\n',

    'demo1-frag':
        'precision mediump float;\n' +
        'varying vec4 vColor;\n\n'   +

        'void main(void){\n'         +
        '	gl_FragColor = vColor;\n'  +
        '}\n',

    'demo1-vert':
        'attribute vec3 position;\n'                        +
        'attribute vec4 color;\n'                           +
        'uniform   mat4 mvpMatrix;\n'                       +
        'varying vec4 vColor;\n\n'                          +

        'void main(void){\n'                                +
        '	vColor = color;\n'                                +
        '	gl_Position = mvpMatrix * vec4(position, 1.0);\n' +
        '}\n',

    'directionLighting-frag':
        'precision mediump float;\n\n' +

        'varying vec4 vColor;\n\n'     +

        'void main(void){\n'           +
        '	gl_FragColor = vColor;\n'    +
        '}\n',

    'directionLighting-vert':
        'attribute vec3 position;\n'                                             +
        'attribute vec4 color;\n'                                                +
        'attribute vec3 normal;\n\n'                                             +

        'uniform mat4 mvpMatrix;\n'                                              +
        'uniform mat4 invMatrix;\n'                                              +
        'uniform vec3 lightDirection;\n'                                         +
        'varying vec4 vColor;\n\n'                                               +

        'void main(void){\n'                                                     +
        '    vec3 invLight = normalize(invMatrix*vec4(lightDirection,0)).xyz;\n' +
        '    float diffuse = clamp(dot(invLight,normal),0.1,1.0);\n'             +
        '    vColor = color*vec4(vec3(diffuse),1.0);\n'                          +
        '    gl_Position    = mvpMatrix * vec4(position, 1.0);\n'                +
        '}\n',

    'dir_ambient-frag':
        'precision mediump float;\n\n' +

        'varying vec4 vColor;\n\n'     +

        'void main(void){\n'           +
        '	gl_FragColor = vColor;\n'    +
        '}\n',

    'dir_ambient-vert':
        'attribute vec3 position;\n'                                             +
        'attribute vec4 color;\n'                                                +
        'attribute vec3 normal;\n\n'                                             +

        'uniform mat4 mvpMatrix;\n'                                              +
        'uniform mat4 invMatrix;\n'                                              +
        'uniform vec3 lightDirection;\n'                                         +
        'uniform vec4 ambientColor;\n'                                           +
        'varying vec4 vColor;\n\n'                                               +

        'void main(void){\n'                                                     +
        '    vec3 invLight = normalize(invMatrix*vec4(lightDirection,0)).xyz;\n' +
        '    float diffuse = clamp(dot(invLight,normal),0.1,1.0);\n'             +
        '    vColor = color*vec4(vec3(diffuse),1.0) +ambientColor;\n'            +
        '    gl_Position    = mvpMatrix * vec4(position, 1.0);\n'                +
        '}\n',

    'filterScene-frag':
        'precision mediump float;\n\n' +

        'varying vec4 vColor;\n\n'     +

        'void main(void){\n'           +
        '	gl_FragColor = vColor;\n'    +
        '}\n',

    'filterScene-vert':
        'attribute vec3 position;\n'                                                      +
        'attribute vec3 normal;\n'                                                        +
        'attribute vec4 color;\n'                                                         +
        'uniform   mat4 mvpMatrix;\n'                                                     +
        'uniform   mat4 invMatrix;\n'                                                     +
        'uniform   vec3 lightDirection;\n'                                                +
        'uniform   vec3 eyeDirection;\n'                                                  +
        'uniform   vec4 ambientColor;\n'                                                  +
        'varying   vec4 vColor;\n\n'                                                      +

        'void main(void){\n'                                                              +
        '	vec3  invLight = normalize(invMatrix * vec4(lightDirection, 0.0)).xyz;\n'       +
        '	vec3  invEye   = normalize(invMatrix * vec4(eyeDirection, 0.0)).xyz;\n'         +
        '	vec3  halfLE   = normalize(invLight + invEye);\n'                               +
        '	float diffuse  = clamp(dot(normal, invLight), 0.0, 1.0);\n'                     +
        '	float specular = pow(clamp(dot(normal, halfLE), 0.0, 1.0), 50.0);\n'            +
        '	vec4  amb      = color * ambientColor;\n'                                       +
        '	vColor         = amb * vec4(vec3(diffuse), 1.0) + vec4(vec3(specular), 1.0);\n' +
        '	gl_Position    = mvpMatrix * vec4(position, 1.0);\n'                            +
        '}\n',

    'frameBuffer-frag':
        'precision mediump float;\n\n'                          +

        'uniform sampler2D texture;\n'                          +
        'varying vec4      vColor;\n'                           +
        'varying vec2      vTextureCoord;\n\n'                  +

        'void main(void){\n'                                    +
        '	vec4 smpColor = texture2D(texture, vTextureCoord);\n' +
        '	gl_FragColor  = vColor * smpColor;\n'                 +
        '}\n',

    'frameBuffer-vert':
        'attribute vec3 position;\n'                                                 +
        'attribute vec3 normal;\n'                                                   +
        'attribute vec4 color;\n'                                                    +
        'attribute vec2 textureCoord;\n'                                             +
        'uniform   mat4 mMatrix;\n'                                                  +
        'uniform   mat4 mvpMatrix;\n'                                                +
        'uniform   mat4 invMatrix;\n'                                                +
        'uniform   vec3 lightDirection;\n'                                           +
        'uniform   bool useLight;\n'                                                 +
        'varying   vec4 vColor;\n'                                                   +
        'varying   vec2 vTextureCoord;\n\n'                                          +

        'void main(void){\n'                                                         +
        '	if(useLight){\n'                                                           +
        '		vec3  invLight = normalize(invMatrix * vec4(lightDirection, 0.0)).xyz;\n' +
        '		float diffuse  = clamp(dot(normal, invLight), 0.2, 1.0);\n'               +
        '		vColor         = vec4(color.xyz * vec3(diffuse), 1.0);\n'                 +
        '	}else{\n'                                                                  +
        '		vColor         = color;\n'                                                +
        '	}\n'                                                                       +
        '	vTextureCoord  = textureCoord;\n'                                          +
        '	gl_Position    = mvpMatrix * vec4(position, 1.0);\n'                       +
        '}\n',

    'Gaussian-frag':
        '// by Jan Eric Kyprianidis <www.kyprianidis.com>\n'                     +
        'precision mediump float;\n\n'                                           +

        'uniform sampler2D src;\n'                                               +
        'uniform float sigma;\n'                                                 +
        'uniform float cvsHeight;\n'                                             +
        'uniform float cvsWidth;\n\n'                                            +

        'void main (void) {\n'                                                   +
        '    vec2 src_size = vec2(cvsWidth, cvsHeight);\n'                       +
        '    vec2 uv = gl_FragCoord.xy / src_size;\n\n'                          +

        '    float twoSigma2 = 2.0 * 2.0 * 2.0;\n'                               +
        '    const int halfWidth = 4;//int(ceil( 2.0 * sigma ));\n\n'            +

        '    vec3 sum = vec3(0.0);\n'                                            +
        '    float norm = 0.0;\n'                                                +
        '    for ( int i = -halfWidth; i <= halfWidth; ++i ) {\n'                +
        '        for ( int j = -halfWidth; j <= halfWidth; ++j ) {\n'            +
        '            float d = length(vec2(i,j));\n'                             +
        '            float kernel = exp( -d *d / twoSigma2 );\n'                 +
        '            vec3 c = texture2D(src, uv + vec2(i,j) / src_size ).rgb;\n' +
        '            sum += kernel * c;\n'                                       +
        '            norm += kernel;\n'                                          +
        '        }\n'                                                            +
        '    }\n'                                                                +
        '    gl_FragColor = vec4(sum / norm, 1.0);\n'                            +
        '}\n',

    'Gaussian-vert':
        'attribute vec3 position;\n'                        +
        'attribute vec2 texCoord;\n'                        +
        'uniform   mat4 mvpMatrix;\n'                       +
        'varying   vec2 vTexCoord;\n\n'                     +

        'void main(void){\n'                                +
        '	vTexCoord   = texCoord;\n'                        +
        '	gl_Position = mvpMatrix * vec4(position, 1.0);\n' +
        '}\n',

    'gaussianFilter-frag':
        'precision mediump float;\n\n'                                                     +

        'uniform sampler2D texture;\n'                                                     +
        'uniform bool b_gaussian;\n'                                                       +
        'uniform float cvsHeight;\n'                                                       +
        'uniform float cvsWidth;\n'                                                        +
        'uniform float weight[10];\n'                                                      +
        'uniform bool horizontal;\n'                                                       +
        'varying vec2 vTexCoord;\n\n'                                                      +

        'void main(void){\n'                                                               +
        '    vec3  destColor = vec3(0.0);\n'                                               +
        '	if(b_gaussian){\n'                                                               +
        '		float tFrag = 1.0 / cvsHeight;\n'                                               +
        '		float sFrag = 1.0 / cvsWidth;\n'                                                +
        '		vec2  Frag = vec2(sFrag,tFrag);\n'                                              +
        '		vec2 fc;\n'                                                                     +
        '		if(horizontal){\n'                                                              +
        '			fc = vec2(gl_FragCoord.s, cvsHeight - gl_FragCoord.t);\n'                      +
        '			destColor += texture2D(texture, (fc + vec2(-9.0, 0.0)) * Frag).rgb * weight[9' +
                                                                                  '];\n'   +
        '			destColor += texture2D(texture, (fc + vec2(-8.0, 0.0)) * Frag).rgb * weight[8' +
                                                                                  '];\n'   +
        '			destColor += texture2D(texture, (fc + vec2(-7.0, 0.0)) * Frag).rgb * weight[7' +
                                                                                  '];\n'   +
        '			destColor += texture2D(texture, (fc + vec2(-6.0, 0.0)) * Frag).rgb * weight[6' +
                                                                                  '];\n'   +
        '			destColor += texture2D(texture, (fc + vec2(-5.0, 0.0)) * Frag).rgb * weight[5' +
                                                                                  '];\n'   +
        '			destColor += texture2D(texture, (fc + vec2(-4.0, 0.0)) * Frag).rgb * weight[4' +
                                                                                  '];\n'   +
        '			destColor += texture2D(texture, (fc + vec2(-3.0, 0.0)) * Frag).rgb * weight[3' +
                                                                                  '];\n'   +
        '			destColor += texture2D(texture, (fc + vec2(-2.0, 0.0)) * Frag).rgb * weight[2' +
                                                                                  '];\n'   +
        '			destColor += texture2D(texture, (fc + vec2(-1.0, 0.0)) * Frag).rgb * weight[1' +
                                                                                  '];\n'   +
        '			destColor += texture2D(texture, (fc + vec2( 0.0, 0.0)) * Frag).rgb * weight[0' +
                                                                                  '];\n'   +
        '			destColor += texture2D(texture, (fc + vec2( 1.0, 0.0)) * Frag).rgb * weight[1' +
                                                                                  '];\n'   +
        '			destColor += texture2D(texture, (fc + vec2( 2.0, 0.0)) * Frag).rgb * weight[2' +
                                                                                  '];\n'   +
        '			destColor += texture2D(texture, (fc + vec2( 3.0, 0.0)) * Frag).rgb * weight[3' +
                                                                                  '];\n'   +
        '			destColor += texture2D(texture, (fc + vec2( 4.0, 0.0)) * Frag).rgb * weight[4' +
                                                                                  '];\n'   +
        '			destColor += texture2D(texture, (fc + vec2( 5.0, 0.0)) * Frag).rgb * weight[5' +
                                                                                  '];\n'   +
        '			destColor += texture2D(texture, (fc + vec2( 6.0, 0.0)) * Frag).rgb * weight[6' +
                                                                                  '];\n'   +
        '			destColor += texture2D(texture, (fc + vec2( 7.0, 0.0)) * Frag).rgb * weight[7' +
                                                                                  '];\n'   +
        '			destColor += texture2D(texture, (fc + vec2( 8.0, 0.0)) * Frag).rgb * weight[8' +
                                                                                  '];\n'   +
        '			destColor += texture2D(texture, (fc + vec2( 9.0, 0.0)) * Frag).rgb * weight[9' +
                                                                                  '];\n'   +
        '		}else{\n'                                                                       +
        '			fc = gl_FragCoord.st;\n'                                                       +
        '			destColor += texture2D(texture, (fc + vec2(0.0, -9.0)) * Frag).rgb * weight[9' +
                                                                                  '];\n'   +
        '			destColor += texture2D(texture, (fc + vec2(0.0, -8.0)) * Frag).rgb * weight[8' +
                                                                                  '];\n'   +
        '			destColor += texture2D(texture, (fc + vec2(0.0, -7.0)) * Frag).rgb * weight[7' +
                                                                                  '];\n'   +
        '			destColor += texture2D(texture, (fc + vec2(0.0, -6.0)) * Frag).rgb * weight[6' +
                                                                                  '];\n'   +
        '			destColor += texture2D(texture, (fc + vec2(0.0, -5.0)) * Frag).rgb * weight[5' +
                                                                                  '];\n'   +
        '			destColor += texture2D(texture, (fc + vec2(0.0, -4.0)) * Frag).rgb * weight[4' +
                                                                                  '];\n'   +
        '			destColor += texture2D(texture, (fc + vec2(0.0, -3.0)) * Frag).rgb * weight[3' +
                                                                                  '];\n'   +
        '			destColor += texture2D(texture, (fc + vec2(0.0, -2.0)) * Frag).rgb * weight[2' +
                                                                                  '];\n'   +
        '			destColor += texture2D(texture, (fc + vec2(0.0, -1.0)) * Frag).rgb * weight[1' +
                                                                                  '];\n'   +
        '			destColor += texture2D(texture, (fc + vec2(0.0,  0.0)) * Frag).rgb * weight[0' +
                                                                                  '];\n'   +
        '			destColor += texture2D(texture, (fc + vec2(0.0,  1.0)) * Frag).rgb * weight[1' +
                                                                                  '];\n'   +
        '			destColor += texture2D(texture, (fc + vec2(0.0,  2.0)) * Frag).rgb * weight[2' +
                                                                                  '];\n'   +
        '			destColor += texture2D(texture, (fc + vec2(0.0,  3.0)) * Frag).rgb * weight[3' +
                                                                                  '];\n'   +
        '			destColor += texture2D(texture, (fc + vec2(0.0,  4.0)) * Frag).rgb * weight[4' +
                                                                                  '];\n'   +
        '			destColor += texture2D(texture, (fc + vec2(0.0,  5.0)) * Frag).rgb * weight[5' +
                                                                                  '];\n'   +
        '			destColor += texture2D(texture, (fc + vec2(0.0,  6.0)) * Frag).rgb * weight[6' +
                                                                                  '];\n'   +
        '			destColor += texture2D(texture, (fc + vec2(0.0,  7.0)) * Frag).rgb * weight[7' +
                                                                                  '];\n'   +
        '			destColor += texture2D(texture, (fc + vec2(0.0,  8.0)) * Frag).rgb * weight[8' +
                                                                                  '];\n'   +
        '			destColor += texture2D(texture, (fc + vec2(0.0,  9.0)) * Frag).rgb * weight[9' +
                                                                                  '];\n'   +
        '		}\n'                                                                            +
        '	}else{\n'                                                                        +
        ' 		destColor = texture2D(texture, vTexCoord).rgb;\n'                              +
        '	}\n'                                                                             +
        '    gl_FragColor = vec4(destColor, 1.0);\n'                                       +
        '}\n',

    'gaussianFilter-vert':
        'attribute vec3 position;\n'                        +
        'attribute vec2 texCoord;\n'                        +
        'uniform   mat4 mvpMatrix;\n'                       +
        'varying   vec2 vTexCoord;\n\n'                     +

        'void main(void){\n'                                +
        '	vTexCoord   = texCoord;\n'                        +
        '	gl_Position = mvpMatrix * vec4(position, 1.0);\n' +
        '}\n',

    'gkuwaharaFilter-frag':
        'precision mediump float;\n\n'                                                       +

        'uniform sampler2D texture;\n\n'                                                     +

        'uniform float weight[49];\n'                                                        +
        'uniform bool b_gkuwahara;\n'                                                        +
        'uniform float cvsHeight;\n'                                                         +
        'uniform float cvsWidth;\n'                                                          +
        'varying vec2 vTexCoord;\n\n'                                                        +

        'void main(void){\n'                                                                 +
        '    vec3  destColor = vec3(0.0);\n'                                                 +
        '    if(b_gkuwahara){\n'                                                             +
        '        float q = 3.0;\n'                                                           +
        '        vec3 mean[8];\n'                                                            +
        '        vec3 sigma[8];\n'                                                           +
        '        vec2 offset[49];\n'                                                         +
        '        offset[0] = vec2(-3.0, -3.0);\n'                                            +
        '        offset[1] = vec2(-2.0, -3.0);\n'                                            +
        '        offset[2] = vec2(-1.0, -3.0);\n'                                            +
        '        offset[3] = vec2( 0.0, -3.0);\n'                                            +
        '        offset[4] = vec2( 1.0, -3.0);\n'                                            +
        '        offset[5] = vec2( 2.0, -3.0);\n'                                            +
        '        offset[6] = vec2( 3.0, -3.0);\n\n'                                          +

        '        offset[7]  = vec2(-3.0, -2.0);\n'                                           +
        '        offset[8]  = vec2(-2.0, -2.0);\n'                                           +
        '        offset[9]  = vec2(-1.0, -2.0);\n'                                           +
        '        offset[10] = vec2( 0.0, -2.0);\n'                                           +
        '        offset[11] = vec2( 1.0, -2.0);\n'                                           +
        '        offset[12] = vec2( 2.0, -2.0);\n'                                           +
        '        offset[13] = vec2( 3.0, -2.0);\n\n'                                         +

        '        offset[14] = vec2(-3.0, -1.0);\n'                                           +
        '        offset[15] = vec2(-2.0, -1.0);\n'                                           +
        '        offset[16] = vec2(-1.0, -1.0);\n'                                           +
        '        offset[17] = vec2( 0.0, -1.0);\n'                                           +
        '        offset[18] = vec2( 1.0, -1.0);\n'                                           +
        '        offset[19] = vec2( 2.0, -1.0);\n'                                           +
        '        offset[20] = vec2( 3.0, -1.0);\n\n'                                         +

        '        offset[21] = vec2(-3.0,  0.0);\n'                                           +
        '        offset[22] = vec2(-2.0,  0.0);\n'                                           +
        '        offset[23] = vec2(-1.0,  0.0);\n'                                           +
        '        offset[24] = vec2( 0.0,  0.0);\n'                                           +
        '        offset[25] = vec2( 1.0,  0.0);\n'                                           +
        '        offset[26] = vec2( 2.0,  0.0);\n'                                           +
        '        offset[27] = vec2( 3.0,  0.0);\n\n'                                         +

        '        offset[28] = vec2(-3.0,  1.0);\n'                                           +
        '        offset[29] = vec2(-2.0,  1.0);\n'                                           +
        '        offset[30] = vec2(-1.0,  1.0);\n'                                           +
        '        offset[31] = vec2( 0.0,  1.0);\n'                                           +
        '        offset[32] = vec2( 1.0,  1.0);\n'                                           +
        '        offset[33] = vec2( 2.0,  1.0);\n'                                           +
        '        offset[34] = vec2( 3.0,  1.0);\n\n'                                         +

        '        offset[35] = vec2(-3.0,  2.0);\n'                                           +
        '        offset[36] = vec2(-2.0,  2.0);\n'                                           +
        '        offset[37] = vec2(-1.0,  2.0);\n'                                           +
        '        offset[38] = vec2( 0.0,  2.0);\n'                                           +
        '        offset[39] = vec2( 1.0,  2.0);\n'                                           +
        '        offset[40] = vec2( 2.0,  2.0);\n'                                           +
        '        offset[41] = vec2( 3.0,  2.0);\n\n'                                         +

        '        offset[42] = vec2(-3.0,  3.0);\n'                                           +
        '        offset[43] = vec2(-2.0,  3.0);\n'                                           +
        '        offset[44] = vec2(-1.0,  3.0);\n'                                           +
        '        offset[45] = vec2( 0.0,  3.0);\n'                                           +
        '        offset[46] = vec2( 1.0,  3.0);\n'                                           +
        '        offset[47] = vec2( 2.0,  3.0);\n'                                           +
        '        offset[48] = vec2( 3.0,  3.0);\n\n'                                         +

        '        float tFrag = 1.0 / cvsHeight;\n'                                           +
        '        float sFrag = 1.0 / cvsWidth;\n'                                            +
        '        vec2  Frag = vec2(sFrag,tFrag);\n'                                          +
        '        vec2  fc = vec2(gl_FragCoord.s, cvsHeight - gl_FragCoord.t);\n'             +
        '        vec3 cur_std = vec3(0.0);\n'                                                +
        '        float cur_weight = 0.0;\n'                                                  +
        '        vec3 total_ms = vec3(0.0);\n'                                               +
        '        vec3 total_s = vec3(0.0);\n\n'                                              +

        '        mean[0]=vec3(0.0);\n'                                                       +
        '        sigma[0]=vec3(0.0);\n'                                                      +
        '        cur_weight = 0.0;\n'                                                        +
        '        mean[0]  += texture2D(texture, (fc + offset[24]) * Frag).rgb * weight[24'   +
                                                                                  '];\n'     +
        '        sigma[0]  += texture2D(texture, (fc + offset[24]) * Frag).rgb * texture2'   +
                              'D(texture, (fc + offset[24]) * Frag).rgb * weight[24];\n'     +
        '        cur_weight+= weight[24];\n'                                                 +
        '        mean[0]  += texture2D(texture, (fc + offset[31]) * Frag).rgb * weight[31'   +
                                                                                  '];\n'     +
        '        sigma[0]  += texture2D(texture, (fc + offset[31]) * Frag).rgb * texture2'   +
                              'D(texture, (fc + offset[31]) * Frag).rgb * weight[31];\n'     +
        '        cur_weight+= weight[31];\n'                                                 +
        '        mean[0]  += texture2D(texture, (fc + offset[38]) * Frag).rgb * weight[38'   +
                                                                                  '];\n'     +
        '        sigma[0]  += texture2D(texture, (fc + offset[38]) * Frag).rgb * texture2'   +
                              'D(texture, (fc + offset[38]) * Frag).rgb * weight[38];\n'     +
        '        cur_weight+= weight[38];\n'                                                 +
        '        mean[0]  += texture2D(texture, (fc + offset[45]) * Frag).rgb * weight[45'   +
                                                                                  '];\n'     +
        '        sigma[0]  += texture2D(texture, (fc + offset[45]) * Frag).rgb * texture2'   +
                              'D(texture, (fc + offset[45]) * Frag).rgb * weight[45];\n'     +
        '        cur_weight+= weight[45];\n'                                                 +
        '        mean[0]  += texture2D(texture, (fc + offset[39]) * Frag).rgb * weight[39'   +
                                                                                  '];\n'     +
        '        sigma[0]  += texture2D(texture, (fc + offset[39]) * Frag).rgb * texture2'   +
                              'D(texture, (fc + offset[39]) * Frag).rgb * weight[39];\n'     +
        '        cur_weight+= weight[39];\n'                                                 +
        '        mean[0]  += texture2D(texture, (fc + offset[46]) * Frag).rgb * weight[46'   +
                                                                                  '];\n'     +
        '        sigma[0]  += texture2D(texture, (fc + offset[46]) * Frag).rgb * texture2'   +
                              'D(texture, (fc + offset[46]) * Frag).rgb * weight[46];\n'     +
        '        cur_weight+= weight[46];\n'                                                 +
        '        mean[0]  += texture2D(texture, (fc + offset[47]) * Frag).rgb * weight[47'   +
                                                                                  '];\n'     +
        '        sigma[0]  += texture2D(texture, (fc + offset[47]) * Frag).rgb * texture2'   +
                              'D(texture, (fc + offset[47]) * Frag).rgb * weight[47];\n'     +
        '        cur_weight+= weight[47];\n\n'                                               +

        '        if(cur_weight!=0.0){\n'                                                     +
        '            mean[0] /= cur_weight;\n'                                               +
        '            sigma[0] /= cur_weight;\n'                                              +
        '        }\n\n'                                                                      +

        '        cur_std = sigma[0] - mean[0] * mean[0];\n'                                  +
        '        if(cur_std.r > 1e-10 && cur_std.g > 1e-10 && cur_std.b > 1e-10){\n'         +
        '            cur_std = sqrt(cur_std);\n'                                             +
        '        }else{\n'                                                                   +
        '            cur_std = vec3(1e-10);\n'                                               +
        '        }\n'                                                                        +
        '        total_ms += mean[0] * pow(cur_std,vec3(-q));\n'                             +
        '        total_s  += pow(cur_std,vec3(-q));\n'                                       +
        '        mean[1]=vec3(0.0);\n'                                                       +
        '        sigma[1]=vec3(0.0);\n'                                                      +
        '        cur_weight = 0.0;\n'                                                        +
        '        mean[1]  += texture2D(texture, (fc + offset[32]) * Frag).rgb * weight[32'   +
                                                                                  '];\n'     +
        '        sigma[1]  += texture2D(texture, (fc + offset[32]) * Frag).rgb * texture2'   +
                              'D(texture, (fc + offset[32]) * Frag).rgb * weight[32];\n'     +
        '        cur_weight+= weight[32];\n'                                                 +
        '        mean[1]  += texture2D(texture, (fc + offset[33]) * Frag).rgb * weight[33'   +
                                                                                  '];\n'     +
        '        sigma[1]  += texture2D(texture, (fc + offset[33]) * Frag).rgb * texture2'   +
                              'D(texture, (fc + offset[33]) * Frag).rgb * weight[33];\n'     +
        '        cur_weight+= weight[33];\n'                                                 +
        '        mean[1]  += texture2D(texture, (fc + offset[40]) * Frag).rgb * weight[40'   +
                                                                                  '];\n'     +
        '        sigma[1]  += texture2D(texture, (fc + offset[40]) * Frag).rgb * texture2'   +
                              'D(texture, (fc + offset[40]) * Frag).rgb * weight[40];\n'     +
        '        cur_weight+= weight[40];\n'                                                 +
        '        mean[1]  += texture2D(texture, (fc + offset[34]) * Frag).rgb * weight[34'   +
                                                                                  '];\n'     +
        '        sigma[1]  += texture2D(texture, (fc + offset[34]) * Frag).rgb * texture2'   +
                              'D(texture, (fc + offset[34]) * Frag).rgb * weight[34];\n'     +
        '        cur_weight+= weight[34];\n'                                                 +
        '        mean[1]  += texture2D(texture, (fc + offset[41]) * Frag).rgb * weight[41'   +
                                                                                  '];\n'     +
        '        sigma[1]  += texture2D(texture, (fc + offset[41]) * Frag).rgb * texture2'   +
                              'D(texture, (fc + offset[41]) * Frag).rgb * weight[41];\n'     +
        '        cur_weight+= weight[41];\n'                                                 +
        '        mean[1]  += texture2D(texture, (fc + offset[48]) * Frag).rgb * weight[48'   +
                                                                                  '];\n'     +
        '        sigma[1]  += texture2D(texture, (fc + offset[48]) * Frag).rgb * texture2'   +
                              'D(texture, (fc + offset[48]) * Frag).rgb * weight[48];\n'     +
        '        cur_weight+= weight[48];\n\n'                                               +

        '        if(cur_weight!=0.0){\n'                                                     +
        '            mean[1] /= cur_weight;\n'                                               +
        '            sigma[1] /= cur_weight;\n'                                              +
        '        }\n\n'                                                                      +

        '        cur_std = sigma[1] - mean[1] * mean[1];\n'                                  +
        '        if(cur_std.r > 1e-10 && cur_std.g > 1e-10 && cur_std.b > 1e-10){\n'         +
        '            cur_std = sqrt(cur_std);\n'                                             +
        '        }else{\n'                                                                   +
        '            cur_std = vec3(1e-10);\n'                                               +
        '        }\n'                                                                        +
        '        total_ms += mean[1] * pow(cur_std,vec3(-q));\n'                             +
        '        total_s  += pow(cur_std,vec3(-q));\n'                                       +
        '        mean[2]=vec3(0.0);\n'                                                       +
        '        sigma[2]=vec3(0.0);\n'                                                      +
        '        cur_weight = 0.0;\n'                                                        +
        '        mean[2]  += texture2D(texture, (fc + offset[25]) * Frag).rgb * weight[25'   +
                                                                                  '];\n'     +
        '        sigma[2]  += texture2D(texture, (fc + offset[25]) * Frag).rgb * texture2'   +
                              'D(texture, (fc + offset[25]) * Frag).rgb * weight[25];\n'     +
        '        cur_weight+= weight[25];\n'                                                 +
        '        mean[2]  += texture2D(texture, (fc + offset[19]) * Frag).rgb * weight[19'   +
                                                                                  '];\n'     +
        '        sigma[2]  += texture2D(texture, (fc + offset[19]) * Frag).rgb * texture2'   +
                              'D(texture, (fc + offset[19]) * Frag).rgb * weight[19];\n'     +
        '        cur_weight+= weight[19];\n'                                                 +
        '        mean[2]  += texture2D(texture, (fc + offset[26]) * Frag).rgb * weight[26'   +
                                                                                  '];\n'     +
        '        sigma[2]  += texture2D(texture, (fc + offset[26]) * Frag).rgb * texture2'   +
                              'D(texture, (fc + offset[26]) * Frag).rgb * weight[26];\n'     +
        '        cur_weight+= weight[26];\n'                                                 +
        '        mean[2]  += texture2D(texture, (fc + offset[13]) * Frag).rgb * weight[13'   +
                                                                                  '];\n'     +
        '        sigma[2]  += texture2D(texture, (fc + offset[13]) * Frag).rgb * texture2'   +
                              'D(texture, (fc + offset[13]) * Frag).rgb * weight[13];\n'     +
        '        cur_weight+= weight[13];\n'                                                 +
        '        mean[2]  += texture2D(texture, (fc + offset[20]) * Frag).rgb * weight[20'   +
                                                                                  '];\n'     +
        '        sigma[2]  += texture2D(texture, (fc + offset[20]) * Frag).rgb * texture2'   +
                              'D(texture, (fc + offset[20]) * Frag).rgb * weight[20];\n'     +
        '        cur_weight+= weight[20];\n'                                                 +
        '        mean[2]  += texture2D(texture, (fc + offset[27]) * Frag).rgb * weight[27'   +
                                                                                  '];\n'     +
        '        sigma[2]  += texture2D(texture, (fc + offset[27]) * Frag).rgb * texture2'   +
                              'D(texture, (fc + offset[27]) * Frag).rgb * weight[27];\n'     +
        '        cur_weight+= weight[27];\n\n'                                               +

        '        if(cur_weight!=0.0){\n'                                                     +
        '            mean[2] /= cur_weight;\n'                                               +
        '            sigma[2] /= cur_weight;\n'                                              +
        '        }\n\n'                                                                      +

        '        cur_std = sigma[2] - mean[2] * mean[2];\n'                                  +
        '        if(cur_std.r > 1e-10 && cur_std.g > 1e-10 && cur_std.b > 1e-10){\n'         +
        '            cur_std = sqrt(cur_std);\n'                                             +
        '        }else{\n'                                                                   +
        '            cur_std = vec3(1e-10);\n'                                               +
        '        }\n'                                                                        +
        '        total_ms += mean[2] * pow(cur_std,vec3(-q));\n'                             +
        '        total_s  += pow(cur_std,vec3(-q));\n'                                       +
        '        mean[3]=vec3(0.0);\n'                                                       +
        '        sigma[3]=vec3(0.0);\n'                                                      +
        '        cur_weight = 0.0;\n'                                                        +
        '        mean[3]  += texture2D(texture, (fc + offset[4]) * Frag).rgb * weight[4];\n' +
        '        sigma[3]  += texture2D(texture, (fc + offset[4]) * Frag).rgb * texture2D'   +
                                 '(texture, (fc + offset[4]) * Frag).rgb * weight[4];\n'     +
        '        cur_weight+= weight[4];\n'                                                  +
        '        mean[3]  += texture2D(texture, (fc + offset[11]) * Frag).rgb * weight[11'   +
                                                                                  '];\n'     +
        '        sigma[3]  += texture2D(texture, (fc + offset[11]) * Frag).rgb * texture2'   +
                              'D(texture, (fc + offset[11]) * Frag).rgb * weight[11];\n'     +
        '        cur_weight+= weight[11];\n'                                                 +
        '        mean[3]  += texture2D(texture, (fc + offset[18]) * Frag).rgb * weight[18'   +
                                                                                  '];\n'     +
        '        sigma[3]  += texture2D(texture, (fc + offset[18]) * Frag).rgb * texture2'   +
                              'D(texture, (fc + offset[18]) * Frag).rgb * weight[18];\n'     +
        '        cur_weight+= weight[18];\n'                                                 +
        '        mean[3]  += texture2D(texture, (fc + offset[5]) * Frag).rgb * weight[5];\n' +
        '        sigma[3]  += texture2D(texture, (fc + offset[5]) * Frag).rgb * texture2D'   +
                                 '(texture, (fc + offset[5]) * Frag).rgb * weight[5];\n'     +
        '        cur_weight+= weight[5];\n'                                                  +
        '        mean[3]  += texture2D(texture, (fc + offset[12]) * Frag).rgb * weight[12'   +
                                                                                  '];\n'     +
        '        sigma[3]  += texture2D(texture, (fc + offset[12]) * Frag).rgb * texture2'   +
                              'D(texture, (fc + offset[12]) * Frag).rgb * weight[12];\n'     +
        '        cur_weight+= weight[12];\n'                                                 +
        '        mean[3]  += texture2D(texture, (fc + offset[6]) * Frag).rgb * weight[6];\n' +
        '        sigma[3]  += texture2D(texture, (fc + offset[6]) * Frag).rgb * texture2D'   +
                                 '(texture, (fc + offset[6]) * Frag).rgb * weight[6];\n'     +
        '        cur_weight+= weight[6];\n\n'                                                +

        '        if(cur_weight!=0.0){\n'                                                     +
        '            mean[3] /= cur_weight;\n'                                               +
        '            sigma[3] /= cur_weight;\n'                                              +
        '        }\n\n'                                                                      +

        '        cur_std = sigma[3] - mean[3] * mean[3];\n'                                  +
        '        if(cur_std.r > 1e-10 && cur_std.g > 1e-10 && cur_std.b > 1e-10){\n'         +
        '            cur_std = sqrt(cur_std);\n'                                             +
        '        }else{\n'                                                                   +
        '            cur_std = vec3(1e-10);\n'                                               +
        '        }\n'                                                                        +
        '        total_ms += mean[3] * pow(cur_std,vec3(-q));\n'                             +
        '        total_s  += pow(cur_std,vec3(-q));\n'                                       +
        '        mean[4]=vec3(0.0);\n'                                                       +
        '        sigma[4]=vec3(0.0);\n'                                                      +
        '        cur_weight = 0.0;\n'                                                        +
        '        mean[4]  += texture2D(texture, (fc + offset[1]) * Frag).rgb * weight[1];\n' +
        '        sigma[4]  += texture2D(texture, (fc + offset[1]) * Frag).rgb * texture2D'   +
                                 '(texture, (fc + offset[1]) * Frag).rgb * weight[1];\n'     +
        '        cur_weight+= weight[1];\n'                                                  +
        '        mean[4]  += texture2D(texture, (fc + offset[2]) * Frag).rgb * weight[2];\n' +
        '        sigma[4]  += texture2D(texture, (fc + offset[2]) * Frag).rgb * texture2D'   +
                                 '(texture, (fc + offset[2]) * Frag).rgb * weight[2];\n'     +
        '        cur_weight+= weight[2];\n'                                                  +
        '        mean[4]  += texture2D(texture, (fc + offset[9]) * Frag).rgb * weight[9];\n' +
        '        sigma[4]  += texture2D(texture, (fc + offset[9]) * Frag).rgb * texture2D'   +
                                 '(texture, (fc + offset[9]) * Frag).rgb * weight[9];\n'     +
        '        cur_weight+= weight[9];\n'                                                  +
        '        mean[4]  += texture2D(texture, (fc + offset[3]) * Frag).rgb * weight[3];\n' +
        '        sigma[4]  += texture2D(texture, (fc + offset[3]) * Frag).rgb * texture2D'   +
                                 '(texture, (fc + offset[3]) * Frag).rgb * weight[3];\n'     +
        '        cur_weight+= weight[3];\n'                                                  +
        '        mean[4]  += texture2D(texture, (fc + offset[10]) * Frag).rgb * weight[10'   +
                                                                                  '];\n'     +
        '        sigma[4]  += texture2D(texture, (fc + offset[10]) * Frag).rgb * texture2'   +
                              'D(texture, (fc + offset[10]) * Frag).rgb * weight[10];\n'     +
        '        cur_weight+= weight[10];\n'                                                 +
        '        mean[4]  += texture2D(texture, (fc + offset[17]) * Frag).rgb * weight[17'   +
                                                                                  '];\n'     +
        '        sigma[4]  += texture2D(texture, (fc + offset[17]) * Frag).rgb * texture2'   +
                              'D(texture, (fc + offset[17]) * Frag).rgb * weight[17];\n'     +
        '        cur_weight+= weight[17];\n'                                                 +
        '        if(cur_weight!=0.0){\n'                                                     +
        '            mean[4] /= cur_weight;\n'                                               +
        '            sigma[4] /= cur_weight;\n'                                              +
        '        }\n'                                                                        +
        '        cur_std = sigma[4] - mean[4] * mean[4];\n'                                  +
        '        if(cur_std.r > 1e-10 && cur_std.g > 1e-10 && cur_std.b > 1e-10){\n'         +
        '            cur_std = sqrt(cur_std);\n'                                             +
        '        }else{\n'                                                                   +
        '            cur_std = vec3(1e-10);\n'                                               +
        '        }\n'                                                                        +
        '        total_ms += mean[4] * pow(cur_std,vec3(-q));\n'                             +
        '        total_s  += pow(cur_std,vec3(-q));\n'                                       +
        '        mean[5]=vec3(0.0);\n'                                                       +
        '        sigma[5]=vec3(0.0);\n'                                                      +
        '        cur_weight = 0.0;\n'                                                        +
        '        mean[5]  += texture2D(texture, (fc + offset[0]) * Frag).rgb * weight[0];\n' +
        '        sigma[5]  += texture2D(texture, (fc + offset[0]) * Frag).rgb * texture2D'   +
                                 '(texture, (fc + offset[0]) * Frag).rgb * weight[0];\n'     +
        '        cur_weight+= weight[0];\n'                                                  +
        '        mean[5]  += texture2D(texture, (fc + offset[7]) * Frag).rgb * weight[7];\n' +
        '        sigma[5]  += texture2D(texture, (fc + offset[7]) * Frag).rgb * texture2D'   +
                                 '(texture, (fc + offset[7]) * Frag).rgb * weight[7];\n'     +
        '        cur_weight+= weight[7];\n'                                                  +
        '        mean[5]  += texture2D(texture, (fc + offset[14]) * Frag).rgb * weight[14'   +
                                                                                  '];\n'     +
        '        sigma[5]  += texture2D(texture, (fc + offset[14]) * Frag).rgb * texture2'   +
                              'D(texture, (fc + offset[14]) * Frag).rgb * weight[14];\n'     +
        '        cur_weight+= weight[14];\n'                                                 +
        '        mean[5]  += texture2D(texture, (fc + offset[8]) * Frag).rgb * weight[8];\n' +
        '        sigma[5]  += texture2D(texture, (fc + offset[8]) * Frag).rgb * texture2D'   +
                                 '(texture, (fc + offset[8]) * Frag).rgb * weight[8];\n'     +
        '        cur_weight+= weight[8];\n'                                                  +
        '        mean[5]  += texture2D(texture, (fc + offset[15]) * Frag).rgb * weight[15'   +
                                                                                  '];\n'     +
        '        sigma[5]  += texture2D(texture, (fc + offset[15]) * Frag).rgb * texture2'   +
                              'D(texture, (fc + offset[15]) * Frag).rgb * weight[15];\n'     +
        '        cur_weight+= weight[15];\n'                                                 +
        '        mean[5]  += texture2D(texture, (fc + offset[16]) * Frag).rgb * weight[16'   +
                                                                                  '];\n'     +
        '        sigma[5]  += texture2D(texture, (fc + offset[16]) * Frag).rgb * texture2'   +
                              'D(texture, (fc + offset[16]) * Frag).rgb * weight[16];\n'     +
        '        cur_weight+= weight[16];\n'                                                 +
        '        if(cur_weight!=0.0){\n'                                                     +
        '            mean[5] /= cur_weight;\n'                                               +
        '            sigma[5] /= cur_weight;\n'                                              +
        '        }\n'                                                                        +
        '        cur_std = sigma[5] - mean[5] * mean[5];\n'                                  +
        '        if(cur_std.r > 1e-10 && cur_std.g > 1e-10 && cur_std.b > 1e-10){\n'         +
        '            cur_std = sqrt(cur_std);\n'                                             +
        '        }else{\n'                                                                   +
        '            cur_std = vec3(1e-10);\n'                                               +
        '        }\n'                                                                        +
        '        total_ms += mean[5] * pow(cur_std,vec3(-q));\n'                             +
        '        total_s  += pow(cur_std,vec3(-q));\n'                                       +
        '        mean[6]=vec3(0.0);\n'                                                       +
        '        sigma[6]=vec3(0.0);\n'                                                      +
        '        cur_weight = 0.0;\n'                                                        +
        '        mean[6]  += texture2D(texture, (fc + offset[21]) * Frag).rgb * weight[21'   +
                                                                                  '];\n'     +
        '        sigma[6]  += texture2D(texture, (fc + offset[21]) * Frag).rgb * texture2'   +
                              'D(texture, (fc + offset[21]) * Frag).rgb * weight[21];\n'     +
        '        cur_weight+= weight[21];\n'                                                 +
        '        mean[6]  += texture2D(texture, (fc + offset[28]) * Frag).rgb * weight[28'   +
                                                                                  '];\n'     +
        '        sigma[6]  += texture2D(texture, (fc + offset[28]) * Frag).rgb * texture2'   +
                              'D(texture, (fc + offset[28]) * Frag).rgb * weight[28];\n'     +
        '        cur_weight+= weight[28];\n'                                                 +
        '        mean[6]  += texture2D(texture, (fc + offset[35]) * Frag).rgb * weight[35'   +
                                                                                  '];\n'     +
        '        sigma[6]  += texture2D(texture, (fc + offset[35]) * Frag).rgb * texture2'   +
                              'D(texture, (fc + offset[35]) * Frag).rgb * weight[35];\n'     +
        '        cur_weight+= weight[35];\n'                                                 +
        '        mean[6]  += texture2D(texture, (fc + offset[22]) * Frag).rgb * weight[22'   +
                                                                                  '];\n'     +
        '        sigma[6]  += texture2D(texture, (fc + offset[22]) * Frag).rgb * texture2'   +
                              'D(texture, (fc + offset[22]) * Frag).rgb * weight[22];\n'     +
        '        cur_weight+= weight[22];\n'                                                 +
        '        mean[6]  += texture2D(texture, (fc + offset[29]) * Frag).rgb * weight[29'   +
                                                                                  '];\n'     +
        '        sigma[6]  += texture2D(texture, (fc + offset[29]) * Frag).rgb * texture2'   +
                              'D(texture, (fc + offset[29]) * Frag).rgb * weight[29];\n'     +
        '        cur_weight+= weight[29];\n'                                                 +
        '        mean[6]  += texture2D(texture, (fc + offset[23]) * Frag).rgb * weight[23'   +
                                                                                  '];\n'     +
        '        sigma[6]  += texture2D(texture, (fc + offset[23]) * Frag).rgb * texture2'   +
                              'D(texture, (fc + offset[23]) * Frag).rgb * weight[23];\n'     +
        '        cur_weight+= weight[23];\n'                                                 +
        '        if(cur_weight!=0.0){\n'                                                     +
        '            mean[6] /= cur_weight;\n'                                               +
        '            sigma[6] /= cur_weight;\n'                                              +
        '        }\n'                                                                        +
        '        cur_std = sigma[6] - mean[6] * mean[6];\n'                                  +
        '        if(cur_std.r > 1e-10 && cur_std.g > 1e-10 && cur_std.b > 1e-10){\n'         +
        '            cur_std = sqrt(cur_std);\n'                                             +
        '        }else{\n'                                                                   +
        '            cur_std = vec3(1e-10);\n'                                               +
        '        }\n'                                                                        +
        '        total_ms += mean[6] * pow(cur_std,vec3(-q));\n'                             +
        '        total_s  += pow(cur_std,vec3(-q));\n'                                       +
        '        mean[7]=vec3(0.0);\n'                                                       +
        '        sigma[7]=vec3(0.0);\n'                                                      +
        '        cur_weight = 0.0;\n'                                                        +
        '        mean[7]  += texture2D(texture, (fc + offset[42]) * Frag).rgb * weight[42'   +
                                                                                  '];\n'     +
        '        sigma[7]  += texture2D(texture, (fc + offset[42]) * Frag).rgb * texture2'   +
                              'D(texture, (fc + offset[42]) * Frag).rgb * weight[42];\n'     +
        '        cur_weight+= weight[42];\n'                                                 +
        '        mean[7]  += texture2D(texture, (fc + offset[36]) * Frag).rgb * weight[36'   +
                                                                                  '];\n'     +
        '        sigma[7]  += texture2D(texture, (fc + offset[36]) * Frag).rgb * texture2'   +
                              'D(texture, (fc + offset[36]) * Frag).rgb * weight[36];\n'     +
        '        cur_weight+= weight[36];\n'                                                 +
        '        mean[7]  += texture2D(texture, (fc + offset[43]) * Frag).rgb * weight[43'   +
                                                                                  '];\n'     +
        '        sigma[7]  += texture2D(texture, (fc + offset[43]) * Frag).rgb * texture2'   +
                              'D(texture, (fc + offset[43]) * Frag).rgb * weight[43];\n'     +
        '        cur_weight+= weight[43];\n'                                                 +
        '        mean[7]  += texture2D(texture, (fc + offset[30]) * Frag).rgb * weight[30'   +
                                                                                  '];\n'     +
        '        sigma[7]  += texture2D(texture, (fc + offset[30]) * Frag).rgb * texture2'   +
                              'D(texture, (fc + offset[30]) * Frag).rgb * weight[30];\n'     +
        '        cur_weight+= weight[30];\n'                                                 +
        '        mean[7]  += texture2D(texture, (fc + offset[37]) * Frag).rgb * weight[37'   +
                                                                                  '];\n'     +
        '        sigma[7]  += texture2D(texture, (fc + offset[37]) * Frag).rgb * texture2'   +
                              'D(texture, (fc + offset[37]) * Frag).rgb * weight[37];\n'     +
        '        cur_weight+= weight[37];\n'                                                 +
        '        mean[7]  += texture2D(texture, (fc + offset[44]) * Frag).rgb * weight[44'   +
                                                                                  '];\n'     +
        '        sigma[7]  += texture2D(texture, (fc + offset[44]) * Frag).rgb * texture2'   +
                              'D(texture, (fc + offset[44]) * Frag).rgb * weight[44];\n'     +
        '        cur_weight+= weight[44];\n'                                                 +
        '        if(cur_weight!=0.0){\n'                                                     +
        '            mean[7] /= cur_weight;\n'                                               +
        '            sigma[7] /= cur_weight;\n'                                              +
        '        }\n'                                                                        +
        '        cur_std = sigma[7] - mean[7] * mean[7];\n'                                  +
        '        if(cur_std.r > 1e-10 && cur_std.g > 1e-10 && cur_std.b > 1e-10){\n'         +
        '            cur_std = sqrt(cur_std);\n'                                             +
        '        }else{\n'                                                                   +
        '            cur_std = vec3(1e-10);\n'                                               +
        '        }\n\n'                                                                      +

        '        total_ms += mean[7] * pow(cur_std,vec3(-q));\n'                             +
        '        total_s  += pow(cur_std,vec3(-q));\n\n'                                     +

        '        if(total_s.r> 1e-10 && total_s.g> 1e-10 && total_s.b> 1e-10){\n'            +
        '            destColor = (total_ms/total_s).rgb;\n'                                  +
        '            destColor = max(destColor, 0.0);\n'                                     +
        '            destColor = min(destColor, 1.0);\n'                                     +
        '        }else{\n'                                                                   +
        '            destColor = texture2D(texture, vTexCoord).rgb;\n'                       +
        '        }\n\n'                                                                      +

        '    }else{\n'                                                                       +
        '        destColor = texture2D(texture, vTexCoord).rgb;\n'                           +
        '    }\n\n'                                                                          +

        '    gl_FragColor = vec4(destColor, 1.0);\n'                                         +
        '}\n',

    'gkuwaharaFilter-vert':
        'attribute vec3 position;\n'                        +
        'attribute vec2 texCoord;\n'                        +
        'uniform   mat4 mvpMatrix;\n'                       +
        'varying   vec2 vTexCoord;\n\n'                     +

        'void main(void){\n'                                +
        '	vTexCoord   = texCoord;\n'                        +
        '	gl_Position = mvpMatrix * vec4(position, 1.0);\n' +
        '}\n',

    'grayScaleFilter-frag':
        'precision mediump float;\n\n'                                             +

        'uniform sampler2D texture;\n'                                             +
        'uniform bool      grayScale;\n'                                           +
        'varying vec2      vTexCoord;\n\n'                                         +

        'const float redScale   = 0.298912;\n'                                     +
        'const float greenScale = 0.586611;\n'                                     +
        'const float blueScale  = 0.114478;\n'                                     +
        'const vec3  monochromeScale = vec3(redScale, greenScale, blueScale);\n\n' +

        'void main(void){\n'                                                       +
        '	vec4 smpColor = texture2D(texture, vTexCoord);\n'                        +
        '	if(grayScale){\n'                                                        +
        '		float grayColor = dot(smpColor.rgb, monochromeScale);\n'                +
        '		smpColor = vec4(vec3(grayColor), 1.0);\n'                               +
        '	}\n'                                                                     +
        '	gl_FragColor = smpColor;\n'                                              +
        '}\n',

    'grayScaleFilter-vert':
        'attribute vec3 position;\n'                        +
        'attribute vec2 texCoord;\n'                        +
        'uniform   mat4 mvpMatrix;\n'                       +
        'varying   vec2 vTexCoord;\n\n'                     +

        'void main(void){\n'                                +
        '	vTexCoord   = texCoord;\n'                        +
        '	gl_Position = mvpMatrix * vec4(position, 1.0);\n' +
        '}\n',

    'kuwaharaFilter-frag':
        'precision mediump float;\n\n'                                                     +

        'uniform sampler2D texture;\n\n'                                                   +

        'uniform bool b_kuwahara;\n'                                                       +
        'uniform float cvsHeight;\n'                                                       +
        'uniform float cvsWidth;\n'                                                        +
        'varying vec2 vTexCoord;\n\n'                                                      +

        'void main(void){\n'                                                               +
        '    vec3  destColor = vec3(0.0);\n'                                               +
        '    if(b_kuwahara){\n'                                                            +
        '        float minVal =0.0;\n'                                                     +
        '        vec3 mean[4];\n'                                                          +
        '        vec3 sigma[4];\n'                                                         +
        '        vec2 offset[49];\n'                                                       +
        '        offset[0] = vec2(-3.0, -3.0);\n'                                          +
        '        offset[1] = vec2(-2.0, -3.0);\n'                                          +
        '        offset[2] = vec2(-1.0, -3.0);\n'                                          +
        '        offset[3] = vec2( 0.0, -3.0);\n'                                          +
        '        offset[4] = vec2( 1.0, -3.0);\n'                                          +
        '        offset[5] = vec2( 2.0, -3.0);\n'                                          +
        '        offset[6] = vec2( 3.0, -3.0);\n\n'                                        +

        '        offset[7]  = vec2(-3.0, -2.0);\n'                                         +
        '        offset[8]  = vec2(-2.0, -2.0);\n'                                         +
        '        offset[9]  = vec2(-1.0, -2.0);\n'                                         +
        '        offset[10] = vec2( 0.0, -2.0);\n'                                         +
        '        offset[11] = vec2( 1.0, -2.0);\n'                                         +
        '        offset[12] = vec2( 2.0, -2.0);\n'                                         +
        '        offset[13] = vec2( 3.0, -2.0);\n\n'                                       +

        '        offset[14] = vec2(-3.0, -1.0);\n'                                         +
        '        offset[15] = vec2(-2.0, -1.0);\n'                                         +
        '        offset[16] = vec2(-1.0, -1.0);\n'                                         +
        '        offset[17] = vec2( 0.0, -1.0);\n'                                         +
        '        offset[18] = vec2( 1.0, -1.0);\n'                                         +
        '        offset[19] = vec2( 2.0, -1.0);\n'                                         +
        '        offset[20] = vec2( 3.0, -1.0);\n\n'                                       +

        '        offset[21] = vec2(-3.0,  0.0);\n'                                         +
        '        offset[22] = vec2(-2.0,  0.0);\n'                                         +
        '        offset[23] = vec2(-1.0,  0.0);\n'                                         +
        '        offset[24] = vec2( 0.0,  0.0);\n'                                         +
        '        offset[25] = vec2( 1.0,  0.0);\n'                                         +
        '        offset[26] = vec2( 2.0,  0.0);\n'                                         +
        '        offset[27] = vec2( 3.0,  0.0);\n\n'                                       +

        '        offset[28] = vec2(-3.0,  1.0);\n'                                         +
        '        offset[29] = vec2(-2.0,  1.0);\n'                                         +
        '        offset[30] = vec2(-1.0,  1.0);\n'                                         +
        '        offset[31] = vec2( 0.0,  1.0);\n'                                         +
        '        offset[32] = vec2( 1.0,  1.0);\n'                                         +
        '        offset[33] = vec2( 2.0,  1.0);\n'                                         +
        '        offset[34] = vec2( 3.0,  1.0);\n\n'                                       +

        '        offset[35] = vec2(-3.0,  2.0);\n'                                         +
        '        offset[36] = vec2(-2.0,  2.0);\n'                                         +
        '        offset[37] = vec2(-1.0,  2.0);\n'                                         +
        '        offset[38] = vec2( 0.0,  2.0);\n'                                         +
        '        offset[39] = vec2( 1.0,  2.0);\n'                                         +
        '        offset[40] = vec2( 2.0,  2.0);\n'                                         +
        '        offset[41] = vec2( 3.0,  2.0);\n\n'                                       +

        '        offset[42] = vec2(-3.0,  3.0);\n'                                         +
        '        offset[43] = vec2(-2.0,  3.0);\n'                                         +
        '        offset[44] = vec2(-1.0,  3.0);\n'                                         +
        '        offset[45] = vec2( 0.0,  3.0);\n'                                         +
        '        offset[46] = vec2( 1.0,  3.0);\n'                                         +
        '        offset[47] = vec2( 2.0,  3.0);\n'                                         +
        '        offset[48] = vec2( 3.0,  3.0);\n\n'                                       +

        '        float tFrag = 1.0 / cvsHeight;\n'                                         +
        '        float sFrag = 1.0 / cvsWidth;\n'                                          +
        '        vec2  Frag = vec2(sFrag,tFrag);\n'                                        +
        '        vec2  fc = vec2(gl_FragCoord.s, cvsHeight - gl_FragCoord.t);\n\n'         +

        '        //calculate mean\n'                                                       +
        '        mean[0] = vec3(0.0);\n'                                                   +
        '        sigma[0] = vec3(0.0);\n'                                                  +
        '        mean[0]  += texture2D(texture, (fc + offset[3]) * Frag).rgb;\n'           +
        '        mean[0]  += texture2D(texture, (fc + offset[4]) * Frag).rgb;\n'           +
        '        mean[0]  += texture2D(texture, (fc + offset[5]) * Frag).rgb;\n'           +
        '        mean[0]  += texture2D(texture, (fc + offset[6]) * Frag).rgb;\n'           +
        '        mean[0]  += texture2D(texture, (fc + offset[10]) * Frag).rgb;\n'          +
        '        mean[0]  += texture2D(texture, (fc + offset[11]) * Frag).rgb;\n'          +
        '        mean[0]  += texture2D(texture, (fc + offset[12]) * Frag).rgb;\n'          +
        '        mean[0]  += texture2D(texture, (fc + offset[13]) * Frag).rgb;\n'          +
        '        mean[0]  += texture2D(texture, (fc + offset[17]) * Frag).rgb;\n'          +
        '        mean[0]  += texture2D(texture, (fc + offset[18]) * Frag).rgb;\n'          +
        '        mean[0]  += texture2D(texture, (fc + offset[19]) * Frag).rgb;\n'          +
        '        mean[0]  += texture2D(texture, (fc + offset[20]) * Frag).rgb;\n'          +
        '        mean[0]  += texture2D(texture, (fc + offset[24]) * Frag).rgb;\n'          +
        '        mean[0]  += texture2D(texture, (fc + offset[25]) * Frag).rgb;\n'          +
        '        mean[0]  += texture2D(texture, (fc + offset[26]) * Frag).rgb;\n'          +
        '        mean[0]  += texture2D(texture, (fc + offset[27]) * Frag).rgb;\n\n'        +

        '        sigma[0]  += texture2D(texture, (fc + offset[3]) * Frag).rgb * texture2D' +
                                             '(texture, (fc + offset[3]) * Frag).rgb;\n'   +
        '        sigma[0]  += texture2D(texture, (fc + offset[4]) * Frag).rgb * texture2D' +
                                             '(texture, (fc + offset[4]) * Frag).rgb;\n'   +
        '        sigma[0]  += texture2D(texture, (fc + offset[5]) * Frag).rgb * texture2D' +
                                             '(texture, (fc + offset[5]) * Frag).rgb;\n'   +
        '        sigma[0]  += texture2D(texture, (fc + offset[6]) * Frag).rgb * texture2D' +
                                             '(texture, (fc + offset[6]) * Frag).rgb;\n'   +
        '        sigma[0]  += texture2D(texture, (fc + offset[10]) * Frag).rgb * texture2' +
                                           'D(texture, (fc + offset[10]) * Frag).rgb;\n'   +
        '        sigma[0]  += texture2D(texture, (fc + offset[11]) * Frag).rgb * texture2' +
                                           'D(texture, (fc + offset[11]) * Frag).rgb;\n'   +
        '        sigma[0]  += texture2D(texture, (fc + offset[12]) * Frag).rgb * texture2' +
                                           'D(texture, (fc + offset[12]) * Frag).rgb;\n'   +
        '        sigma[0]  += texture2D(texture, (fc + offset[13]) * Frag).rgb * texture2' +
                                           'D(texture, (fc + offset[13]) * Frag).rgb;\n'   +
        '        sigma[0]  += texture2D(texture, (fc + offset[17]) * Frag).rgb * texture2' +
                                           'D(texture, (fc + offset[17]) * Frag).rgb;\n'   +
        '        sigma[0]  += texture2D(texture, (fc + offset[18]) * Frag).rgb * texture2' +
                                           'D(texture, (fc + offset[18]) * Frag).rgb;\n'   +
        '        sigma[0]  += texture2D(texture, (fc + offset[19]) * Frag).rgb * texture2' +
                                           'D(texture, (fc + offset[19]) * Frag).rgb;\n'   +
        '        sigma[0]  += texture2D(texture, (fc + offset[20]) * Frag).rgb * texture2' +
                                           'D(texture, (fc + offset[20]) * Frag).rgb;\n'   +
        '        sigma[0]  += texture2D(texture, (fc + offset[24]) * Frag).rgb * texture2' +
                                           'D(texture, (fc + offset[24]) * Frag).rgb;\n'   +
        '        sigma[0]  += texture2D(texture, (fc + offset[25]) * Frag).rgb * texture2' +
                                           'D(texture, (fc + offset[25]) * Frag).rgb;\n'   +
        '        sigma[0]  += texture2D(texture, (fc + offset[26]) * Frag).rgb * texture2' +
                                           'D(texture, (fc + offset[26]) * Frag).rgb;\n'   +
        '        sigma[0]  += texture2D(texture, (fc + offset[27]) * Frag).rgb * texture2' +
                                           'D(texture, (fc + offset[27]) * Frag).rgb;\n\n' +

        '        mean[0] /= 16.0;\n'                                                       +
        '        sigma[0] = abs(sigma[0]/16.0 -  mean[0]* mean[0]);\n'                     +
        '        minVal = sigma[0].r + sigma[0].g + sigma[0].b;\n\n'                       +

        '        mean[1] = vec3(0.0);\n'                                                   +
        '        sigma[1] = vec3(0.0);\n'                                                  +
        '        mean[1]  += texture2D(texture, (fc + offset[0]) * Frag).rgb;\n'           +
        '        mean[1]  += texture2D(texture, (fc + offset[1]) * Frag).rgb;\n'           +
        '        mean[1]  += texture2D(texture, (fc + offset[2]) * Frag).rgb;\n'           +
        '        mean[1]  += texture2D(texture, (fc + offset[3]) * Frag).rgb;\n'           +
        '        mean[1]  += texture2D(texture, (fc + offset[7]) * Frag).rgb;\n'           +
        '        mean[1]  += texture2D(texture, (fc + offset[8]) * Frag).rgb;\n'           +
        '        mean[1]  += texture2D(texture, (fc + offset[9]) * Frag).rgb;\n'           +
        '        mean[1]  += texture2D(texture, (fc + offset[10]) * Frag).rgb;\n'          +
        '        mean[1]  += texture2D(texture, (fc + offset[14]) * Frag).rgb;\n'          +
        '        mean[1]  += texture2D(texture, (fc + offset[15]) * Frag).rgb;\n'          +
        '        mean[1]  += texture2D(texture, (fc + offset[16]) * Frag).rgb;\n'          +
        '        mean[1]  += texture2D(texture, (fc + offset[17]) * Frag).rgb;\n'          +
        '        mean[1]  += texture2D(texture, (fc + offset[21]) * Frag).rgb;\n'          +
        '        mean[1]  += texture2D(texture, (fc + offset[22]) * Frag).rgb;\n'          +
        '        mean[1]  += texture2D(texture, (fc + offset[23]) * Frag).rgb;\n'          +
        '        mean[1]  += texture2D(texture, (fc + offset[24]) * Frag).rgb;\n\n'        +

        '        sigma[1]  += texture2D(texture, (fc + offset[0]) * Frag).rgb * texture2D' +
                                             '(texture, (fc + offset[0]) * Frag).rgb;\n'   +
        '        sigma[1]  += texture2D(texture, (fc + offset[1]) * Frag).rgb * texture2D' +
                                             '(texture, (fc + offset[1]) * Frag).rgb;\n'   +
        '        sigma[1]  += texture2D(texture, (fc + offset[2]) * Frag).rgb * texture2D' +
                                             '(texture, (fc + offset[2]) * Frag).rgb;\n'   +
        '        sigma[1]  += texture2D(texture, (fc + offset[3]) * Frag).rgb * texture2D' +
                                             '(texture, (fc + offset[3]) * Frag).rgb;\n'   +
        '        sigma[1]  += texture2D(texture, (fc + offset[7]) * Frag).rgb * texture2D' +
                                             '(texture, (fc + offset[7]) * Frag).rgb;\n'   +
        '        sigma[1]  += texture2D(texture, (fc + offset[8]) * Frag).rgb * texture2D' +
                                             '(texture, (fc + offset[8]) * Frag).rgb;\n'   +
        '        sigma[1]  += texture2D(texture, (fc + offset[9]) * Frag).rgb * texture2D' +
                                             '(texture, (fc + offset[9]) * Frag).rgb;\n'   +
        '        sigma[1]  += texture2D(texture, (fc + offset[10]) * Frag).rgb * texture2' +
                                           'D(texture, (fc + offset[10]) * Frag).rgb;\n'   +
        '        sigma[1]  += texture2D(texture, (fc + offset[14]) * Frag).rgb * texture2' +
                                           'D(texture, (fc + offset[14]) * Frag).rgb;\n'   +
        '        sigma[1]  += texture2D(texture, (fc + offset[15]) * Frag).rgb * texture2' +
                                           'D(texture, (fc + offset[15]) * Frag).rgb;\n'   +
        '        sigma[1]  += texture2D(texture, (fc + offset[16]) * Frag).rgb * texture2' +
                                           'D(texture, (fc + offset[16]) * Frag).rgb;\n'   +
        '        sigma[1]  += texture2D(texture, (fc + offset[17]) * Frag).rgb * texture2' +
                                           'D(texture, (fc + offset[17]) * Frag).rgb;\n'   +
        '        sigma[1]  += texture2D(texture, (fc + offset[21]) * Frag).rgb * texture2' +
                                           'D(texture, (fc + offset[21]) * Frag).rgb;\n'   +
        '        sigma[1]  += texture2D(texture, (fc + offset[22]) * Frag).rgb * texture2' +
                                           'D(texture, (fc + offset[22]) * Frag).rgb;\n'   +
        '        sigma[1]  += texture2D(texture, (fc + offset[23]) * Frag).rgb * texture2' +
                                           'D(texture, (fc + offset[23]) * Frag).rgb;\n'   +
        '        sigma[1]  += texture2D(texture, (fc + offset[24]) * Frag).rgb * texture2' +
                                           'D(texture, (fc + offset[24]) * Frag).rgb;\n\n' +

        '        mean[1] /= 16.0;\n'                                                       +
        '        sigma[1] = abs(sigma[1]/16.0 -  mean[1]* mean[1]);\n'                     +
        '        float sigmaVal = sigma[1].r + sigma[1].g + sigma[1].b;\n'                 +
        '        if(sigmaVal<minVal){\n'                                                   +
        '            destColor = mean[1].rgb;\n'                                           +
        '            minVal = sigmaVal;\n'                                                 +
        '        }else{\n'                                                                 +
        '            destColor = mean[0].rgb;\n'                                           +
        '        }\n\n'                                                                    +

        '        mean[2] = vec3(0.0);\n'                                                   +
        '        sigma[2] = vec3(0.0);\n'                                                  +
        '        mean[2]  += texture2D(texture, (fc + offset[21]) * Frag).rgb;\n'          +
        '        mean[2]  += texture2D(texture, (fc + offset[22]) * Frag).rgb;\n'          +
        '        mean[2]  += texture2D(texture, (fc + offset[23]) * Frag).rgb;\n'          +
        '        mean[2]  += texture2D(texture, (fc + offset[24]) * Frag).rgb;\n'          +
        '        mean[2]  += texture2D(texture, (fc + offset[28]) * Frag).rgb;\n'          +
        '        mean[2]  += texture2D(texture, (fc + offset[29]) * Frag).rgb;\n'          +
        '        mean[2]  += texture2D(texture, (fc + offset[30]) * Frag).rgb;\n'          +
        '        mean[2]  += texture2D(texture, (fc + offset[31]) * Frag).rgb;\n'          +
        '        mean[2]  += texture2D(texture, (fc + offset[35]) * Frag).rgb;\n'          +
        '        mean[2]  += texture2D(texture, (fc + offset[36]) * Frag).rgb;\n'          +
        '        mean[2]  += texture2D(texture, (fc + offset[37]) * Frag).rgb;\n'          +
        '        mean[2]  += texture2D(texture, (fc + offset[38]) * Frag).rgb;\n'          +
        '        mean[2]  += texture2D(texture, (fc + offset[42]) * Frag).rgb;\n'          +
        '        mean[2]  += texture2D(texture, (fc + offset[43]) * Frag).rgb;\n'          +
        '        mean[2]  += texture2D(texture, (fc + offset[44]) * Frag).rgb;\n'          +
        '        mean[2]  += texture2D(texture, (fc + offset[45]) * Frag).rgb;\n\n'        +

        '        sigma[2]  += texture2D(texture, (fc + offset[21]) * Frag).rgb * texture2' +
                                           'D(texture, (fc + offset[21]) * Frag).rgb;\n'   +
        '        sigma[2]  += texture2D(texture, (fc + offset[22]) * Frag).rgb * texture2' +
                                           'D(texture, (fc + offset[22]) * Frag).rgb;\n'   +
        '        sigma[2]  += texture2D(texture, (fc + offset[23]) * Frag).rgb * texture2' +
                                           'D(texture, (fc + offset[23]) * Frag).rgb;\n'   +
        '        sigma[2]  += texture2D(texture, (fc + offset[24]) * Frag).rgb * texture2' +
                                           'D(texture, (fc + offset[24]) * Frag).rgb;\n'   +
        '        sigma[2]  += texture2D(texture, (fc + offset[28]) * Frag).rgb * texture2' +
                                           'D(texture, (fc + offset[28]) * Frag).rgb;\n'   +
        '        sigma[2]  += texture2D(texture, (fc + offset[29]) * Frag).rgb * texture2' +
                                           'D(texture, (fc + offset[29]) * Frag).rgb;\n'   +
        '        sigma[2]  += texture2D(texture, (fc + offset[30]) * Frag).rgb * texture2' +
                                           'D(texture, (fc + offset[30]) * Frag).rgb;\n'   +
        '        sigma[2]  += texture2D(texture, (fc + offset[31]) * Frag).rgb * texture2' +
                                           'D(texture, (fc + offset[31]) * Frag).rgb;\n'   +
        '        sigma[2]  += texture2D(texture, (fc + offset[35]) * Frag).rgb * texture2' +
                                           'D(texture, (fc + offset[35]) * Frag).rgb;\n'   +
        '        sigma[2]  += texture2D(texture, (fc + offset[36]) * Frag).rgb * texture2' +
                                           'D(texture, (fc + offset[36]) * Frag).rgb;\n'   +
        '        sigma[2]  += texture2D(texture, (fc + offset[37]) * Frag).rgb * texture2' +
                                           'D(texture, (fc + offset[37]) * Frag).rgb;\n'   +
        '        sigma[2]  += texture2D(texture, (fc + offset[38]) * Frag).rgb * texture2' +
                                           'D(texture, (fc + offset[38]) * Frag).rgb;\n'   +
        '        sigma[2]  += texture2D(texture, (fc + offset[42]) * Frag).rgb * texture2' +
                                           'D(texture, (fc + offset[42]) * Frag).rgb;\n'   +
        '        sigma[2]  += texture2D(texture, (fc + offset[43]) * Frag).rgb * texture2' +
                                           'D(texture, (fc + offset[43]) * Frag).rgb;\n'   +
        '        sigma[2]  += texture2D(texture, (fc + offset[44]) * Frag).rgb * texture2' +
                                           'D(texture, (fc + offset[44]) * Frag).rgb;\n'   +
        '        sigma[2]  += texture2D(texture, (fc + offset[45]) * Frag).rgb * texture2' +
                                           'D(texture, (fc + offset[45]) * Frag).rgb;\n\n' +

        '        mean[2] /= 16.0;\n'                                                       +
        '        sigma[2] = abs(sigma[2]/16.0 -  mean[2]* mean[2]);\n'                     +
        '        sigmaVal = sigma[2].r + sigma[2].g + sigma[2].b;\n'                       +
        '        if(sigmaVal<minVal){\n'                                                   +
        '            destColor = mean[2].rgb;\n'                                           +
        '            minVal = sigmaVal;\n'                                                 +
        '        }\n\n'                                                                    +

        '        mean[3] = vec3(0.0);\n'                                                   +
        '        sigma[3] = vec3(0.0);\n'                                                  +
        '        mean[3]  += texture2D(texture, (fc + offset[24]) * Frag).rgb;\n'          +
        '        mean[3]  += texture2D(texture, (fc + offset[25]) * Frag).rgb;\n'          +
        '        mean[3]  += texture2D(texture, (fc + offset[26]) * Frag).rgb;\n'          +
        '        mean[3]  += texture2D(texture, (fc + offset[27]) * Frag).rgb;\n'          +
        '        mean[3]  += texture2D(texture, (fc + offset[31]) * Frag).rgb;\n'          +
        '        mean[3]  += texture2D(texture, (fc + offset[32]) * Frag).rgb;\n'          +
        '        mean[3]  += texture2D(texture, (fc + offset[33]) * Frag).rgb;\n'          +
        '        mean[3]  += texture2D(texture, (fc + offset[34]) * Frag).rgb;\n'          +
        '        mean[3]  += texture2D(texture, (fc + offset[38]) * Frag).rgb;\n'          +
        '        mean[3]  += texture2D(texture, (fc + offset[39]) * Frag).rgb;\n'          +
        '        mean[3]  += texture2D(texture, (fc + offset[40]) * Frag).rgb;\n'          +
        '        mean[3]  += texture2D(texture, (fc + offset[41]) * Frag).rgb;\n'          +
        '        mean[3]  += texture2D(texture, (fc + offset[45]) * Frag).rgb;\n'          +
        '        mean[3]  += texture2D(texture, (fc + offset[46]) * Frag).rgb;\n'          +
        '        mean[3]  += texture2D(texture, (fc + offset[47]) * Frag).rgb;\n'          +
        '        mean[3]  += texture2D(texture, (fc + offset[48]) * Frag).rgb;\n\n'        +

        '        sigma[3]  += texture2D(texture, (fc + offset[24]) * Frag).rgb * texture2' +
                                           'D(texture, (fc + offset[24]) * Frag).rgb;\n'   +
        '        sigma[3]  += texture2D(texture, (fc + offset[25]) * Frag).rgb * texture2' +
                                           'D(texture, (fc + offset[25]) * Frag).rgb;\n'   +
        '        sigma[3]  += texture2D(texture, (fc + offset[26]) * Frag).rgb * texture2' +
                                           'D(texture, (fc + offset[26]) * Frag).rgb;\n'   +
        '        sigma[3]  += texture2D(texture, (fc + offset[27]) * Frag).rgb * texture2' +
                                           'D(texture, (fc + offset[27]) * Frag).rgb;\n'   +
        '        sigma[3]  += texture2D(texture, (fc + offset[31]) * Frag).rgb * texture2' +
                                           'D(texture, (fc + offset[31]) * Frag).rgb;\n'   +
        '        sigma[3]  += texture2D(texture, (fc + offset[32]) * Frag).rgb * texture2' +
                                           'D(texture, (fc + offset[32]) * Frag).rgb;\n'   +
        '        sigma[3]  += texture2D(texture, (fc + offset[33]) * Frag).rgb * texture2' +
                                           'D(texture, (fc + offset[33]) * Frag).rgb;\n'   +
        '        sigma[3]  += texture2D(texture, (fc + offset[34]) * Frag).rgb * texture2' +
                                           'D(texture, (fc + offset[34]) * Frag).rgb;\n'   +
        '        sigma[3]  += texture2D(texture, (fc + offset[38]) * Frag).rgb * texture2' +
                                           'D(texture, (fc + offset[38]) * Frag).rgb;\n'   +
        '        sigma[3]  += texture2D(texture, (fc + offset[39]) * Frag).rgb * texture2' +
                                           'D(texture, (fc + offset[39]) * Frag).rgb;\n'   +
        '        sigma[3]  += texture2D(texture, (fc + offset[40]) * Frag).rgb * texture2' +
                                           'D(texture, (fc + offset[40]) * Frag).rgb;\n'   +
        '        sigma[3]  += texture2D(texture, (fc + offset[41]) * Frag).rgb * texture2' +
                                           'D(texture, (fc + offset[41]) * Frag).rgb;\n'   +
        '        sigma[3]  += texture2D(texture, (fc + offset[45]) * Frag).rgb * texture2' +
                                           'D(texture, (fc + offset[45]) * Frag).rgb;\n'   +
        '        sigma[3]  += texture2D(texture, (fc + offset[46]) * Frag).rgb * texture2' +
                                           'D(texture, (fc + offset[46]) * Frag).rgb;\n'   +
        '        sigma[3]  += texture2D(texture, (fc + offset[47]) * Frag).rgb * texture2' +
                                           'D(texture, (fc + offset[47]) * Frag).rgb;\n'   +
        '        sigma[3]  += texture2D(texture, (fc + offset[48]) * Frag).rgb * texture2' +
                                           'D(texture, (fc + offset[48]) * Frag).rgb;\n\n' +

        '        mean[3] /= 16.0;\n'                                                       +
        '        sigma[3] = abs(sigma[3]/16.0 -  mean[3]* mean[3]);\n'                     +
        '        sigmaVal = sigma[3].r + sigma[3].g + sigma[3].b;\n'                       +
        '        if(sigmaVal<minVal){\n'                                                   +
        '            destColor = mean[3].rgb;\n'                                           +
        '            minVal = sigmaVal;\n'                                                 +
        '        }  \n\n'                                                                  +

        '    }else{\n'                                                                     +
        '        destColor = texture2D(texture, vTexCoord).rgb;\n'                         +
        '    }\n\n'                                                                        +

        '    gl_FragColor = vec4(destColor, 1.0);\n'                                       +
        '}\n',

    'kuwaharaFilter-vert':
        'attribute vec3 position;\n'                        +
        'attribute vec2 texCoord;\n'                        +
        'uniform   mat4 mvpMatrix;\n'                       +
        'varying   vec2 vTexCoord;\n\n'                     +

        'void main(void){\n'                                +
        '	vTexCoord   = texCoord;\n'                        +
        '	gl_Position = mvpMatrix * vec4(position, 1.0);\n' +
        '}\n',

    'laplacianFilter-frag':
        'precision mediump float;\n\n'                                                         +

        'uniform sampler2D texture;\n\n'                                                       +

        'uniform bool b_laplacian;\n'                                                          +
        'uniform float cvsHeight;\n'                                                           +
        'uniform float cvsWidth;\n'                                                            +
        'uniform float coef[9];\n'                                                             +
        'varying vec2 vTexCoord;\n\n'                                                          +

        'const float redScale   = 0.298912;\n'                                                 +
        'const float greenScale = 0.586611;\n'                                                 +
        'const float blueScale  = 0.114478;\n'                                                 +
        'const vec3  monochromeScale = vec3(redScale, greenScale, blueScale);\n\n'             +

        'void main(void){\n'                                                                   +
        '    vec3  destColor = vec3(0.0);\n'                                                   +
        '    if(b_laplacian){\n'                                                               +
        '        vec2 offset[9];\n'                                                            +
        '        offset[0] = vec2(-1.0, -1.0);\n'                                              +
        '        offset[1] = vec2( 0.0, -1.0);\n'                                              +
        '        offset[2] = vec2( 1.0, -1.0);\n'                                              +
        '        offset[3] = vec2(-1.0,  0.0);\n'                                              +
        '        offset[4] = vec2( 0.0,  0.0);\n'                                              +
        '        offset[5] = vec2( 1.0,  0.0);\n'                                              +
        '        offset[6] = vec2(-1.0,  1.0);\n'                                              +
        '        offset[7] = vec2( 0.0,  1.0);\n'                                              +
        '        offset[8] = vec2( 1.0,  1.0);\n'                                              +
        '        float tFrag = 1.0 / cvsHeight;\n'                                             +
        '        float sFrag = 1.0 / cvsWidth;\n'                                              +
        '        vec2  Frag = vec2(sFrag,tFrag);\n'                                            +
        '        vec2  fc = vec2(gl_FragCoord.s, cvsHeight - gl_FragCoord.t);\n\n'             +

        '        destColor  += texture2D(texture, (fc + offset[0]) * Frag).rgb * coef[0];\n'   +
        '        destColor  += texture2D(texture, (fc + offset[1]) * Frag).rgb * coef[1];\n'   +
        '        destColor  += texture2D(texture, (fc + offset[2]) * Frag).rgb * coef[2];\n'   +
        '        destColor  += texture2D(texture, (fc + offset[3]) * Frag).rgb * coef[3];\n'   +
        '        destColor  += texture2D(texture, (fc + offset[4]) * Frag).rgb * coef[4];\n'   +
        '        destColor  += texture2D(texture, (fc + offset[5]) * Frag).rgb * coef[5];\n'   +
        '        destColor  += texture2D(texture, (fc + offset[6]) * Frag).rgb * coef[6];\n'   +
        '        destColor  += texture2D(texture, (fc + offset[7]) * Frag).rgb * coef[7];\n'   +
        '        destColor  += texture2D(texture, (fc + offset[8]) * Frag).rgb * coef[8];\n\n' +

        '        destColor =max(destColor, 0.0);\n'                                            +
        '    }else{\n'                                                                         +
        '        destColor = texture2D(texture, vTexCoord).rgb;\n'                             +
        '    }\n\n'                                                                            +

        '    gl_FragColor = vec4(destColor, 1.0);\n'                                           +
        '}\n',

    'laplacianFilter-vert':
        'attribute vec3 position;\n'                        +
        'attribute vec2 texCoord;\n'                        +
        'uniform   mat4 mvpMatrix;\n'                       +
        'varying   vec2 vTexCoord;\n\n'                     +

        'void main(void){\n'                                +
        '	vTexCoord   = texCoord;\n'                        +
        '	gl_Position = mvpMatrix * vec4(position, 1.0);\n' +
        '}\n',

    'phong-frag':
        'precision mediump float;\n\n'                                                     +

        'uniform mat4 invMatrix;\n'                                                        +
        'uniform vec3 lightDirection;\n'                                                   +
        'uniform vec3 eyeDirection;\n'                                                     +
        'uniform vec4 ambientColor;\n'                                                     +
        'varying vec4 vColor;\n'                                                           +
        'varying vec3 vNormal;\n\n'                                                        +

        'void main(void){\n'                                                               +
        '	vec3 invLight = normalize(invMatrix*vec4(lightDirection,0.0)).xyz;\n'            +
        '	vec3 invEye = normalize(invMatrix*vec4(eyeDirection,0.0)).xyz;\n'                +
        '	vec3 halfLE = normalize(invLight+invEye);\n'                                     +
        '	float diffuse = clamp(dot(vNormal,invLight),0.0,1.0);\n'                         +
        '	float specular = pow(clamp(dot(vNormal,halfLE),0.0,1.0),50.0);\n'                +
        '	vec4 destColor = vColor * vec4(vec3(diffuse),1.0) + vec4(vec3(specular),1.0) + ' +
                                                                       'ambientColor;\n'   +
        '	gl_FragColor = destColor;\n'                                                     +
        '}\n',

    'phong-vert':
        'attribute vec3 position;\n'                              +
        'attribute vec4 color;\n'                                 +
        'attribute vec3 normal;\n\n'                              +

        'uniform mat4 mvpMatrix;\n\n'                             +

        'varying vec4 vColor;\n'                                  +
        'varying vec3 vNormal;\n\n'                               +

        'void main(void){\n'                                      +
        '    vNormal = normal;\n'                                 +
        '    vColor = color;\n'                                   +
        '    gl_Position    = mvpMatrix * vec4(position, 1.0);\n' +
        '}\n',

    'point-frag':
        'precision mediump float;\n'    +
        'varying vec4      vColor;\n\n' +

        'void main(void){\n'            +
        '    gl_FragColor = vColor;\n'  +
        '}\n',

    'point-vert':
        'attribute vec3 position;\n'                             +
        'attribute vec4 color;\n'                                +
        'uniform   mat4 mvpMatrix;\n'                            +
        'uniform   float pointSize;\n'                           +
        'varying   vec4 vColor;\n\n'                             +

        'void main(void){\n'                                     +
        '    vColor        = color;\n'                           +
        '    gl_Position   = mvpMatrix * vec4(position, 1.0);\n' +
        '    gl_PointSize  = pointSize;\n'                       +
        '}\n',

    'pointLighting-frag':
        'precision mediump float;\n\n'                                                     +

        'uniform mat4 invMatrix;\n'                                                        +
        'uniform vec3 lightPosition;\n'                                                    +
        'uniform vec3 eyeDirection;\n'                                                     +
        'uniform vec4 ambientColor;\n\n'                                                   +

        'varying vec4 vColor;\n'                                                           +
        'varying vec3 vNormal;\n'                                                          +
        'varying vec3 vPosition;\n\n'                                                      +

        'void main(void){\n'                                                               +
        '	vec3 lightVec = lightPosition -vPosition;\n'                                     +
        '	vec3 invLight = normalize(invMatrix*vec4(lightVec,0.0)).xyz;\n'                  +
        '	vec3 invEye = normalize(invMatrix*vec4(eyeDirection,0.0)).xyz;\n'                +
        '	vec3 halfLE = normalize(invLight+invEye);\n'                                     +
        '	float diffuse = clamp(dot(vNormal,invLight),0.0,1.0);\n'                         +
        '	float specular = pow(clamp(dot(vNormal,halfLE),0.0,1.0),50.0);\n'                +
        '	vec4 destColor = vColor * vec4(vec3(diffuse),1.0) + vec4(vec3(specular),1.0) + ' +
                                                                       'ambientColor;\n'   +
        '	gl_FragColor = destColor;\n'                                                     +
        '}\n',

    'pointLighting-vert':
        'attribute vec3 position;\n'                              +
        'attribute vec4 color;\n'                                 +
        'attribute vec3 normal;\n\n'                              +

        'uniform mat4 mvpMatrix;\n'                               +
        'uniform mat4 mMatrix;\n\n'                               +

        'varying vec3 vPosition;\n'                               +
        'varying vec4 vColor;\n'                                  +
        'varying vec3 vNormal;\n\n'                               +

        'void main(void){\n'                                      +
        '    vPosition = (mMatrix*vec4(position,1.0)).xyz;\n'     +
        '    vNormal = normal;\n'                                 +
        '    vColor = color;\n'                                   +
        '    gl_Position    = mvpMatrix * vec4(position, 1.0);\n' +
        '}\n',

    'pointSprite-frag':
        'precision mediump float;\n\n'                       +

        'uniform sampler2D texture;\n'                       +
        'varying vec4      vColor;\n\n'                      +

        'void main(void){\n'                                 +
        '    vec4 smpColor = vec4(1.0);\n'                   +
        '    smpColor = texture2D(texture,gl_PointCoord);\n' +
        '    if(smpColor.a == 0.0){\n'                       +
        '        discard;\n'                                 +
        '    }else{\n'                                       +
        '        gl_FragColor = vColor * smpColor;\n'        +
        '    }\n'                                            +
        '}\n',

    'pointSprite-vert':
        'attribute vec3 position;\n'                             +
        'attribute vec4 color;\n'                                +
        'uniform   mat4 mvpMatrix;\n'                            +
        'uniform   float pointSize;\n'                           +
        'varying   vec4 vColor;\n\n'                             +

        'void main(void){\n'                                     +
        '    vColor        = color;\n'                           +
        '    gl_Position   = mvpMatrix * vec4(position, 1.0);\n' +
        '    gl_PointSize  = pointSize;\n'                       +
        '}\n',

    'projTexture-frag':
        'precision mediump float;\n\n'                                     +

        'uniform mat4      invMatrix;\n'                                   +
        'uniform vec3      lightPosition;\n'                               +
        'uniform sampler2D texture;\n'                                     +
        'varying vec3      vPosition;\n'                                   +
        'varying vec3      vNormal;\n'                                     +
        'varying vec4      vColor;\n'                                      +
        'varying vec4      vTexCoord;\n\n'                                 +

        'void main(void){\n'                                               +
        '	vec3  light    = lightPosition - vPosition;\n'                   +
        '	vec3  invLight = normalize(invMatrix * vec4(light, 0.0)).xyz;\n' +
        '	float diffuse  = clamp(dot(vNormal, invLight), 0.1, 1.0);\n'     +
        '	vec4  smpColor = texture2DProj(texture, vTexCoord);\n'           +
        '	gl_FragColor   = vColor * (0.5 + diffuse) * smpColor;\n'         +
        '}\n',

    'projTexture-vert':
        'attribute vec3 position;\n'                            +
        'attribute vec3 normal;\n'                              +
        'attribute vec4 color;\n'                               +
        'uniform   mat4 mMatrix;\n'                             +
        'uniform   mat4 tMatrix;\n'                             +
        'uniform   mat4 mvpMatrix;\n'                           +
        'varying   vec3 vPosition;\n'                           +
        'varying   vec3 vNormal;\n'                             +
        'varying   vec4 vColor;\n'                              +
        'varying   vec4 vTexCoord;\n\n'                         +

        'void main(void){\n'                                    +
        '	vPosition   = (mMatrix * vec4(position, 1.0)).xyz;\n' +
        '	vNormal     = normal;\n'                              +
        '	vColor      = color;\n'                               +
        '	vTexCoord   = tMatrix * vec4(vPosition, 1.0);\n'      +
        '	gl_Position = mvpMatrix * vec4(position, 1.0);\n'     +
        '}\n',

    'refractionMapping-frag':
        'precision mediump float;\n\n'                                        +

        'uniform vec3        eyePosition;\n'                                  +
        'uniform samplerCube cubeTexture;\n'                                  +
        'uniform bool        refraction;\n'                                   +
        'varying vec3        vPosition;\n'                                    +
        'varying vec3        vNormal;\n'                                      +
        'varying vec4        vColor;\n\n'                                     +

        '//reflact calculation TODO\n'                                        +
        '//vec3 egt_refract(vec3 p, vec3 n,float eta){\n'                     +
        '//}\n\n'                                                             +

        'void main(void){\n'                                                  +
        '	vec3 ref;\n'                                                        +
        '	if(refraction){\n'                                                  +
        '		ref = refract(normalize(vPosition - eyePosition), vNormal,0.6);\n' +
        '	}else{\n'                                                           +
        '		ref = vNormal;\n'                                                  +
        '	}\n'                                                                +
        '	vec4 envColor  = textureCube(cubeTexture, ref);\n'                  +
        '	vec4 destColor = vColor * envColor;\n'                              +
        '	gl_FragColor   = destColor;\n'                                      +
        '}\n',

    'refractionMapping-vert':
        'attribute vec3 position;\n'                                     +
        'attribute vec3 normal;\n'                                       +
        'attribute vec4 color;\n'                                        +
        'uniform   mat4 mMatrix;\n'                                      +
        'uniform   mat4 mvpMatrix;\n'                                    +
        'varying   vec3 vPosition;\n'                                    +
        'varying   vec3 vNormal;\n'                                      +
        'varying   vec4 vColor;\n\n'                                     +

        'void main(void){\n'                                             +
        '	vPosition   = (mMatrix * vec4(position, 1.0)).xyz;\n'          +
        '	vNormal     = normalize((mMatrix * vec4(normal, 0.0)).xyz);\n' +
        '	vColor      = color;\n'                                        +
        '	gl_Position = mvpMatrix * vec4(position, 1.0);\n'              +
        '}\n',

    'sepiaFilter-frag':
        'precision mediump float;\n\n'                                             +

        'uniform sampler2D texture;\n'                                             +
        'uniform bool      sepia;\n'                                               +
        'varying vec2      vTexCoord;\n\n'                                         +

        'const float redScale   = 0.298912;\n'                                     +
        'const float greenScale = 0.586611;\n'                                     +
        'const float blueScale  = 0.114478;\n'                                     +
        'const vec3  monochromeScale = vec3(redScale, greenScale, blueScale);\n\n' +

        'const float sRedScale   = 1.07;\n'                                        +
        'const float sGreenScale = 0.74;\n'                                        +
        'const float sBlueScale  = 0.43;\n'                                        +
        'const vec3  sepiaScale = vec3(sRedScale, sGreenScale, sBlueScale);\n\n'   +

        'void main(void){\n'                                                       +
        '    vec4  smpColor  = texture2D(texture, vTexCoord);\n'                   +
        '    float grayColor = dot(smpColor.rgb, monochromeScale);\n\n'            +

        '    vec3 monoColor = vec3(grayColor) * sepiaScale; \n'                    +
        '    smpColor = vec4(monoColor, 1.0);\n\n'                                 +

        '    gl_FragColor = smpColor;\n'                                           +
        '}\n',

    'sepiaFilter-vert':
        'attribute vec3 position;\n'                        +
        'attribute vec2 texCoord;\n'                        +
        'uniform   mat4 mvpMatrix;\n'                       +
        'varying   vec2 vTexCoord;\n\n'                     +

        'void main(void){\n'                                +
        '	vTexCoord   = texCoord;\n'                        +
        '	gl_Position = mvpMatrix * vec4(position, 1.0);\n' +
        '}\n',

    'shadowDepthBuffer-frag':
        'precision mediump float;\n\n'                     +

        'uniform bool depthBuffer;\n\n'                    +

        'varying vec4 vPosition;\n\n'                      +

        'vec4 convRGBA(float depth){\n'                    +
        '    float r = depth;\n'                           +
        '    float g = fract(r*255.0);\n'                  +
        '    float b = fract(g*255.0); \n'                 +
        '    float a = fract(b*255.0);\n'                  +
        '    float coef = 1.0/255.0;\n'                    +
        '    r-= g* coef; \n'                              +
        '    g-= b* coef; \n'                              +
        '    b-= a* coef; \n'                              +
        '    return vec4(r,g,b,a);\n'                      +
        '}\n\n'                                            +

        'void main(void){\n'                               +
        '    vec4 convColor;\n'                            +
        '    if(depthBuffer){\n'                           +
        '        convColor = convRGBA(gl_FragCoord.z);\n'  +
        '    }else{\n'                                     +
        '        float near = 0.1;\n'                      +
        '        float far  = 150.0;\n'                    +
        '        float linerDepth = 1.0 / (far - near);\n' +
        '        linerDepth *= length(vPosition);\n'       +
        '        convColor = convRGBA(linerDepth);\n'      +
        '    }\n'                                          +
        '    gl_FragColor = convColor;\n'                  +
        '}\n',

    'shadowDepthBuffer-vert':
        'attribute vec3 position;\n'                         +
        'uniform mat4 mvpMatrix;\n\n'                        +

        'varying vec4 vPosition;\n\n'                        +

        'void main(void){\n'                                 +
        '    vPosition = mvpMatrix * vec4(position, 1.0);\n' +
        '    gl_Position = vPosition;\n'                     +
        '}\n',

    'shadowScreen-frag':
        'precision mediump float;\n\n'                                          +

        'uniform mat4      invMatrix;\n'                                        +
        'uniform vec3      lightPosition;\n'                                    +
        'uniform sampler2D texture;\n'                                          +
        'uniform bool      depthBuffer;\n'                                      +
        'varying vec3      vPosition;\n'                                        +
        'varying vec3      vNormal;\n'                                          +
        'varying vec4      vColor;\n'                                           +
        'varying vec4      vTexCoord;\n'                                        +
        'varying vec4      vDepth;\n\n'                                         +

        'float restDepth(vec4 RGBA){\n'                                         +
        '    const float rMask = 1.0;\n'                                        +
        '    const float gMask = 1.0 / 255.0;\n'                                +
        '    const float bMask = 1.0 / (255.0 * 255.0);\n'                      +
        '    const float aMask = 1.0 / (255.0 * 255.0 * 255.0);\n'              +
        '    float depth = dot(RGBA, vec4(rMask, gMask, bMask, aMask));\n'      +
        '    return depth;\n'                                                   +
        '}\n\n'                                                                 +

        'void main(void){\n'                                                    +
        '    vec3  light     = lightPosition - vPosition;\n'                    +
        '    vec3  invLight  = normalize(invMatrix * vec4(light, 0.0)).xyz;\n'  +
        '    float diffuse   = clamp(dot(vNormal, invLight), 0.1, 1.0);\n'      +
        '    float shadow    = restDepth(texture2DProj(texture, vTexCoord));\n' +
        '    vec4 depthColor = vec4(1.0);\n'                                    +
        '    if(vDepth.w > 0.0){\n'                                             +
        '        if(depthBuffer){\n'                                            +
        '            vec4 lightCoord = vDepth / vDepth.w;\n'                    +
        '            if(lightCoord.z - 0.0001 > shadow){\n'                     +
        '                depthColor  = vec4(0.5, 0.5, 0.5, 1.0);\n'             +
        '            }\n'                                                       +
        '        }else{\n'                                                      +
        '            float near = 0.1;\n'                                       +
        '            float far  = 150.0;\n'                                     +
        '            float linerDepth = 1.0 / (far - near);\n'                  +
        '            linerDepth *= length(vPosition.xyz - lightPosition);\n'    +
        '            if(linerDepth - 0.0001 > shadow){\n'                       +
        '                depthColor  = vec4(0.5, 0.5, 0.5, 1.0);\n'             +
        '            }\n'                                                       +
        '        }\n'                                                           +
        '    }\n'                                                               +
        '    gl_FragColor = vColor * (vec3(diffuse),1.0) * depthColor;\n'       +
        '}\n',

    'shadowScreen-vert':
        'attribute vec3 position;\n'                               +
        'attribute vec3 normal;\n'                                 +
        'attribute vec4 color;\n'                                  +
        'uniform   mat4 mMatrix;\n'                                +
        'uniform   mat4 mvpMatrix;\n'                              +
        'uniform   mat4 tMatrix;\n'                                +
        'uniform   mat4 lgtMatrix;\n'                              +
        'varying   vec3 vPosition;\n'                              +
        'varying   vec3 vNormal;\n'                                +
        'varying   vec4 vColor;\n'                                 +
        'varying   vec4 vTexCoord;\n'                              +
        'varying   vec4 vDepth;\n\n'                               +

        'void main(void){\n'                                       +
        '    vPosition   = (mMatrix * vec4(position, 1.0)).xyz;\n' +
        '    vNormal     = normal;\n'                              +
        '    vColor      = color;\n'                               +
        '    vTexCoord   = tMatrix * vec4(vPosition, 1.0);\n'      +
        '    vDepth      = lgtMatrix * vec4(position, 1.0);\n'     +
        '    gl_Position = mvpMatrix * vec4(position, 1.0);\n'     +
        '}\n',

    'sobelFilter-frag':
        'precision mediump float;\n\n'                                                     +

        'uniform sampler2D texture;\n\n'                                                   +

        'uniform bool b_sobel;\n'                                                          +
        'uniform float cvsHeight;\n'                                                       +
        'uniform float cvsWidth;\n'                                                        +
        'uniform float hCoef[9];\n'                                                        +
        'uniform float vCoef[9];\n'                                                        +
        'varying vec2 vTexCoord;\n\n'                                                      +

        'const float redScale   = 0.298912;\n'                                             +
        'const float greenScale = 0.586611;\n'                                             +
        'const float blueScale  = 0.114478;\n'                                             +
        'const vec3  monochromeScale = vec3(redScale, greenScale, blueScale);\n\n'         +

        'void main(void){\n'                                                               +
        '    vec3 destColor = vec3(0.0);\n'                                                +
        '    if(b_sobel){\n'                                                               +
        '        vec2 offset[9];\n'                                                        +
        '        offset[0] = vec2(-1.0, -1.0);\n'                                          +
        '        offset[1] = vec2( 0.0, -1.0);\n'                                          +
        '        offset[2] = vec2( 1.0, -1.0);\n'                                          +
        '        offset[3] = vec2(-1.0,  0.0);\n'                                          +
        '        offset[4] = vec2( 0.0,  0.0);\n'                                          +
        '        offset[5] = vec2( 1.0,  0.0);\n'                                          +
        '        offset[6] = vec2(-1.0,  1.0);\n'                                          +
        '        offset[7] = vec2( 0.0,  1.0);\n'                                          +
        '        offset[8] = vec2( 1.0,  1.0);\n'                                          +
        '        float tFrag = 1.0 / cvsHeight;\n'                                         +
        '        float sFrag = 1.0 / cvsWidth;\n'                                          +
        '        vec2  Frag = vec2(sFrag,tFrag);\n'                                        +
        '        vec2  fc = vec2(gl_FragCoord.s, cvsHeight - gl_FragCoord.t);\n'           +
        '        vec3  horizonColor = vec3(0.0);\n'                                        +
        '        vec3  verticalColor = vec3(0.0);\n\n'                                     +

        '        horizonColor  += texture2D(texture, (fc + offset[0]) * Frag).rgb * hCoef' +
                                                                                '[0];\n'   +
        '        horizonColor  += texture2D(texture, (fc + offset[1]) * Frag).rgb * hCoef' +
                                                                                '[1];\n'   +
        '        horizonColor  += texture2D(texture, (fc + offset[2]) * Frag).rgb * hCoef' +
                                                                                '[2];\n'   +
        '        horizonColor  += texture2D(texture, (fc + offset[3]) * Frag).rgb * hCoef' +
                                                                                '[3];\n'   +
        '        horizonColor  += texture2D(texture, (fc + offset[4]) * Frag).rgb * hCoef' +
                                                                                '[4];\n'   +
        '        horizonColor  += texture2D(texture, (fc + offset[5]) * Frag).rgb * hCoef' +
                                                                                '[5];\n'   +
        '        horizonColor  += texture2D(texture, (fc + offset[6]) * Frag).rgb * hCoef' +
                                                                                '[6];\n'   +
        '        horizonColor  += texture2D(texture, (fc + offset[7]) * Frag).rgb * hCoef' +
                                                                                '[7];\n'   +
        '        horizonColor  += texture2D(texture, (fc + offset[8]) * Frag).rgb * hCoef' +
                                                                                '[8];\n\n' +

        '        verticalColor += texture2D(texture, (fc + offset[0]) * Frag).rgb * vCoef' +
                                                                                '[0];\n'   +
        '        verticalColor += texture2D(texture, (fc + offset[1]) * Frag).rgb * vCoef' +
                                                                                '[1];\n'   +
        '        verticalColor += texture2D(texture, (fc + offset[2]) * Frag).rgb * vCoef' +
                                                                                '[2];\n'   +
        '        verticalColor += texture2D(texture, (fc + offset[3]) * Frag).rgb * vCoef' +
                                                                                '[3];\n'   +
        '        verticalColor += texture2D(texture, (fc + offset[4]) * Frag).rgb * vCoef' +
                                                                                '[4];\n'   +
        '        verticalColor += texture2D(texture, (fc + offset[5]) * Frag).rgb * vCoef' +
                                                                                '[5];\n'   +
        '        verticalColor += texture2D(texture, (fc + offset[6]) * Frag).rgb * vCoef' +
                                                                                '[6];\n'   +
        '        verticalColor += texture2D(texture, (fc + offset[7]) * Frag).rgb * vCoef' +
                                                                                '[7];\n'   +
        '        verticalColor += texture2D(texture, (fc + offset[8]) * Frag).rgb * vCoef' +
                                                                                '[8];\n'   +
        '        destColor = vec3(sqrt(horizonColor * horizonColor + verticalColor * vert' +
                                                                        'icalColor));\n'   +
        '    }else{\n'                                                                     +
        '        destColor = texture2D(texture, vTexCoord).rgb;\n'                         +
        '    }\n\n'                                                                        +

        '    gl_FragColor = vec4(destColor, 1.0);\n'                                       +
        '}\n',

    'sobelFilter-vert':
        'attribute vec3 position;\n'                        +
        'attribute vec2 texCoord;\n'                        +
        'uniform   mat4 mvpMatrix;\n'                       +
        'varying   vec2 vTexCoord;\n\n'                     +

        'void main(void){\n'                                +
        '	vTexCoord   = texCoord;\n'                        +
        '	gl_Position = mvpMatrix * vec4(position, 1.0);\n' +
        '}\n',

    'specCpt-frag':
        'precision mediump float;\n\n' +

        'varying vec4 vColor;\n\n'     +

        'void main(void){\n'           +
        '	gl_FragColor = vColor;\n'    +
        '}\n',

    'specCpt-vert':
        'attribute vec3 position;\n'                                                +
        'attribute vec3 normal;\n'                                                  +
        'attribute vec4 color;\n'                                                   +
        'uniform   mat4 mvpMatrix;\n'                                               +
        'uniform   mat4 invMatrix;\n'                                               +
        'uniform   vec3 lightDirection;\n'                                          +
        'uniform   vec3 eyeDirection;\n'                                            +
        'varying   vec4 vColor;\n\n'                                                +

        'void main(void){\n'                                                        +
        '	vec3  invLight = normalize(invMatrix * vec4(lightDirection, 0.0)).xyz;\n' +
        '	vec3  invEye   = normalize(invMatrix * vec4(eyeDirection, 0.0)).xyz;\n'   +
        '	vec3  halfLE   = normalize(invLight + invEye);\n'                         +
        '	float specular = pow(clamp(dot(normal, halfLE), 0.0, 1.0), 50.0);\n'      +
        '	vColor         = color * vec4(vec3(specular), 1.0);\n'                    +
        '	gl_Position    = mvpMatrix * vec4(position, 1.0);\n'                      +
        '}\n',

    'specular-frag':
        'precision mediump float;\n\n' +

        'varying vec4 vColor;\n\n'     +

        'void main(void){\n'           +
        '	gl_FragColor = vColor;\n'    +
        '}\n',

    'specular-vert':
        'attribute vec3 position;\n'                                                 +
        'attribute vec4 color;\n'                                                    +
        'attribute vec3 normal;\n\n'                                                 +

        'uniform mat4 mvpMatrix;\n'                                                  +
        'uniform mat4 invMatrix;\n\n'                                                +

        'uniform vec3 lightDirection;\n'                                             +
        'uniform vec3 eyeDirection;\n'                                               +
        'uniform vec4 ambientColor;\n'                                               +
        'varying vec4 vColor;\n\n'                                                   +

        'void main(void){\n'                                                         +
        '    vec3 invLight = normalize(invMatrix*vec4(lightDirection,0.0)).xyz;\n'   +
        '    vec3 invEye = normalize(invMatrix* vec4(eyeDirection,0.0)).xyz;\n'      +
        '    vec3 halfLE = normalize(invLight+invEye);\n\n'                          +

        '    float diffuse = clamp(dot(invLight,normal),0.0,1.0);\n'                 +
        '    float specular = pow(clamp(dot(normal,halfLE),0.0,1.0),50.0);\n'        +
        '    vec4 light = color*vec4(vec3(diffuse),1.0)+vec4(vec3(specular),1.0);\n' +
        '    vColor = light + ambientColor;\n'                                       +
        '    gl_Position    = mvpMatrix * vec4(position, 1.0);\n'                    +
        '}\n',

    'SST-frag':
        '// by Jan Eric Kyprianidis <www.kyprianidis.com>\n'                               +
        'precision mediump float;\n\n'                                                     +

        'uniform sampler2D src;\n'                                                         +
        'uniform float cvsHeight;\n'                                                       +
        'uniform float cvsWidth;\n\n'                                                      +

        'const float redScale   = 0.298912;\n'                                             +
        'const float greenScale = 0.586611;\n'                                             +
        'const float blueScale  = 0.114478;\n'                                             +
        'const vec3  monochromeScale = vec3(redScale, greenScale, blueScale);\n\n'         +

        'void main (void) {\n'                                                             +
        '    vec2 src_size = vec2(cvsWidth, cvsHeight);\n'                                 +
        '    vec2 uv = vec2(gl_FragCoord.x / src_size.x, (src_size.y - gl_FragCoord.y) / ' +
                                                                        'src_size.y);\n'   +
        '    vec2 d = 1.0 / src_size;\n'                                                   +
        '    vec3 c = texture2D(src, uv).xyz;\n\n'                                         +

        '    vec3 u = (\n'                                                                 +
        '        -1.0 * texture2D(src, uv + vec2(-d.x, -d.y)).xyz +\n'                     +
        '        -2.0 * texture2D(src, uv + vec2(-d.x,  0.0)).xyz + \n'                    +
        '        -1.0 * texture2D(src, uv + vec2(-d.x,  d.y)).xyz +\n'                     +
        '        +1.0 * texture2D(src, uv + vec2( d.x, -d.y)).xyz +\n'                     +
        '        +2.0 * texture2D(src, uv + vec2( d.x,  0.0)).xyz + \n'                    +
        '        +1.0 * texture2D(src, uv + vec2( d.x,  d.y)).xyz\n'                       +
        '        ) / 4.0;\n\n'                                                             +

        '    vec3 v = (\n'                                                                 +
        '           -1.0 * texture2D(src, uv + vec2(-d.x, -d.y)).xyz + \n'                 +
        '           -2.0 * texture2D(src, uv + vec2( 0.0, -d.y)).xyz + \n'                 +
        '           -1.0 * texture2D(src, uv + vec2( d.x, -d.y)).xyz +\n'                  +
        '           +1.0 * texture2D(src, uv + vec2(-d.x,  d.y)).xyz +\n'                  +
        '           +2.0 * texture2D(src, uv + vec2( 0.0,  d.y)).xyz + \n'                 +
        '           +1.0 * texture2D(src, uv + vec2( d.x,  d.y)).xyz\n'                    +
        '           ) / 4.0;\n\n'                                                          +

        '    gl_FragColor = vec4(dot(u, u), dot(v, v), dot(u, v), 1.0);\n'                 +
        '}\n',

    'SST-vert':
        'attribute vec3 position;\n'                        +
        'attribute vec2 texCoord;\n'                        +
        'uniform   mat4 mvpMatrix;\n'                       +
        'varying   vec2 vTexCoord;\n\n'                     +

        'void main(void){\n'                                +
        '	vTexCoord   = texCoord;\n'                        +
        '	gl_Position = mvpMatrix * vec4(position, 1.0);\n' +
        '}\n',

    'stencilBufferOutline-frag':
        'precision mediump float;\n\n'                      +

        'uniform sampler2D texture;\n'                      +
        'uniform bool      useTexture;\n'                   +
        'varying vec4      vColor;\n'                       +
        'varying vec2      vTextureCoord;\n\n'              +

        'void main(void){\n'                                +
        '	vec4 smpColor = vec4(1.0);\n'                     +
        '	if(useTexture){\n'                                +
        '		smpColor = texture2D(texture, vTextureCoord);\n' +
        '	}\n'                                              +
        '	gl_FragColor = vColor * smpColor;\n'              +
        '}\n',

    'stencilBufferOutline-vert':
        'attribute vec3 position;\n'                                                 +
        'attribute vec3 normal;\n'                                                   +
        'attribute vec4 color;\n'                                                    +
        'attribute vec2 textureCoord;\n'                                             +
        'uniform   mat4 mvpMatrix;\n'                                                +
        'uniform   mat4 invMatrix;\n'                                                +
        'uniform   vec3 lightDirection;\n'                                           +
        'uniform   bool useLight;\n'                                                 +
        'uniform   bool outline;\n'                                                  +
        'varying   vec4 vColor;\n'                                                   +
        'varying   vec2 vTextureCoord;\n\n'                                          +

        'void main(void){\n'                                                         +
        '	if(useLight){\n'                                                           +
        '		vec3  invLight = normalize(invMatrix * vec4(lightDirection, 0.0)).xyz;\n' +
        '		float diffuse  = clamp(dot(normal, invLight), 0.1, 1.0);\n'               +
        '		vColor         = color * vec4(vec3(diffuse), 1.0);\n'                     +
        '	}else{\n'                                                                  +
        '		vColor         = color;\n'                                                +
        '	}\n'                                                                       +
        '	vTextureCoord      = textureCoord;\n'                                      +
        '	vec3 oPosition     = position;\n'                                          +
        '	if(outline){\n'                                                            +
        '		oPosition     += normal * 0.1;\n'                                         +
        '	}\n'                                                                       +
        '	gl_Position = mvpMatrix * vec4(oPosition, 1.0);\n'                         +
        '}\n',

    'synth-frag':
        'precision mediump float;\n\n'                                                    +

        'uniform sampler2D texture1;\n'                                                   +
        'uniform sampler2D texture2;\n'                                                   +
        'uniform bool      glare;\n'                                                      +
        'varying vec2      vTexCoord;\n\n'                                                +

        'void main(void){\n'                                                              +
        '	vec4  destColor = texture2D(texture1, vTexCoord);\n'                            +
        '	vec4  smpColor  = texture2D(texture2, vec2(vTexCoord.s, 1.0 - vTexCoord.t));\n' +
        '	if(glare){\n'                                                                   +
        '		destColor += smpColor * 2.0;\n'                                                +
        '	}\n'                                                                            +
        '	gl_FragColor = destColor;\n'                                                    +
        '}\n',

    'synth-vert':
        'attribute vec3 position;\n'                        +
        'attribute vec2 texCoord;\n'                        +
        'uniform   mat4 mvpMatrix;\n'                       +
        'varying   vec2 vTexCoord;\n\n'                     +

        'void main(void){\n'                                +
        '	vTexCoord   = texCoord;\n'                        +
        '	gl_Position = mvpMatrix * vec4(position, 1.0);\n' +
        '}\n',

    'texture-frag':
        'precision mediump float;\n\n'                             +

        'uniform sampler2D texture;\n'                             +
        'varying vec4      vColor;\n'                              +
        'varying vec2      vTextureCoord;\n\n'                     +

        'void main(void){\n'                                       +
        '    vec4 smpColor = texture2D(texture, vTextureCoord);\n' +
        '    gl_FragColor  = vColor * smpColor;\n'                 +
        '}\n',

    'texture-vert':
        'attribute vec3 position;\n'                             +
        'attribute vec4 color;\n'                                +
        'attribute vec2 textureCoord;\n'                         +
        'uniform   mat4 mvpMatrix;\n'                            +
        'varying   vec4 vColor;\n'                               +
        'varying   vec2 vTextureCoord;\n\n'                      +

        'void main(void){\n'                                     +
        '    vColor        = color;\n'                           +
        '    vTextureCoord = textureCoord;\n'                    +
        '    gl_Position   = mvpMatrix * vec4(position, 1.0);\n' +
        '}\n',

    'TFM-frag':
        '// by Jan Eric Kyprianidis <www.kyprianidis.com>\n'                               +
        'precision mediump float;\n\n'                                                     +

        'uniform sampler2D src;\n'                                                         +
        'uniform float cvsHeight;\n'                                                       +
        'uniform float cvsWidth;\n\n'                                                      +

        'void main (void) {\n'                                                             +
        '    vec2 uv = gl_FragCoord.xy / vec2(cvsWidth, cvsHeight);\n'                     +
        '    vec3 g = texture2D(src, uv).xyz;\n\n'                                         +

        '    float lambda1 = 0.5 * (g.y + g.x + sqrt(g.y*g.y - 2.0*g.x*g.y + g.x*g.x + 4.' +
                                                                        '0*g.z*g.z));\n'   +
        '    float lambda2 = 0.5 * (g.y + g.x - sqrt(g.y*g.y - 2.0*g.x*g.y + g.x*g.x + 4.' +
                                                                        '0*g.z*g.z));\n\n' +

        '    vec2 v = vec2(lambda1 - g.x, -g.z);\n'                                        +
        '    vec2 t;\n'                                                                    +
        '    if (length(v) > 0.0) { \n'                                                    +
        '        t = normalize(v);\n'                                                      +
        '    } else {\n'                                                                   +
        '        t = vec2(0.0, 1.0);\n'                                                    +
        '    }\n\n'                                                                        +

        '    float phi = atan(t.y, t.x);\n\n'                                              +

        '    float A = (lambda1 + lambda2 > 0.0)?(lambda1 - lambda2) / (lambda1 + lambda2' +
                                                                            ') : 0.0;\n'   +
        '    gl_FragColor = vec4(t, phi, A);\n'                                            +
        '}\n',

    'TFM-vert':
        'attribute vec3 position;\n'                        +
        'attribute vec2 texCoord;\n'                        +
        'uniform   mat4 mvpMatrix;\n'                       +
        'varying   vec2 vTexCoord;\n\n'                     +

        'void main(void){\n'                                +
        '	vTexCoord   = texCoord;\n'                        +
        '	gl_Position = mvpMatrix * vec4(position, 1.0);\n' +
        '}\n',

    'toonShading-frag':
        'precision mediump float;\n\n'                                               +

        'uniform mat4      invMatrix;\n'                                             +
        'uniform vec3      lightDirection;\n'                                        +
        'uniform sampler2D texture;\n'                                               +
        'uniform vec4      edgeColor;\n'                                             +
        'varying vec3      vNormal;\n'                                               +
        'varying vec4      vColor;\n\n'                                              +

        'void main(void){\n'                                                         +
        '	if(edgeColor.a > 0.0){\n'                                                  +
        '		gl_FragColor   = edgeColor;\n'                                            +
        '	}else{\n'                                                                  +
        '		vec3  invLight = normalize(invMatrix * vec4(lightDirection, 0.0)).xyz;\n' +
        '		float diffuse  = clamp(dot(vNormal, invLight), 0.1, 1.0);\n'              +
        '		vec4  smpColor = texture2D(texture, vec2(diffuse, 0.0));\n'               +
        '		gl_FragColor   = vColor * smpColor;\n'                                    +
        '	}\n'                                                                       +
        '}\n',

    'toonShading-vert':
        'attribute vec3 position;\n'                   +
        'attribute vec3 normal;\n'                     +
        'attribute vec4 color;\n'                      +
        'uniform   mat4 mvpMatrix;\n'                  +
        'uniform   bool edge;\n'                       +
        'varying   vec3 vNormal;\n'                    +
        'varying   vec4 vColor;\n\n'                   +

        'void main(void){\n'                           +
        '	vec3 pos    = position;\n'                   +
        '	if(edge){\n'                                 +
        '		pos    += normal * 0.05;\n'                 +
        '	}\n'                                         +
        '	vNormal     = normal;\n'                     +
        '	vColor      = color;\n'                      +
        '	gl_Position = mvpMatrix * vec4(pos, 1.0);\n' +
        '}\n'
}