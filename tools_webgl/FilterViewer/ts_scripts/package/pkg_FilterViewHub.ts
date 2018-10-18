/* =========================================================================
 *
 *  FilterViewHub.ts
 *  pkg for filter viewer 
 *  v0.1
 *  
 * ========================================================================= */
/// <reference path="../lib/EgnType.ts" />
/// <reference path="../lib/EgnWebGL.ts" />

module EcognitaWeb3D {
    declare var gl: any;

    export class FilterViewer extends WebGLEnv {
        usrFilter: any;
        usrPipeLine: any;

        usrQuaternion: any;
        usrParams: any;
        uiData:any;

        filterMvpMatrix: any;
        filterShader: any;

        btnStatusList: Utils.HashSet<any>;

        constructor(cvs: any) {

            super(cvs);

        }

        getReqQuery() {
            if (window.location.href.split('?').length == 1) {
                return {};
            }
            var queryString = window.location.href.split('?')[1];
        
            var queryObj = {};
        
            if (queryString != '') {
                var querys = queryString.split("&");
                for (var i = 0; i < querys.length; i++) {
                    var key = querys[i].split('=')[0];
                    var value = querys[i].split('=')[1];
                    queryObj[key] = value;
                }
            }
            return queryObj;
        }

        regisButton(btn_data: any) {
            this.btnStatusList = new Utils.HashSet<any>();

            //init button
            btn_data.forEach(btn => {
                this.btnStatusList.set(btn.name, this.ui_data[btn.name]);

                //register button event
                this.uiUtil.uiController.get(btn.name).onChange((val) => {
                    this.usrSelectChange(btn.name, val, RenderPipeLine[btn.pipline], Filter[btn.filter], btn.shader);
                });
            });

        }

        regisUniforms(shader_data: any) {
            shader_data.forEach(shader => {
                var uniform_array = new Array<string>();
                var shaderUniforms = shader.uniforms;
                shaderUniforms.forEach(uniform => {
                    uniform_array.push(uniform);
                });
                this.settingUniform(shader.name, uniform_array);
            });

        }

        regisUserParam(user_config: any) {
            this.filterMvpMatrix = this.matUtil.identity(this.matUtil.create());
            this.usrParams = user_config.user_params;
            var default_btn_name = user_config.default_btn;

            var params = <any>this.getReqQuery();
            if (params.p == null || params.f == null || params.s == null || params.b == null) {
                this.usrPipeLine = RenderPipeLine[user_config.default_pipline];
                this.usrFilter = Filter[user_config.default_filter];
                this.filterShader = this.shaders.get(user_config.default_shader);
            }else{
                this.usrPipeLine = RenderPipeLine[params.p];
                this.usrFilter = Filter[params.f];
                this.filterShader = this.shaders.get(params.s);
                default_btn_name = params.b;
            }

            this.uiData[default_btn_name] = true;
        }

        initialize(ui_data: any, shader_data: any, button_data: any, user_config: any) {
            this.uiData = ui_data;

            this.initGlobalVariables();
            this.loadAssets();
            this.loadInternalLibrary(shader_data.shaderList);
            this.regisUniforms(shader_data.shaderList);
            this.regisUserParam(user_config);
            this.loadExtraLibrary(ui_data);
            this.initGlobalMatrix();
            this.regisButton(button_data.buttonList);
            this.initModel();
            this.regisEvent();
            this.settingRenderPipeline();
            this.regisAnimeFunc();
        }

        initModel() {
            //scene model : torus
            var torusData = new EcognitaMathLib.TorusModel(64, 64, 1.0, 2.0, [1.0, 1.0, 1.0, 1.0], true, false);
            var vbo_torus = new EcognitaMathLib.WebGL_VertexBuffer();
            var ibo_torus = new EcognitaMathLib.WebGL_IndexBuffer();
            this.vbo.push(vbo_torus);
            this.ibo.push(ibo_torus);

            vbo_torus.addAttribute("position", 3, gl.FLOAT, false);
            vbo_torus.addAttribute("normal", 3, gl.FLOAT, false);
            vbo_torus.addAttribute("color", 4, gl.FLOAT, false);

            vbo_torus.init(torusData.data.length / 10);
            vbo_torus.copy(torusData.data);

            ibo_torus.init(torusData.index);

            var position = [
                -1.0, 1.0, 0.0,
                1.0, 1.0, 0.0,
                -1.0, -1.0, 0.0,
                1.0, -1.0, 0.0
            ];

            var boardData = new EcognitaMathLib.BoardModel(position, undefined, false, false, true);
            var vbo_board = new EcognitaMathLib.WebGL_VertexBuffer();
            var ibo_board = new EcognitaMathLib.WebGL_IndexBuffer();
            this.vbo.push(vbo_board);
            this.ibo.push(ibo_board);

            vbo_board.addAttribute("position", 3, gl.FLOAT, false);
            vbo_board.addAttribute("texCoord", 2, gl.FLOAT, false);

            boardData.index = [
                0, 2, 1,
                2, 3, 1
            ];

            vbo_board.init(boardData.data.length / 5);
            vbo_board.copy(boardData.data);
            ibo_board.init(boardData.index);
        }

