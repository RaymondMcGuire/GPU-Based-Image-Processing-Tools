/* =========================================================================
 *
 *  bumpMapping.ts
 *  create a bump mapping demo(include some simple web3d function)
 *  v0.1
 *  
 * ========================================================================= */
/// <reference path="../../lib/cv_imread.ts" />
/// <reference path="../../lib/extra_utils.ts" />
/// <reference path="../../lib/webgl_matrix.ts" />
/// <reference path="../../lib/webgl_quaternion.ts" />
/// <reference path="../../lib/webgl_utils.ts" />
/// <reference path="../../lib/webgl_shaders.ts" />
/// <reference path="../../lib/webgl_model.ts" />
module EcognitaWeb3DFunction {
    declare var gl: any;
    export class InitWeb3DEnv{
        canvas:any;
        shader:any;
        matUtil:any;
        quatUtil:any;
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
            } catch (e) {}
            if (!gl)
                throw new Error("Could not initialise WebGL");
            
        }

        constructor(cvs:any,shader_name:string){
            this.canvas = cvs;
            this.chkWebGLEnvi();
            this.vbo = new Array<any>();
            this.ibo = new Array<any>();
            this.Texture = new Array();
            this.shader = new EcognitaMathLib.WebGL_Shader(Shaders,shader_name+"-vert", shader_name+"-frag");
            this.matUtil = new EcognitaMathLib.WebGLMatrix();
            this.quatUtil = new EcognitaMathLib.WebGLQuaternion();
            this.extHammer = new EcognitaMathLib.Hammer_Utils(this.canvas);
        }
    }

    export class BumpMapping extends InitWeb3DEnv {
        usrQuaternion :any;
        uniLocation:any;
        constructor(cvs:any,texture_path:string = "./img/tex5.png"){
            super(cvs,"bumpMapping");
            this.initModel();
            this.settingUniform();
            this.regisEvent();
            this.loadTexture(texture_path);
            this.settingRenderPipeline();
            this.regisLoopFunc();
        }

        initModel(){
            var cubeData = new EcognitaMathLib.CubeModel(2,[6,6,6,255],true,true);
            var vbo_cube = new EcognitaMathLib.WebGL_VertexBuffer();
            var ibo_cube = new EcognitaMathLib.WebGL_IndexBuffer();
            this.vbo.push(vbo_cube);
            this.ibo.push(ibo_cube);
            
            vbo_cube.addAttribute("position", 3, gl.FLOAT, false);
            vbo_cube.addAttribute("normal", 3, gl.FLOAT, false);
            vbo_cube.addAttribute("color", 4, gl.FLOAT, false);
            vbo_cube.addAttribute("textureCoord", 2, gl.FLOAT, false);
            
            vbo_cube.init(cubeData.data.length/12);
            vbo_cube.copy(cubeData.data);
            vbo_cube.bind(this.shader);
            
            ibo_cube.init(cubeData.index);
            ibo_cube.bind();

            this.shader.bind();
        }

        settingUniform(){
            var shader = this.shader;
            var uniLocation = new Array<any>();
            uniLocation.push(shader.uniformIndex('mMatrix'));
            uniLocation.push(shader.uniformIndex('mvpMatrix'));
            uniLocation.push(shader.uniformIndex('invMatrix'));
            uniLocation.push(shader.uniformIndex('lightPosition'));
            uniLocation.push(shader.uniformIndex('eyePosition'));
            uniLocation.push(shader.uniformIndex('texture'));
            this.uniLocation = uniLocation;
        }

        settingRenderPipeline(){
            gl.enable(gl.DEPTH_TEST);
            gl.depthFunc(gl.LEQUAL);    
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

        regisLoopFunc(){
                var step = 0;
                var camUpDirection =new Array();
                var eyePosition = new Array();
                var lightPosition = [-10.0, 10.0, 10.0];
                var m = this.matUtil;
                var q = this.quatUtil;
                var mMatrix = m.identity(m.create());
                var vMatrix = m.identity(m.create());
                var pMatrix = m.identity(m.create());
                var tmpMatrix = m.identity(m.create());
                var mvpMatrix =m.identity(m.create());
                var invMatrix =m.identity(m.create());
                this.usrQuaternion = q.identity(q.create());

                var uniLocation =this.uniLocation;
                var loop = () => { 

                    gl.clearColor(0.0, 0.0, 0.0, 1.0);
                    gl.clearDepth(1.0);
                    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            
                    step++;
                    var rad  = (step % 360) * Math.PI / 180;
                    
                    camUpDirection = q.ToV3([0.0,1.0,0.0],this.usrQuaternion);
                    eyePosition = q.ToV3([0.0, 0.0, 5.0],this.usrQuaternion);
                    
                    //camera setting
                    vMatrix = m.viewMatrix(eyePosition, [0, 0, 0], camUpDirection);
                    pMatrix = m.perspectiveMatrix(45, this.canvas.width / this.canvas.height, 0.1, 100);
                    tmpMatrix =m.multiply(pMatrix, vMatrix);
            
                    if(this.Texture[0]!=null){
                        this.Texture[0].bind(this.Texture[0].texture);
                    }
            
                    mMatrix = m.identity(mMatrix);
                    mMatrix = m.rotate(mMatrix, -rad,[0,1,0]);
                    mvpMatrix = m.multiply(tmpMatrix, mMatrix);
                    invMatrix = m.inverse(mMatrix);
                    gl.uniformMatrix4fv(uniLocation[0], false, mMatrix);
                    gl.uniformMatrix4fv(uniLocation[1], false, mvpMatrix);
                    gl.uniformMatrix4fv(uniLocation[2], false, invMatrix);
                    gl.uniform3fv(uniLocation[3], lightPosition);
                    gl.uniform3fv(uniLocation[4], eyePosition);
                    gl.uniform1i(uniLocation[5], 0);
                    
                    this.ibo[0].draw(gl.TRIANGLES);
                    
                    gl.flush();
                    requestAnimationFrame(loop);
                };

                loop();
        }
    }
}