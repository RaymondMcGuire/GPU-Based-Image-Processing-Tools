/* =========================================================================
 *
 *  FilterViewHub.ts
 *  pkg for filter viewer 
 *  v0.1
 *  
 * ========================================================================= */
/// <reference path="../lib/HashSet.ts" />
/// <reference path="../lib/FilterViewerUi.ts" />
/// <reference path="../../../../lib_webgl/ts_scripts/lib/cv_imread.ts" />
/// <reference path="../../../../lib_webgl/ts_scripts/lib/cv_colorSpace.ts" />
/// <reference path="../../../../lib_webgl/ts_scripts/lib/extra_utils.ts" />
/// <reference path="../../../../lib_webgl/ts_scripts/lib/webgl_matrix.ts" />
/// <reference path="../../../../lib_webgl/ts_scripts/lib/webgl_quaternion.ts" />
/// <reference path="../../../../lib_webgl/ts_scripts/lib/webgl_utils.ts" />
/// <reference path="../../../../lib_webgl/ts_scripts/lib/webgl_shaders.ts" />
/// <reference path="../../../../lib_webgl/ts_scripts/lib/webgl_model.ts" />

module EcognitaWeb3DFunction {
    declare var gl: any;
    declare var Stats:any;

    export enum Filter{
        LAPLACIAN,
        SOBEL
    }

    export class InitWeb3DEnv{
        canvas:any;
        stats:any;
        shaders:any;
        uniLocations:any;
        matUtil:any;
        quatUtil:any;
        uiUtil:any;
        ui_data:any;
        extHammer:any;
        Texture:Array<any>;
        vbo:Array<any>;
        ibo:Array<any>;
        loadTexture(file_name:string){
            var tex =null;
            var image = EcognitaMathLib.imread(file_name);
            image.onload  =  (() => { 
                tex = new EcognitaMathLib.WebGL_Texture(4,false,image);
                this.Texture.push(tex);
            });
        }

        chkWebGLEnvi(){
            try {
                  gl = this.canvas.getContext("webgl") || this.canvas.getContext("experimental-webgl");
                  this.stats = new Stats();
                  document.body.appendChild( this.stats.dom );
            } catch (e) {}
            if (!gl)
                throw new Error("Could not initialise WebGL");
            
        }

        constructor(cvs:any,shaderlist:Array<string>){
            this.canvas = cvs;
            this.chkWebGLEnvi();
            this.vbo = new Array<any>();
            this.ibo = new Array<any>();
            this.Texture = new Array();
            this.matUtil = new EcognitaMathLib.WebGLMatrix();
            this.quatUtil = new EcognitaMathLib.WebGLQuaternion();

            this.ui_data = {
                name: 'Filter Viewer',
                f_LaplacianFilter:false,
                f_SobelFilter:true
            };
        
            this.uiUtil = new Utils.FilterViewerUI(this.ui_data);
            this.extHammer = new EcognitaMathLib.Hammer_Utils(this.canvas);

            this.shaders = new Utils.HashSet<EcognitaMathLib.WebGL_Shader>();
            this.uniLocations = new Utils.HashSet<Array<any>>();
            shaderlist.forEach(shaderName => {
                var shader = new EcognitaMathLib.WebGL_Shader(Shaders,shaderName+"-vert", shaderName+"-frag");  
                this.shaders.set(shaderName,shader);
                this.uniLocations.set(shaderName,new Array<any>());
            });
        }
    }

    export class FilterViewer extends InitWeb3DEnv {
        usrFilter:Filter;
        usrQuaternion :any;
        usrParams: any;
        filterMvpMatrix:any;
        filterShader:any;
        b_laplacian:boolean;
        b_sobel:boolean;
        constructor(cvs:any){
            var shaderList = ["filterScene","laplacianFilter","sobelFilter"];
            super(cvs,shaderList);

            //init gobal variable
            this.filterMvpMatrix = this.matUtil.identity(this.matUtil.create());
            this.usrFilter = Filter.SOBEL;
            this.filterShader = this.shaders.get("sobelFilter");
            this.b_laplacian = this.ui_data.f_LaplacianFilter;
            this.b_sobel = this.ui_data.f_SobelFilter;

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
                                 -1.0, -2.0, -1.0]
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