        renderGaussianFilter(horizontal: boolean, b_gaussian: boolean) {
            var GaussianFilterUniformLoc = this.uniLocations.get("gaussianFilter");
            gl.uniformMatrix4fv(GaussianFilterUniformLoc[0], false, this.filterMvpMatrix);
            gl.uniform1i(GaussianFilterUniformLoc[1], 0);
            gl.uniform1fv(GaussianFilterUniformLoc[2], this.usrParams.gaussianWeight);
            gl.uniform1i(GaussianFilterUniformLoc[3], horizontal);
            gl.uniform1f(GaussianFilterUniformLoc[4], this.canvas.height);
            gl.uniform1f(GaussianFilterUniformLoc[5], this.canvas.width);
            gl.uniform1i(GaussianFilterUniformLoc[6], b_gaussian);
        }
        //user config
        renderFilter() {
            if (this.usrFilter == Filter.LAPLACIAN) {
                var LapFilterUniformLoc = this.uniLocations.get("laplacianFilter");
                gl.uniformMatrix4fv(LapFilterUniformLoc[0], false, this.filterMvpMatrix);
                gl.uniform1i(LapFilterUniformLoc[1], 0);
                gl.uniform1fv(LapFilterUniformLoc[2], this.usrParams.laplacianCoef);
                gl.uniform1f(LapFilterUniformLoc[3], this.canvas.height);
                gl.uniform1f(LapFilterUniformLoc[4], this.canvas.width);
                gl.uniform1i(LapFilterUniformLoc[5], this.btnStatusList.get("f_LaplacianFilter"));
            } else if (this.usrFilter == Filter.SOBEL) {
                var SobelFilterUniformLoc = this.uniLocations.get("sobelFilter");
                gl.uniformMatrix4fv(SobelFilterUniformLoc[0], false, this.filterMvpMatrix);
                gl.uniform1i(SobelFilterUniformLoc[1], 0);
                gl.uniform1fv(SobelFilterUniformLoc[2], this.usrParams.sobelHorCoef);
                gl.uniform1fv(SobelFilterUniformLoc[3], this.usrParams.sobelVerCoef);
                gl.uniform1f(SobelFilterUniformLoc[4], this.canvas.height);
                gl.uniform1f(SobelFilterUniformLoc[5], this.canvas.width);
                gl.uniform1i(SobelFilterUniformLoc[6], this.btnStatusList.get("f_SobelFilter"));
            } else if (this.usrFilter == Filter.KUWAHARA) {
                var KuwaharaFilterUniformLoc = this.uniLocations.get("kuwaharaFilter");
                gl.uniformMatrix4fv(KuwaharaFilterUniformLoc[0], false, this.filterMvpMatrix);
                gl.uniform1i(KuwaharaFilterUniformLoc[1], 0);
                gl.uniform1f(KuwaharaFilterUniformLoc[2], this.canvas.height);
                gl.uniform1f(KuwaharaFilterUniformLoc[3], this.canvas.width);
                gl.uniform1i(KuwaharaFilterUniformLoc[4], this.btnStatusList.get("f_KuwaharaFilter"));
            } else if (this.usrFilter == Filter.GKUWAHARA) {
                var GKuwaharaFilterUniformLoc = this.uniLocations.get("gkuwaharaFilter");
                gl.uniformMatrix4fv(GKuwaharaFilterUniformLoc[0], false, this.filterMvpMatrix);
                gl.uniform1i(GKuwaharaFilterUniformLoc[1], 0);
                gl.uniform1fv(GKuwaharaFilterUniformLoc[2], this.usrParams.gkweight);
                gl.uniform1f(GKuwaharaFilterUniformLoc[3], this.canvas.height);
                gl.uniform1f(GKuwaharaFilterUniformLoc[4], this.canvas.width);
                gl.uniform1i(GKuwaharaFilterUniformLoc[5], this.btnStatusList.get("f_GeneralizedKuwaharaFilter"));
            } else if (this.usrFilter == Filter.ANISTROPIC) {
                var AnisotropicFilterUniformLoc = this.uniLocations.get("Anisotropic");
                gl.uniformMatrix4fv(AnisotropicFilterUniformLoc[0], false, this.filterMvpMatrix);
                gl.uniform1i(AnisotropicFilterUniformLoc[1], 0);
                gl.uniform1i(AnisotropicFilterUniformLoc[2], 1);
                gl.uniform1i(AnisotropicFilterUniformLoc[3], 2);
                gl.uniform1f(AnisotropicFilterUniformLoc[4], this.canvas.height);
                gl.uniform1f(AnisotropicFilterUniformLoc[5], this.canvas.width);
                gl.uniform1i(AnisotropicFilterUniformLoc[6], this.btnStatusList.get("f_VisualAnisotropic"));

            } else if (this.usrFilter == Filter.AKUWAHARA) {
                var AKFUniformLoc = this.uniLocations.get("AKF");
                gl.uniformMatrix4fv(AKFUniformLoc[0], false, this.filterMvpMatrix);
                gl.uniform1i(AKFUniformLoc[1], 0);
                gl.uniform1i(AKFUniformLoc[2], 1);
                gl.uniform1i(AKFUniformLoc[3], 2);
                gl.uniform1f(AKFUniformLoc[4], 6.0);
                gl.uniform1f(AKFUniformLoc[5], 8.0);
                gl.uniform1f(AKFUniformLoc[6], 1.0);
                gl.uniform1f(AKFUniformLoc[7], this.canvas.height);
                gl.uniform1f(AKFUniformLoc[8], this.canvas.width);
                gl.uniform1i(AKFUniformLoc[9], this.btnStatusList.get("f_AnisotropicKuwahara"));
            } else if(this.usrFilter == Filter.LIC || this.usrFilter == Filter.NOISELIC){
                var LICUniformLoc = this.uniLocations.get("LIC");
                gl.uniformMatrix4fv(LICUniformLoc[0], false, this.filterMvpMatrix);
                gl.uniform1i(LICUniformLoc[1], 0);
                gl.uniform1i(LICUniformLoc[2], 1);
                gl.uniform1f(LICUniformLoc[3], 3.0);
                gl.uniform1f(LICUniformLoc[4], this.canvas.height);
                gl.uniform1f(LICUniformLoc[5], this.canvas.width);

                if(this.usrFilter == Filter.LIC){
                    gl.uniform1i(LICUniformLoc[6], this.btnStatusList.get("f_LIC"));  
                }else if(this.usrFilter == Filter.NOISELIC){
                    gl.uniform1i(LICUniformLoc[6], this.btnStatusList.get("f_NoiseLIC"));  
                }
                
            }
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

        settingUniform(shaderName: string, uniformIndexArray: Array<string>) {

            var uniLocArray = this.uniLocations.get(shaderName);
            var shader = this.shaders.get(shaderName);
            uniformIndexArray.forEach(uniName => {
                uniLocArray.push(shader.uniformIndex(uniName));
            });
        }

        settingRenderPipeline() {
            gl.enable(gl.DEPTH_TEST);
            gl.depthFunc(gl.LEQUAL);
            gl.enable(gl.CULL_FACE);
        }

        usrSelectChange(btnName: string, val: any, pipeline: any, filter: any, filter_name: any) {
            this.btnStatusList.set(btnName, val);

            if (val) {
                this.usrPipeLine = pipeline;
                this.usrFilter = filter;
                this.filterShader = this.shaders.get(filter_name);

                for (var key in this.ui_data) {
                    if ((<any>key).includes('_')) {
                        let f_name = key.split("_");
                        if (f_name[0] == "f" && key != btnName) {
                            //un select other btn
                            this.btnStatusList.set(key, !val);
                            this.ui_data[key] = !val;
                        }
                    }
                }
            }
        }

        regisEvent() {
            var lastPosX = 0;
            var lastPosY = 0;
            var isDragging = false;
            var hammer = this.extHammer;
            hammer.on_pan = (ev) => {
                var elem = ev.target;
                if (!isDragging) {
                    isDragging = true;
                    lastPosX = elem.offsetLeft;
                    lastPosY = elem.offsetTop;
                }

                var posX = ev.center.x - lastPosX;
                var posY = ev.center.y - lastPosY;

                var cw = this.canvas.width;
                var ch = this.canvas.height;
                var wh = 1 / Math.sqrt(cw * cw + ch * ch);
                var x = posX - cw * 0.5;
                var y = posY - ch * 0.5;
                var sq = Math.sqrt(x * x + y * y);
                var r = sq * 2.0 * Math.PI * wh;
                if (sq != 1) {
                    sq = 1 / sq;
                    x *= sq;
                    y *= sq;
                }

                this.usrQuaternion = this.quatUtil.rotate(r, [y, x, 0.0]);

                if (ev.isFinal) {
                    isDragging = false;
                }
            }
            hammer.enablePan();
        }

        regisAnimeFunc() {

            //fundmental setting and variables
            var cnt = 0;
            var cnt1 = 0;



            var lightDirection = [-0.577, 0.577, 0.577];
            var m = this.matUtil;
            var q = this.quatUtil;
            this.usrQuaternion = q.identity(q.create());

            //init scene and model
            var sceneShader = this.shaders.get("filterScene");
            var sceneUniformLoc = this.uniLocations.get("filterScene");

            var vbo_torus = this.vbo[0];
            var ibo_torus = this.ibo[0];

            var vbo_board = this.vbo[1];
            var ibo_board = this.ibo[1];

            var mMatrix = this.MATRIX.get("mMatrix");
            var vMatrix = this.MATRIX.get("vMatrix");
            var pMatrix = this.MATRIX.get("pMatrix");
            var vpMatrix = this.MATRIX.get("vpMatrix");
            var mvpMatrix = this.MATRIX.get("mvpMatrix");
            var invMatrix = this.MATRIX.get("invMatrix");


            //------------------------------------user config
            var specCptShader = this.shaders.get("specCpt");
            var uniLocation_spec = this.uniLocations.get("specCpt");

            var synthShader = this.shaders.get("synth");
            var uniLocation_synth = this.uniLocations.get("synth");

            //anisotropic
            var SSTShader = this.shaders.get("SST");
            var uniLocation_SST = this.uniLocations.get("SST");

            var GAUShader = this.shaders.get("Gaussian_K");
            var uniLocation_GAU = this.uniLocations.get("Gaussian_K");

            var TFMShader = this.shaders.get("TFM");
            var uniLocation_TFM = this.uniLocations.get("TFM");
            //-----------------------------------------------

            this.settingFrameBuffer("frameBuffer1");
            var frameBuffer1 = this.framebuffers.get("frameBuffer1");
            this.settingFrameBuffer("frameBuffer2");
            var frameBuffer2 = this.framebuffers.get("frameBuffer2");

            var loop = () => {
                //--------------------------------------animation global variables
                this.stats.begin();

                cnt++;
                if (cnt % 2 == 0) { cnt1++; }
                var rad = (cnt % 360) * Math.PI / 180;
                var eyePosition = new Array();
                var camUpDirection = new Array();

                eyePosition = q.ToV3([0.0, 20.0, 0.0], this.usrQuaternion);
                camUpDirection = q.ToV3([0.0, 0.0, -1.0], this.usrQuaternion);

                //camera setting
                vMatrix = m.viewMatrix(eyePosition, [0, 0, 0], camUpDirection);
                pMatrix = m.perspectiveMatrix(90, this.canvas.width / this.canvas.height, 0.1, 100);
                vpMatrix = m.multiply(pMatrix, vMatrix);


                // orth matrix
                vMatrix = m.viewMatrix([0.0, 0.0, 0.5], [0.0, 0.0, 0.0], [0.0, 1.0, 0.0]);
                pMatrix = m.orthoMatrix(-1.0, 1.0, 1.0, -1.0, 0.1, 1);
                this.filterMvpMatrix = m.multiply(pMatrix, vMatrix);
                //--------------------------------------animation global variables

                //rendering parts----------------------------------------------------------------------------------

                var inTex = this.Texture.get("./image/lion.png");

                if (this.usrPipeLine == RenderPipeLine.CONVOLUTION_FILTER) {
                    //---------------------using framebuffer1 to render scene and save result to texture0
                    frameBuffer1.bindFrameBuffer();
                    RenderSimpleScene();
                    gl.activeTexture(gl.TEXTURE0);
                    if (inTex != undefined && this.ui_data.useTexture) {
                        inTex.bind(inTex.texture);
                    } else {
                        gl.bindTexture(gl.TEXTURE_2D, frameBuffer1.targetTexture);
                    }

                    //---------------------using framebuffer1 to render scene and save result to texture0


                    //---------------------rendering texture0 to a board and show it in screen
                    this.filterShader.bind();
                    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
                    gl.clearColor(0.0, 0.0, 0.0, 1.0);
                    gl.clearDepth(1.0);
                    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
                    //draw filter image into board
                    vbo_board.bind(this.filterShader);
                    ibo_board.bind();
                    this.renderFilter();
                    ibo_board.draw(gl.TRIANGLES);
                    //---------------------rendering texture0 to a board and show it in screen
                } else if (this.usrPipeLine == RenderPipeLine.BLOOM_EFFECT) {
                    //render torus specular component, save to frame1  
                    specCptShader.bind();
                    frameBuffer1.bindFrameBuffer();
                    RenderSimpleSceneSpecularParts();
                    gl.activeTexture(gl.TEXTURE0);
                    gl.bindTexture(gl.TEXTURE_2D, frameBuffer1.targetTexture);

                    //horizontal blur, save to frame2
                    this.filterShader.bind();
                    frameBuffer2.bindFrameBuffer();
                    gl.clearColor(0.0, 0.0, 0.0, 1.0);
                    gl.clearDepth(1.0);
                    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
                    vbo_board.bind(this.filterShader);
                    ibo_board.bind();
                    this.renderGaussianFilter(true, this.btnStatusList.get("f_BloomEffect"));
                    ibo_board.draw(gl.TRIANGLES);

                    gl.bindTexture(gl.TEXTURE_2D, frameBuffer2.targetTexture);

                    //vertical blur,save to frame1 and render to texture1
                    frameBuffer1.bindFrameBuffer();
                    this.renderGaussianFilter(false, this.btnStatusList.get("f_BloomEffect"));
                    ibo_board.draw(gl.TRIANGLES);

                    gl.activeTexture(gl.TEXTURE1);
                    gl.bindTexture(gl.TEXTURE_2D, frameBuffer1.targetTexture);

                    //render scene, save to texture0
                    frameBuffer2.bindFrameBuffer();
                    RenderSimpleScene();
                    gl.activeTexture(gl.TEXTURE0);
                    gl.bindTexture(gl.TEXTURE_2D, frameBuffer2.targetTexture);

                    //synthsis texture0 and texture1
                    synthShader.bind();
                    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

                    gl.clearColor(0.0, 0.0, 0.0, 1.0);
                    gl.clearDepth(1.0);
                    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

                    //render texture to board and show this board to user		
                    vbo_board.bind(synthShader);
                    ibo_board.bind();
                    gl.uniformMatrix4fv(uniLocation_synth[0], false, this.filterMvpMatrix);
                    gl.uniform1i(uniLocation_synth[1], 0);
                    gl.uniform1i(uniLocation_synth[2], 1);
                    gl.uniform1i(uniLocation_synth[3], this.btnStatusList.get("f_BloomEffect"));
                    ibo_board.draw(gl.TRIANGLES);
                } else if (this.usrPipeLine == RenderPipeLine.CONVOLUTION_TWICE) {
                    //---------------------using framebuffer1 to render scene and save result to texture0

                    frameBuffer1.bindFrameBuffer();
                    RenderSimpleScene();
                    gl.activeTexture(gl.TEXTURE0);
                    if (inTex != undefined && this.ui_data.useTexture) {
                        inTex.bind(inTex.texture);
                    } else {
                        gl.bindTexture(gl.TEXTURE_2D, frameBuffer1.targetTexture);
                    }

                    //horizontal blur, save to frame2
                    this.filterShader.bind();
                    if (this.btnStatusList.get("f_GaussianFilter")) {
                        frameBuffer2.bindFrameBuffer();
                        gl.clearColor(0.0, 0.0, 0.0, 1.0);
                        gl.clearDepth(1.0);
                        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
                        vbo_board.bind(this.filterShader);
                        ibo_board.bind();
                        this.renderGaussianFilter(true, this.btnStatusList.get("f_GaussianFilter"));
                        ibo_board.draw(gl.TRIANGLES);

                        gl.bindTexture(gl.TEXTURE_2D, frameBuffer2.targetTexture);
                        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

                        gl.clearColor(0.0, 0.0, 0.0, 1.0);
                        gl.clearDepth(1.0);
                        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
                        vbo_board.bind(this.filterShader);
                        ibo_board.bind();
                        this.renderGaussianFilter(false, this.btnStatusList.get("f_GaussianFilter"));
                    } else {
                        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
                        gl.clearColor(0.0, 0.0, 0.0, 1.0);
                        gl.clearDepth(1.0);
                        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
                        vbo_board.bind(this.filterShader);
                        ibo_board.bind();
                        this.renderGaussianFilter(false, this.btnStatusList.get("f_GaussianFilter"));
                    }
                    ibo_board.draw(gl.TRIANGLES);

                } else if (this.usrPipeLine == RenderPipeLine.ANISTROPIC) {


                    if (this.usrFilter == Filter.ANISTROPIC) {
                        var visTex = this.Texture.get("./image/visual_rgb.png");
                        if (visTex != undefined) {
                            gl.activeTexture(gl.TEXTURE2);
                            visTex.bind(visTex.texture);
                        }
                    } else if (this.usrFilter == Filter.AKUWAHARA) {
                        //save k0 texture to tex2
                        var k0Tex = this.Texture.get("./image/k0.png");
                        if (k0Tex != undefined) {
                            gl.activeTexture(gl.TEXTURE2);
                            k0Tex.bind(k0Tex.texture);
                        }
                    }



                    //render SRC
                    frameBuffer1.bindFrameBuffer();
                    RenderSimpleScene();

                    //render anisotropic save to tex0
                    gl.activeTexture(gl.TEXTURE0);
                    if (inTex != undefined && this.ui_data.useTexture) {
                        inTex.bind(inTex.texture);
                    } else {
                        gl.bindTexture(gl.TEXTURE_2D, frameBuffer1.targetTexture);
                    }



                    //render SST
                    SSTShader.bind();
                    frameBuffer2.bindFrameBuffer();

                    gl.clearColor(0.0, 0.0, 0.0, 1.0);
                    gl.clearDepth(1.0);
                    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
                    vbo_board.bind(SSTShader);
                    ibo_board.bind();
                    gl.uniformMatrix4fv(uniLocation_SST[0], false, this.filterMvpMatrix);
                    gl.uniform1i(uniLocation_SST[1], 0);
                    gl.uniform1f(uniLocation_SST[2], this.canvas.height);
                    gl.uniform1f(uniLocation_SST[3], this.canvas.width);
                    ibo_board.draw(gl.TRIANGLES);

                    gl.bindTexture(gl.TEXTURE_2D, frameBuffer2.targetTexture);

                    //render Gaussian
                    GAUShader.bind();
                    frameBuffer1.bindFrameBuffer();
                    gl.clearColor(0.0, 0.0, 0.0, 1.0);
                    gl.clearDepth(1.0);
                    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
                    vbo_board.bind(GAUShader);
                    ibo_board.bind();
                    gl.uniformMatrix4fv(uniLocation_GAU[0], false, this.filterMvpMatrix);
                    gl.uniform1i(uniLocation_GAU[1], 0);
                    gl.uniform1f(uniLocation_GAU[2], 2.0);
                    gl.uniform1f(uniLocation_GAU[3], this.canvas.height);
                    gl.uniform1f(uniLocation_GAU[4], this.canvas.width);
                    ibo_board.draw(gl.TRIANGLES);

                    gl.bindTexture(gl.TEXTURE_2D, frameBuffer1.targetTexture);

                    //render TFM
                    TFMShader.bind();
                    frameBuffer2.bindFrameBuffer();
                    gl.clearColor(0.0, 0.0, 0.0, 1.0);
                    gl.clearDepth(1.0);
                    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
                    vbo_board.bind(TFMShader);
                    ibo_board.bind();
                    gl.uniformMatrix4fv(uniLocation_TFM[0], false, this.filterMvpMatrix);
                    gl.uniform1i(uniLocation_TFM[1], 0);
                    gl.uniform1f(uniLocation_TFM[2], this.canvas.height);
                    gl.uniform1f(uniLocation_TFM[3], this.canvas.width);
                    ibo_board.draw(gl.TRIANGLES);

                    gl.bindTexture(gl.TEXTURE_2D, frameBuffer2.targetTexture);

                    frameBuffer1.bindFrameBuffer();
                    RenderSimpleScene();
                    //save original texture to tex1
                    gl.activeTexture(gl.TEXTURE1);

                    if(this.usrFilter == Filter.NOISELIC){

                        var noiseTex = this.Texture.get("./image/noise.png");
                        if (noiseTex != undefined) {
                            noiseTex.bind(noiseTex.texture);
                        }
                    }else{
                        if (inTex != undefined && this.ui_data.useTexture) {
                            inTex.bind(inTex.texture);
                        } else {
                            gl.bindTexture(gl.TEXTURE_2D, frameBuffer1.targetTexture);
                        }
                    }




                    //render Anisotropic
                    this.filterShader.bind();
                    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
                    gl.clearColor(0.0, 0.0, 0.0, 1.0);
                    gl.clearDepth(1.0);
                    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
                    vbo_board.bind(this.filterShader);
                    ibo_board.bind();
                    this.renderFilter();
                    ibo_board.draw(gl.TRIANGLES);
                }

                //rendering parts----------------------------------------------------------------------------------

                //--------------------------------------animation global variables
                gl.flush();
                this.stats.end();
                requestAnimationFrame(loop);


                function RenderSimpleScene() {
                    sceneShader.bind();
                    var hsv = EcognitaMathLib.HSV2RGB(cnt1 % 360, 1, 1, 1);
                    gl.clearColor(hsv[0], hsv[1], hsv[2], hsv[3]);
                    gl.clearDepth(1.0);
                    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

                    vbo_torus.bind(sceneShader);
                    ibo_torus.bind();
                    for (var i = 0; i < 9; i++) {
                        var amb = EcognitaMathLib.HSV2RGB(i * 40, 1, 1, 1);
                        mMatrix = m.identity(mMatrix);
                        mMatrix = m.rotate(mMatrix, i * 2 * Math.PI / 9, [0, 1, 0]);
                        mMatrix = m.translate(mMatrix, [0.0, 0.0, 10.0]);
                        mMatrix = m.rotate(mMatrix, rad, [1, 1, 0]);
                        mvpMatrix = m.multiply(vpMatrix, mMatrix);
                        invMatrix = m.inverse(mMatrix);
                        gl.uniformMatrix4fv(sceneUniformLoc[0], false, mvpMatrix);
                        gl.uniformMatrix4fv(sceneUniformLoc[1], false, invMatrix);
                        gl.uniform3fv(sceneUniformLoc[2], lightDirection);
                        gl.uniform3fv(sceneUniformLoc[3], eyePosition);
                        gl.uniform4fv(sceneUniformLoc[4], amb);
                        ibo_torus.draw(gl.TRIANGLES);
                    }
                }

                function RenderSimpleSceneSpecularParts() {
                    gl.clearColor(0.0, 0.0, 0.0, 1.0);
                    gl.clearDepth(1.0);
                    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

                    vbo_torus.bind(specCptShader);
                    ibo_torus.bind();
                    for (var i = 0; i < 9; i++) {
                        mMatrix = m.identity(mMatrix);
                        mMatrix = m.rotate(mMatrix, i * 2 * Math.PI / 9, [0, 1, 0]);
                        mMatrix = m.translate(mMatrix, [0.0, 0.0, 10.0]);
                        mMatrix = m.rotate(mMatrix, rad, [1, 1, 0]);
                        mvpMatrix = m.multiply(vpMatrix, mMatrix);
                        invMatrix = m.inverse(mMatrix);
                        gl.uniformMatrix4fv(uniLocation_spec[0], false, mvpMatrix);
                        gl.uniformMatrix4fv(uniLocation_spec[1], false, invMatrix);
                        gl.uniform3fv(uniLocation_spec[2], lightDirection);
                        gl.uniform3fv(uniLocation_spec[3], eyePosition);
                        ibo_torus.draw(gl.TRIANGLES);
                    }
                }
                //--------------------------------------animation global variables
            };

            loop();
        }
    }
}