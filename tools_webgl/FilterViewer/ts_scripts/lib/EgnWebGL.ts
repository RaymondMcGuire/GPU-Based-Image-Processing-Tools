/* =========================================================================
 *
 *  EgnWebGL.ts
 *  construct a webgl environment
 *  v0.1
 *  
 * ========================================================================= */
/// <reference path="../../../../lib_webgl/ts_scripts/lib/cv_imread.ts" />
/// <reference path="../../../../lib_webgl/ts_scripts/lib/cv_colorSpace.ts" />
/// <reference path="../../../../lib_webgl/ts_scripts/lib/extra_utils.ts" />
/// <reference path="../../../../lib_webgl/ts_scripts/lib/webgl_matrix.ts" />
/// <reference path="../../../../lib_webgl/ts_scripts/lib/webgl_quaternion.ts" />
/// <reference path="../../../../lib_webgl/ts_scripts/lib/webgl_utils.ts" />
/// <reference path="../../../../lib_webgl/ts_scripts/lib/webgl_shaders.ts" />
/// <reference path="../../../../lib_webgl/ts_scripts/lib/webgl_model.ts" />
/// <reference path="../lib/HashSet.ts" />
module EcognitaWeb3D {
    declare var gl: any;
    declare var Stats: any;

    export class WebGLEnv {
        canvas: any;
        stats: any;

        shaders: any;
        uniLocations: any;
        framebuffers: any;

        matUtil: any;
        quatUtil: any;
        uiUtil: any;
        ui_data: any;
        extHammer: any;

        Texture: Utils.HashSet<any>;
        vbo: Array<any>;
        ibo: Array<any>;
        MATRIX: Utils.HashSet<any>;

        loadTexture(file_name: string, isFloat: boolean = false, glType: any = gl.CLAMP_TO_EDGE, glInterType: any = gl.LINEAR, useMipmap: boolean = true) {
            var tex = null;
            var image = EcognitaMathLib.imread(file_name);
            image.onload = (() => {
                tex = new EcognitaMathLib.WebGL_Texture(4, isFloat, image, glType, glInterType, useMipmap);
                this.Texture.set(file_name, tex);
            });
        }

        chkWebGLEnv(cvs) {
            this.canvas = cvs;
            try {
                gl = this.canvas.getContext("webgl") || this.canvas.getContext("experimental-webgl");
                this.stats = new Stats();
                document.body.appendChild(this.stats.dom);
            } catch (e) { }
            if (!gl)
                throw new Error("Could not initialise WebGL");
        }

        constructor(cvs: any, shaderlist: Array<string>) {
            this.chkWebGLEnv(cvs);
            this.initGlobalVariables();
            this.loadAssets();
            this.loadExtraLibrary();
            this.loadInternalLibrary(shaderlist);
            this.initGlobalMatrix();
        }

        initGlobalVariables() {
            this.vbo = new Array<any>();
            this.ibo = new Array<any>();
            this.Texture = new Utils.HashSet<any>();
            this.matUtil = new EcognitaMathLib.WebGLMatrix();
            this.quatUtil = new EcognitaMathLib.WebGLQuaternion();
        }

        initGlobalMatrix() {
            this.MATRIX = new Utils.HashSet<any>();
            var m = this.matUtil;
            this.MATRIX.set("mMatrix", m.identity(m.create()));
            this.MATRIX.set("vMatrix", m.identity(m.create()));
            this.MATRIX.set("pMatrix", m.identity(m.create()));
            this.MATRIX.set("vpMatrix", m.identity(m.create()));
            this.MATRIX.set("mvpMatrix", m.identity(m.create()));
            this.MATRIX.set("invMatrix", m.identity(m.create()));
        }

        loadAssets() {
            //load demo texture
            this.loadTexture("./image/k0.png", false, gl.CLAMP_TO_BORDER);
            this.loadTexture("./image/visual_rgb.png");
            this.loadTexture("./image/cat.jpg", false, gl.CLAMP_TO_EDGE);
            this.loadTexture("./image/lion.png", false, gl.CLAMP_TO_EDGE);
            this.loadTexture("./image/anim.png", false, gl.CLAMP_TO_EDGE, gl.NEAREST);

        }

        loadExtraLibrary() {
            this.ui_data = {
                name: 'Filter Viewer',
                useTexture: false,
                f_AnisotropicVisual: false,
                f_LaplacianFilter: false,
                f_GaussianFilter: false,
                f_SobelFilter: true,
                f_KuwaharaFilter: false,
                f_GeneralizedKuwaharaFilter: false,
                f_BloomEffect: false
            };

            //load extral library
            this.uiUtil = new Utils.FilterViewerUI(this.ui_data);
            this.extHammer = new EcognitaMathLib.Hammer_Utils(this.canvas);
        }

        loadInternalLibrary(shaderlist: any) {
            //load internal library
            this.framebuffers = new Utils.HashSet<EcognitaMathLib.WebGL_FrameBuffer>();

            //init shaders and uniLocations
            this.shaders = new Utils.HashSet<EcognitaMathLib.WebGL_Shader>();
            this.uniLocations = new Utils.HashSet<Array<any>>();
            shaderlist.forEach(shaderName => {
                var shader = new EcognitaMathLib.WebGL_Shader(Shaders, shaderName + "-vert", shaderName + "-frag");
                this.shaders.set(shaderName, shader);
                this.uniLocations.set(shaderName, new Array<any>());
            });
        }
    }

}