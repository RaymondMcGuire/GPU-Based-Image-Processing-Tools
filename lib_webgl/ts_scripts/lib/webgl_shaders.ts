var Shaders = {
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
        '}\n'
}