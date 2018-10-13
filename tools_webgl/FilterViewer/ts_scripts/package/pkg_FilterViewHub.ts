/* =========================================================================
 *
 *  FilterViewHub.ts
 *  pkg for filter viewer 
 *  v0.1
 *  
 * ========================================================================= */
/// <reference path="../lib/FilterViewerUI.ts" />
/// <reference path="../lib/EgnType.ts" />
/// <reference path="../lib/EgnWebGL.ts" />

module EcognitaWeb3D {
    declare var gl: any;

    export class FilterViewer extends WebGLEnv {
        usrFilter:Filter;
        usrPipeLine:RenderPipeLine;

        usrQuaternion :any;
        usrParams: any;

        filterMvpMatrix:any;
        filterShader:any;

        btnStatusList:Utils.HashSet<any>;
        constructor(cvs:any){
            var shaderList = ["filterScene","specCpt","synth","laplacianFilter","sobelFilter","gaussianFilter","kuwaharaFilter","gkuwaharaFilter"];
            super(cvs,shaderList);

            //init gobal variable
            this.filterMvpMatrix = this.matUtil.identity(this.matUtil.create());
            this.usrPipeLine = RenderPipeLine.CONVOLUTION_FILTER;
            this.usrFilter = Filter.SOBEL;
            this.filterShader = this.shaders.get("sobelFilter");

            this.btnStatusList = new Utils.HashSet<any>();
            this.btnStatusList.set("f_LaplacianFilter",this.ui_data.f_LaplacianFilter);
            this.btnStatusList.set("f_SobelFilter",this.ui_data.f_SobelFilter);
            this.btnStatusList.set("f_BloomEffect",this.ui_data.f_BloomEffect);
            this.btnStatusList.set("f_GaussianFilter",this.ui_data.f_GaussianFilter);
            this.btnStatusList.set("f_KuwaharaFilter",this.ui_data.f_KuwaharaFilter);
            this.btnStatusList.set("f_GeneralizedKuwaharaFilter",this.ui_data.f_GeneralizedKuwaharaFilter);
            
            //gaussian weight
            var weight = new Array(10);
            var t = 0.0;
            var d = 50 * 50 / 100;
            for(var i = 0; i < weight.length; i++){
                var r = 1.0 + 2.0 * i;
                var w = Math.exp(-0.5 * (r * r) / d);
                weight[i] = w;
                if(i > 0){w *= 2.0;}
                t += w;
            }
            for(i = 0; i < weight.length; i++){
                weight[i] /= t;
            }

            //user config param (load params from file is better TODO)
            this.usrParams = {
                laplacianCoef :  [1.0,  1.0, 1.0,
                                  1.0, -8.0, 1.0,
                                  1.0,  1.0, 1.0],
                sobelHorCoef :   [1.0, 0.0, -1.0,
                                  2.0, 0.0, -2.0,
                                  1.0, 0.0, -1.0],
                       
                sobelVerCoef :  [ 1.0,  2.0,  1.0,
                                  0.0,  0.0,  0.0,
                                 -1.0, -2.0, -1.0],
                gaussianWeight : weight,

                gkweight :[0.8322 ,0.8758 ,0.903 ,0.9123 ,0.903 ,0.8758 ,0.8322 ,0.8758 ,0.9216 ,0.9503 ,0.96 ,0.9503 ,0.9216 ,0.8758 ,0.903 ,0.9503 ,0.9798 ,0.9898 ,0.9798 ,0.9503 ,0.903 ,0.9123 ,0.96 ,0.9898 ,1.0 ,0.9898 ,0.96 ,0.9123 ,0.903 ,0.9503 ,0.9798 ,0.9898 ,0.9798 ,0.9503 ,0.903 ,0.8758 ,0.9216 ,0.9503 ,0.96 ,0.9503 ,0.9216 ,0.8758 ,0.8322 ,0.8758 ,0.903 ,0.9123 ,0.903 ,0.8758 ,0.8322 ]
            };

            var laplacianFilterArray = new Array<string>();
            laplacianFilterArray.push("mvpMatrix");
            laplacianFilterArray.push("texture");
            laplacianFilterArray.push("coef");
            laplacianFilterArray.push("cvsHeight");
            laplacianFilterArray.push("cvsWidth");
            laplacianFilterArray.push("b_laplacian");
            this.settingUniform("laplacianFilter",laplacianFilterArray);

            var sobelFilterArray = new Array<string>();
            sobelFilterArray.push("mvpMatrix");
            sobelFilterArray.push("texture");
            sobelFilterArray.push("hCoef");
            sobelFilterArray.push("vCoef");
            sobelFilterArray.push("cvsHeight");
            sobelFilterArray.push("cvsWidth");
            sobelFilterArray.push("b_sobel");
            this.settingUniform("sobelFilter",sobelFilterArray);

            var gaussianFilterArray = new Array<string>();
            gaussianFilterArray.push("mvpMatrix");
            gaussianFilterArray.push("texture");
            gaussianFilterArray.push("weight");
            gaussianFilterArray.push("horizontal");
            gaussianFilterArray.push("cvsHeight");
            gaussianFilterArray.push("cvsWidth");
            gaussianFilterArray.push("b_gaussian");
            this.settingUniform("gaussianFilter",gaussianFilterArray);

            var kuwaharaFilterArray = new Array<string>();
            kuwaharaFilterArray.push("mvpMatrix");
            kuwaharaFilterArray.push("texture");
            kuwaharaFilterArray.push("cvsHeight");
            kuwaharaFilterArray.push("cvsWidth");
            kuwaharaFilterArray.push("b_kuwahara");
            this.settingUniform("kuwaharaFilter",kuwaharaFilterArray);

            var gkuwaharaFilterArray = new Array<string>();
            gkuwaharaFilterArray.push("mvpMatrix");
            gkuwaharaFilterArray.push("texture");
            gkuwaharaFilterArray.push("weight");
            gkuwaharaFilterArray.push("cvsHeight");
            gkuwaharaFilterArray.push("cvsWidth");
            gkuwaharaFilterArray.push("b_gkuwahara");
            this.settingUniform("gkuwaharaFilter",gkuwaharaFilterArray);

            var synthSceneArray = new Array<string>();
            synthSceneArray.push("mvpMatrix");
            synthSceneArray.push("texture1");
            synthSceneArray.push("texture2");
            synthSceneArray.push("glare");
            this.settingUniform("synth",synthSceneArray);

            //init System
            this.initModel();

            var filterSceneArray = new Array<string>();
            filterSceneArray.push("mvpMatrix");
            filterSceneArray.push("invMatrix");
            filterSceneArray.push("lightDirection");
            filterSceneArray.push("eyeDirection");
            filterSceneArray.push("ambientColor");
            this.settingUniform("filterScene",filterSceneArray);

            var specSceneArray = new Array<string>();
            specSceneArray.push("mvpMatrix");
            specSceneArray.push("invMatrix");
            specSceneArray.push("lightDirection");
            specSceneArray.push("eyeDirection");
            this.settingUniform("specCpt",specSceneArray);

            this.regisEvent();
            this.regisUIEvent();
            this.settingRenderPipeline();
            this.regisAnimeFunc();
        }