            //init System
            this.initModel();

            var filterSceneArray = new Array<string>();
            filterSceneArray.push("mvpMatrix");
            filterSceneArray.push("invMatrix");
            filterSceneArray.push("lightDirection");
            filterSceneArray.push("eyeDirection");
            filterSceneArray.push("ambientColor");
            this.settingUniform("filterScene",filterSceneArray);

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

        //user config
        renderFilter(){
            if(this.usrFilter == Filter.LAPLACIAN){
                var LapFilterUniformLoc = this.uniLocations.get("laplacianFilter");
                gl.uniformMatrix4fv(LapFilterUniformLoc[0], false, this.filterMvpMatrix);
                gl.uniform1i(LapFilterUniformLoc[1], 0);
                gl.uniform1fv(LapFilterUniformLoc[2], this.usrParams.laplacianCoef);
                gl.uniform1f(LapFilterUniformLoc[3], this.canvas.height);
                gl.uniform1f(LapFilterUniformLoc[4], this.canvas.width);
                gl.uniform1i(LapFilterUniformLoc[5], this.b_laplacian);
            }else if(this.usrFilter == Filter.SOBEL){
                var SobelFilterUniformLoc = this.uniLocations.get("sobelFilter");
                gl.uniformMatrix4fv(SobelFilterUniformLoc[0], false, this.filterMvpMatrix);
                gl.uniform1i(SobelFilterUniformLoc[1], 0);
                gl.uniform1fv(SobelFilterUniformLoc[2], this.usrParams.sobelHorCoef);
                gl.uniform1fv(SobelFilterUniformLoc[3], this.usrParams.sobelVerCoef);
                gl.uniform1f(SobelFilterUniformLoc[4], this.canvas.height);
                gl.uniform1f(SobelFilterUniformLoc[5], this.canvas.width);
                gl.uniform1i(SobelFilterUniformLoc[6], this.b_sobel);
            }

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

        regisUIEvent(){
            this.uiUtil.uiController.get("f_LaplacianFilter").onChange((val)=> {
                this.b_laplacian = val;

                if(val){
                    this.usrFilter = Filter.LAPLACIAN;
                    this.filterShader = this.shaders.get("laplacianFilter");
                    if(this.b_sobel){
                        this.b_sobel = !val;
                        this.ui_data.f_SobelFilter = this.b_sobel;
                    }
                }

            });

            this.uiUtil.uiController.get("f_SobelFilter").onChange((val)=> {
                this.b_sobel = val;
                
                if(val){
                    this.usrFilter = Filter.SOBEL;
                    this.filterShader = this.shaders.get("sobelFilter");
                    if(this.b_laplacian){
                        this.b_laplacian = !val;
                        this.ui_data.f_LaplacianFilter = this.b_laplacian;
                    }
                }
               
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
                var cnt = 0;
                var cnt1 = 0;

                var lightDirection = [-0.577, 0.577, 0.577];
                var m = this.matUtil;
                var q = this.quatUtil;

                var mMatrix   = m.identity(m.create());
                var vMatrix   = m.identity(m.create());
                var pMatrix   = m.identity(m.create());
                var tmpMatrix = m.identity(m.create());
                var mvpMatrix = m.identity(m.create());
                var invMatrix = m.identity(m.create());
                
                
                this.usrQuaternion = q.identity(q.create());

                //frame buffer
                var fBufferWidth  = this.canvas.width;
                var fBufferHeight = this.canvas.height;
                var frameBuffer = new EcognitaMathLib.WebGL_FrameBuffer(fBufferWidth,fBufferHeight);
                frameBuffer.bindFrameBuffer();
                frameBuffer.bindDepthBuffer();
                frameBuffer.renderToShadowTexure();
                frameBuffer.release();

                var sceneShader = this.shaders.get("filterScene");
                var sceneUniformLoc = this.uniLocations.get("filterScene");

                var vbo_torus = this.vbo[0];
                var ibo_torus = this.ibo[0];

                var vbo_board = this.vbo[1];
                var ibo_board = this.ibo[1];

                var loop = () => { 

                    this.stats.begin();

                    cnt++;
                    if(cnt % 2 == 0){cnt1++;}

                    var rad = (cnt % 360) * Math.PI / 180;

                    sceneShader.bind();
                    frameBuffer.bindFrameBuffer();

                    var hsv = EcognitaMathLib.HSV2RGB(cnt1 % 360, 1, 1, 1); 
                    gl.clearColor(hsv[0], hsv[1], hsv[2], hsv[3]);
                    gl.clearDepth(1.0);
                    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

                    var eyePosition = new Array();
                    var camUpDirection = new Array();

                    eyePosition = q.ToV3([0.0, 20.0, 0.0],this.usrQuaternion);
                    camUpDirection = q.ToV3([0.0,0.0,-1.0],this.usrQuaternion);
                    
                    //camera setting
                    vMatrix = m.viewMatrix(eyePosition, [0, 0, 0], camUpDirection);
                    pMatrix = m.perspectiveMatrix(90, this.canvas.width / this.canvas.height, 0.1, 100);
                    tmpMatrix =m.multiply(pMatrix, vMatrix);

                    //draw torus
                    vbo_torus.bind(sceneShader);
                    ibo_torus.bind();
                    for(var i = 0; i < 9; i++){
                        var amb = EcognitaMathLib.HSV2RGB(i * 40, 1, 1, 1);
                        mMatrix = m.identity(mMatrix);
                        mMatrix = m.rotate(mMatrix, i * 2 * Math.PI / 9, [0, 1, 0]);
                        mMatrix = m.translate(mMatrix, [0.0, 0.0, 10.0]);
                        mMatrix= m.rotate(mMatrix, rad, [1, 1, 0]);
                        mvpMatrix = m.multiply(tmpMatrix, mMatrix);
                        invMatrix = m.inverse(mMatrix);
                        gl.uniformMatrix4fv(sceneUniformLoc[0], false, mvpMatrix);
                        gl.uniformMatrix4fv(sceneUniformLoc[1], false, invMatrix);
                        gl.uniform3fv(sceneUniformLoc[2], lightDirection);
                        gl.uniform3fv(sceneUniformLoc[3], eyePosition);
                        gl.uniform4fv(sceneUniformLoc[4], amb);
                        ibo_torus.draw(gl.TRIANGLES);
                    }
                    
                    this.filterShader.bind();
                    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
                    gl.clearColor(0.0, 0.0, 0.0, 1.0);
                    gl.clearDepth(1.0);
                    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

                    // orth matrix
                    vMatrix = m.viewMatrix([0.0, 0.0, 0.5], [0.0, 0.0, 0.0], [0.0, 1.0, 0.0]);
                    pMatrix = m.orthoMatrix(-1.0, 1.0, 1.0, -1.0, 0.1, 1);
                    this.filterMvpMatrix = m.multiply(pMatrix, vMatrix);
                    
                    gl.activeTexture(gl.TEXTURE0);
                    gl.bindTexture(gl.TEXTURE_2D, frameBuffer.targetTexture);

                    //draw filter image into board
                    vbo_board.bind(this.filterShader);
                    ibo_board.bind();
                    this.renderFilter();
                    ibo_board.draw(gl.TRIANGLES);
                    
                    gl.flush();

                    this.stats.end();
                    requestAnimationFrame(loop);
                };

                loop();
        }
    }
}