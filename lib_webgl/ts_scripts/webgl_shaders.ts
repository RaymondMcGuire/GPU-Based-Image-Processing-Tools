var Shaders = {
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
        '}\n'
}