        initModel(){
            //scene model : torus
            var torusData = new EcognitaMathLib.TorusModel(64, 64, 1.0, 2.0,[1.0, 1.0, 1.0, 1.0],true,false); 
            var vbo_torus = new EcognitaMathLib.WebGL_VertexBuffer();
            var ibo_torus = new EcognitaMathLib.WebGL_IndexBuffer();
            this.vbo.push(vbo_torus);
            this.ibo.push(ibo_torus);

            vbo_torus.addAttribute("position", 3, gl.FLOAT, false);
            vbo_torus.addAttribute("normal", 3, gl.FLOAT, false);
            vbo_torus.addAttribute("color", 4, gl.FLOAT, false);

            vbo_torus.init(torusData.data.length/10);
            vbo_torus.copy(torusData.data);

            ibo_torus.init(torusData.index);

            var position = [
                -1.0,  1.0,  0.0,
                1.0,  1.0,  0.0,
                -1.0, -1.0,  0.0,
                1.0, -1.0,  0.0
            ];

            var boardData = new EcognitaMathLib.BoardModel(position,undefined,false,false,true); 
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

            vbo_board.init(boardData.data.length/5);
            vbo_board.copy(boardData.data);
            ibo_board.init(boardData.index);
        }

        renderGaussianFilter(horizontal:boolean,b_gaussian:boolean){
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
        renderFilter(){
            if(this.usrFilter == Filter.LAPLACIAN){
                var LapFilterUniformLoc = this.uniLocations.get("laplacianFilter");
                gl.uniformMatrix4fv(LapFilterUniformLoc[0], false, this.filterMvpMatrix);
                gl.uniform1i(LapFilterUniformLoc[1], 0);
                gl.uniform1fv(LapFilterUniformLoc[2], this.usrParams.laplacianCoef);
                gl.uniform1f(LapFilterUniformLoc[3], this.canvas.height);
                gl.uniform1f(LapFilterUniformLoc[4], this.canvas.width);
                gl.uniform1i(LapFilterUniformLoc[5], this.btnStatusList.get("f_LaplacianFilter"));
            }else if(this.usrFilter == Filter.SOBEL){
                var SobelFilterUniformLoc = this.uniLocations.get("sobelFilter");
                gl.uniformMatrix4fv(SobelFilterUniformLoc[0], false, this.filterMvpMatrix);
                gl.uniform1i(SobelFilterUniformLoc[1], 0);
                gl.uniform1fv(SobelFilterUniformLoc[2], this.usrParams.sobelHorCoef);
                gl.uniform1fv(SobelFilterUniformLoc[3], this.usrParams.sobelVerCoef);
                gl.uniform1f(SobelFilterUniformLoc[4], this.canvas.height);
                gl.uniform1f(SobelFilterUniformLoc[5], this.canvas.width);
                gl.uniform1i(SobelFilterUniformLoc[6], this.btnStatusList.get("f_SobelFilter"));
            }else if(this.usrFilter == Filter.KUWAHARA){
                var KuwaharaFilterUniformLoc = this.uniLocations.get("kuwaharaFilter");
                gl.uniformMatrix4fv(KuwaharaFilterUniformLoc[0], false, this.filterMvpMatrix);
                gl.uniform1i(KuwaharaFilterUniformLoc[1], 0);
                gl.uniform1f(KuwaharaFilterUniformLoc[2], this.canvas.height);
                gl.uniform1f(KuwaharaFilterUniformLoc[3], this.canvas.width);
                gl.uniform1i(KuwaharaFilterUniformLoc[4], this.btnStatusList.get("f_KuwaharaFilter"));
            }else if(this.usrFilter == Filter.GKUWAHARA){
                var GKuwaharaFilterUniformLoc = this.uniLocations.get("gkuwaharaFilter");
                gl.uniformMatrix4fv(GKuwaharaFilterUniformLoc[0], false, this.filterMvpMatrix);
                gl.uniform1i(GKuwaharaFilterUniformLoc[1], 0);
                gl.uniform1fv(GKuwaharaFilterUniformLoc[2], this.usrParams.gkweight);
                gl.uniform1f(GKuwaharaFilterUniformLoc[3], this.canvas.height);
                gl.uniform1f(GKuwaharaFilterUniformLoc[4], this.canvas.width);
                gl.uniform1i(GKuwaharaFilterUniformLoc[5], this.btnStatusList.get("f_GeneralizedKuwaharaFilter"));
            }

        }

        settingFrameBuffer(frameBufferName:string){
            //frame buffer
            var fBufferWidth  = this.canvas.width;
            var fBufferHeight = this.canvas.height;
            var frameBuffer = new EcognitaMathLib.WebGL_FrameBuffer(fBufferWidth,fBufferHeight);
            frameBuffer.bindFrameBuffer();
            frameBuffer.bindDepthBuffer();
            frameBuffer.renderToShadowTexure();
            frameBuffer.release();
            this.framebuffers.set(frameBufferName,frameBuffer);
        }

        settingUniform(shaderName:string,uniformIndexArray:Array<string>){

            var uniLocArray = this.uniLocations.get(shaderName);
            var shader = this.shaders.get(shaderName);
            uniformIndexArray.forEach(uniName => {
                uniLocArray.push(shader.uniformIndex(uniName));
            });
        }

        settingRenderPipeline(){
            gl.enable(gl.DEPTH_TEST);
            gl.depthFunc(gl.LEQUAL);
            gl.enable(gl.CULL_FACE); 
        }

        usrSelectChange(btnName:string,val:any,pipeline:any,filter:any,filter_name:any){
            this.btnStatusList.set(btnName,val);

            if(val){
                this.usrPipeLine = pipeline;
                this.usrFilter = filter;
                this.filterShader = this.shaders.get(filter_name);

                for(var key in this.ui_data) { 
                    if((<any>key).includes('_')){
                        let f_name = key.split("_");
                        if(f_name[0]=="f" && key!=btnName){
                            //un select other btn
                            this.btnStatusList.set(key,!val);
                            this.ui_data[key] = !val;
                        }
                    } 
                }
            }
        }

        regisUIEvent(){
            this.uiUtil.uiController.get("f_LaplacianFilter").onChange((val)=> {
                this.usrSelectChange("f_LaplacianFilter",val,RenderPipeLine.CONVOLUTION_FILTER,Filter.LAPLACIAN,"laplacianFilter");
            });

            this.uiUtil.uiController.get("f_SobelFilter").onChange((val)=> {
                this.usrSelectChange("f_SobelFilter",val,RenderPipeLine.CONVOLUTION_FILTER,Filter.SOBEL,"sobelFilter");
            });

            this.uiUtil.uiController.get("f_KuwaharaFilter").onChange((val)=> {
                this.usrSelectChange("f_KuwaharaFilter",val,RenderPipeLine.CONVOLUTION_FILTER,Filter.KUWAHARA,"kuwaharaFilter");
            });

            this.uiUtil.uiController.get("f_GeneralizedKuwaharaFilter").onChange((val)=> {
                this.usrSelectChange("f_GeneralizedKuwaharaFilter",val,RenderPipeLine.CONVOLUTION_FILTER,Filter.GKUWAHARA,"gkuwaharaFilter");
            });

            this.uiUtil.uiController.get("f_BloomEffect").onChange((val)=> {
                this.usrSelectChange("f_BloomEffect",val,RenderPipeLine.BLOOM_EFFECT,Filter.GAUSSIAN,"gaussianFilter");
            });

            this.uiUtil.uiController.get("f_GaussianFilter").onChange((val)=> {
                this.usrSelectChange("f_GaussianFilter",val,RenderPipeLine.CONVOLUTION_TWICE,Filter.GAUSSIAN,"gaussianFilter");
            });
        }

        
        regisEvent(){
            var lastPosX = 0;
            var lastPosY = 0;
            var isDragging = false;
            var hammer = this.extHammer;
            hammer.on_pan = (ev) => { 
                var elem = ev.target;
                if (!isDragging ) {
                    isDragging = true;
                    lastPosX = elem.offsetLeft;
                    lastPosY = elem.offsetTop;
                }
            
                var posX = ev.center.x -lastPosX;
                  var posY = ev.center.y -lastPosY;
            
                var cw = this.canvas.width;
                var ch = this.canvas.height;
                var wh = 1 / Math.sqrt(cw * cw + ch * ch);
                var x = posX - cw * 0.5;
                var y = posY - ch * 0.5;
                var sq = Math.sqrt(x * x + y * y);
                var r = sq * 2.0 * Math.PI * wh;
                if(sq != 1){
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

        regisAnimeFunc(){

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


                //user config
                var specCptShader = this.shaders.get("specCpt");
                var uniLocation_spec = this.uniLocations.get("specCpt");

                var synthShader = this.shaders.get("synth");
                var uniLocation_synth = this.uniLocations.get("synth");

                this.settingFrameBuffer("frameBuffer1");
                var frameBuffer1 = this.framebuffers.get("frameBuffer1");
                this.settingFrameBuffer("frameBuffer2");
                var frameBuffer2 = this.framebuffers.get("frameBuffer2");

                var loop = () => { 
                    //--------------------------------------animation global variables
                    this.stats.begin();

                    cnt++;
                    if(cnt % 2 == 0){cnt1++;}
                    var rad = (cnt % 360) * Math.PI / 180;
                    var eyePosition = new Array();
                    var camUpDirection = new Array();

                    eyePosition = q.ToV3([0.0, 20.0, 0.0],this.usrQuaternion);
                    camUpDirection = q.ToV3([0.0,0.0,-1.0],this.usrQuaternion);
                    
                    //camera setting
                    vMatrix = m.viewMatrix(eyePosition, [0, 0, 0], camUpDirection);
                    pMatrix = m.perspectiveMatrix(90, this.canvas.width / this.canvas.height, 0.1, 100);
                    vpMatrix =m.multiply(pMatrix, vMatrix);


                    // orth matrix
                    vMatrix = m.viewMatrix([0.0, 0.0, 0.5], [0.0, 0.0, 0.0], [0.0, 1.0, 0.0]);
                    pMatrix = m.orthoMatrix(-1.0, 1.0, 1.0, -1.0, 0.1, 1);
                    this.filterMvpMatrix = m.multiply(pMatrix, vMatrix);
                    //--------------------------------------animation global variables

                    //rendering parts----------------------------------------------------------------------------------

                    if(this.usrPipeLine == RenderPipeLine.CONVOLUTION_FILTER){
                        //---------------------using framebuffer1 to render scene and save result to texture0
                        frameBuffer1.bindFrameBuffer();  
                        RenderSimpleScene();
                        gl.activeTexture(gl.TEXTURE0);
                        if(this.Texture.length!=0  && this.ui_data.useTexture){
                            this.Texture[0].bind(this.Texture[0].texture);
                        }else{
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
                    }else if(this.usrPipeLine == RenderPipeLine.BLOOM_EFFECT){
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
                        this.renderGaussianFilter(true,this.btnStatusList.get("f_BloomEffect"));
                        ibo_board.draw(gl.TRIANGLES);

                        gl.bindTexture(gl.TEXTURE_2D, frameBuffer2.targetTexture);

                        //vertical blur,save to frame1 and render to texture1
                        frameBuffer1.bindFrameBuffer();
                        this.renderGaussianFilter(false,this.btnStatusList.get("f_BloomEffect"));
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
                    }else if(this.usrPipeLine == RenderPipeLine.CONVOLUTION_TWICE){
                        //---------------------using framebuffer1 to render scene and save result to texture0

                        frameBuffer1.bindFrameBuffer();  
                        RenderSimpleScene();
                        gl.activeTexture(gl.TEXTURE0);

                        if(this.Texture.length!=0  && this.ui_data.useTexture){
                            this.Texture[0].bind(this.Texture[0].texture);
                        }else{
                            gl.bindTexture(gl.TEXTURE_2D, frameBuffer1.targetTexture);
                        }
                        
                        //horizontal blur, save to frame2
                        this.filterShader.bind();
                        if(this.btnStatusList.get("f_GaussianFilter")){
                            frameBuffer2.bindFrameBuffer();
                            gl.clearColor(0.0, 0.0, 0.0, 1.0);
                            gl.clearDepth(1.0);
                            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
                            vbo_board.bind(this.filterShader);
                            ibo_board.bind();
                            this.renderGaussianFilter(true,this.btnStatusList.get("f_GaussianFilter"));
                            ibo_board.draw(gl.TRIANGLES);
    
                            gl.bindTexture(gl.TEXTURE_2D, frameBuffer2.targetTexture);
                            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
                            
                            gl.clearColor(0.0, 0.0, 0.0, 1.0);
                            gl.clearDepth(1.0);
                            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
                            vbo_board.bind(this.filterShader);
                            ibo_board.bind();
                            this.renderGaussianFilter(false,this.btnStatusList.get("f_GaussianFilter"));
                        }else{
                            
                            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
                            gl.clearColor(0.0, 0.0, 0.0, 1.0);
                            gl.clearDepth(1.0);
                            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
                            vbo_board.bind(this.filterShader);
                            ibo_board.bind();
                            this.renderGaussianFilter(false,this.btnStatusList.get("f_GaussianFilter"));
                        }
                        ibo_board.draw(gl.TRIANGLES);

                    }

                    //rendering parts----------------------------------------------------------------------------------

                    //--------------------------------------animation global variables
                    gl.flush();
                    this.stats.end();
                    requestAnimationFrame(loop);


                    function RenderSimpleScene(){
                        sceneShader.bind();
                        var hsv = EcognitaMathLib.HSV2RGB(cnt1 % 360, 1, 1, 1); 
                        gl.clearColor(hsv[0], hsv[1], hsv[2], hsv[3]);
                        gl.clearDepth(1.0);
                        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      
                        vbo_torus.bind(sceneShader);
                        ibo_torus.bind();
                        for(var i = 0; i < 9; i++){
                            var amb = EcognitaMathLib.HSV2RGB(i * 40, 1, 1, 1);
                            mMatrix = m.identity(mMatrix);
                            mMatrix = m.rotate(mMatrix, i * 2 * Math.PI / 9, [0, 1, 0]);
                            mMatrix = m.translate(mMatrix, [0.0, 0.0, 10.0]);
                            mMatrix= m.rotate(mMatrix, rad, [1, 1, 0]);
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

                    function RenderSimpleSceneSpecularParts(){    
                        gl.clearColor(0.0, 0.0, 0.0, 1.0);
                        gl.clearDepth(1.0);
                        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
                        
                        vbo_torus.bind(specCptShader);
                        ibo_torus.bind();
                        for(var i = 0; i < 9; i++){
                            mMatrix = m.identity(mMatrix);
                            mMatrix = m.rotate(mMatrix, i * 2 * Math.PI / 9, [0, 1, 0]);
                            mMatrix = m.translate(mMatrix, [0.0, 0.0, 10.0]);
                            mMatrix= m.rotate(mMatrix, rad, [1, 1, 0]);
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