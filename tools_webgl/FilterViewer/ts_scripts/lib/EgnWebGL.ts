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
/// <reference path="../lib/EgnFilterViewerUI.ts" />
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

        loadTexture(file_name: string, isFloat: boolean = false, glType: any = gl.CLAMP_TO_EDGE, glInterType: any = gl.LINEAR, useMipmap: boolean = true, channel: number = 4) {
            var tex = null;
            var image = EcognitaMathLib.imread(file_name);
            image.onload = (() => {
                tex = new EcognitaMathLib.WebGL_Texture(channel, isFloat, image, glType, glInterType, useMipmap);
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

            //check extension
            var ext = gl.getExtension('OES_texture_float');
            if (ext == null) {
                throw new Error("float texture not supported");
            }
        }

        constructor(cvs: any) {
            this.chkWebGLEnv(cvs);
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

        loadExtraLibrary(ui_data: any) {
            this.ui_data = ui_data;
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
            shaderlist.forEach(s => {
                var shader = new EcognitaMathLib.WebGL_Shader(Shaders, s.name + "-vert", s.name + "-frag");
                this.shaders.set(s.name, shader);
                this.uniLocations.set(s.name, new Array<any>());
            });
        }

        settingFrameBuffer(frameBufferName: string) {
            //frame buffer
            var fBufferWidth = this.canvas.width;
            var fBufferHeight = this.canvas.height;
            var frameBuffer = new EcognitaMathLib.WebGL_FrameBuffer(fBufferWidth, fBufferHeight);
            frameBuffer.bindFrameBuffer();
            frameBuffer.bindDepthBuffer();
            //frameBuffer.renderToShadowTexure();
            frameBuffer.renderToFloatTexure();
            frameBuffer.release();
            this.framebuffers.set(frameBufferName, frameBuffer);
        }

        renderSceneByFrameBuffer(framebuffer:any,func:any,texid:any=gl.TEXTURE0){
            framebuffer.bindFrameBuffer();
            func();
            gl.activeTexture(texid);
            gl.bindTexture(gl.TEXTURE_2D, framebuffer.targetTexture);
        }

        renderBoardByFrameBuffer(shader:any,vbo:any,ibo:any,func:any,use_fb:boolean=false,texid:any=gl.TEXTURE0,fb:any=undefined){
            shader.bind();

            if(use_fb){
                fb.bindFrameBuffer();
            }else{
                gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            }

            gl.clearColor(0.0, 0.0, 0.0, 1.0);
            gl.clearDepth(1.0);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            vbo.bind(shader);
            ibo.bind();
            func();
            ibo.draw(gl.TRIANGLES);

            if(use_fb){
                gl.activeTexture(texid);
                gl.bindTexture(gl.TEXTURE_2D, fb.targetTexture);
            }
        }
    }

}