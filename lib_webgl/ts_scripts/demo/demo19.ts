/* =========================================================================
 *
 *  demo19.ts
 *  test some webgl demo
 *  
 * ========================================================================= */
/// <reference path="../lib/cv_imread.ts" />
/// <reference path="../lib/extra_utils.ts" />
/// <reference path="../lib/webgl_matrix.ts" />
/// <reference path="../lib/webgl_quaternion.ts" />
/// <reference path="../lib/webgl_utils.ts" />
/// <reference path="../lib/webgl_shaders.ts" />
/// <reference path="../lib/webgl_model.ts" />

var canvas = <any>document.getElementById('canvas');
canvas.width = 512;
canvas.height = 512;
try {
    var gl = canvas.getContext("webgl", {stencil: true}) || canvas.getContext("experimental-webgl", {stencil: true});
} catch (e) {}
if (!gl)
    throw new Error("Could not initialise WebGL");

var shader = new EcognitaMathLib.WebGL_Shader(Shaders, "frameBuffer-vert", "frameBuffer-frag");

var cubeData = new EcognitaMathLib.CubeModel(2.0,[1.0,1.0,1.0,1.0],true,true);
var vbo_cube = new EcognitaMathLib.WebGL_VertexBuffer();
var ibo_cube = new EcognitaMathLib.WebGL_IndexBuffer();

vbo_cube.addAttribute("position", 3, gl.FLOAT, false);
vbo_cube.addAttribute("normal", 3, gl.FLOAT, false);
vbo_cube.addAttribute("color", 4, gl.FLOAT, false);
vbo_cube.addAttribute("textureCoord", 2, gl.FLOAT, false);

vbo_cube.init(cubeData.data.length/12);
vbo_cube.copy(cubeData.data);

ibo_cube.init(cubeData.index);
ibo_cube.bind();

var earthData = new EcognitaMathLib.ShpereModel(64,64,1,[1,1,1,1],true,true);
var vbo_earth = new EcognitaMathLib.WebGL_VertexBuffer();
var ibo_earth = new EcognitaMathLib.WebGL_IndexBuffer();

vbo_earth.addAttribute("position", 3, gl.FLOAT, false);
vbo_earth.addAttribute("normal", 3, gl.FLOAT, false);
vbo_earth.addAttribute("color", 4, gl.FLOAT, false);
vbo_earth.addAttribute("textureCoord", 2, gl.FLOAT, false);

vbo_earth.init(earthData.data.length/12);
vbo_earth.copy(earthData.data);

ibo_earth.init(earthData.index);
ibo_earth.bind();


var m = new EcognitaMathLib.WebGLMatrix();
var q = new EcognitaMathLib.WebGLQuaternion();

var mMatrix = m.identity(m.create());
var vMatrix = m.identity(m.create());
var pMatrix = m.identity(m.create());
var tmpMatrix = m.identity(m.create());
var mvpMatrix =m.identity(m.create());
var invMatrix =m.identity(m.create());
var qMatrix   = m.identity(m.create());

var xQuaternion = q.identity(q.create());
var lightDirection = [1.0, 1.0, 1.0];

shader.bind();
var uniLocation = new Array<any>();
uniLocation.push(shader.uniformIndex('mMatrix'));
uniLocation.push(shader.uniformIndex('mvpMatrix'));
uniLocation.push(shader.uniformIndex('invMatrix'));
uniLocation.push(shader.uniformIndex('lightDirection'));
uniLocation.push(shader.uniformIndex('useLight'));
uniLocation.push(shader.uniformIndex('texture'));

var lastPosX = 0;
var lastPosY = 0;
var isDragging = false;
var hammer = new EcognitaMathLib.Hammer_Utils(canvas);
hammer.on_pan = function(ev){
	var elem = ev.target;
	if (!isDragging ) {
		isDragging = true;
		lastPosX = elem.offsetLeft;
		lastPosY = elem.offsetTop;
	}

	var posX = ev.center.x -lastPosX;
  	var posY = ev.center.y -lastPosY;

	var cw = canvas.width;
	var ch = canvas.height;
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
	xQuaternion = q.rotate(r, [y, x, 0.0]);

	if (ev.isFinal) {
        isDragging = false;
  	}
}
hammer.enablePan();

//depth test
gl.enable(gl.DEPTH_TEST);
gl.depthFunc(gl.LEQUAL);

var cnt = 0;

var tex3 =null;
var tex4 =null;
var img3 = EcognitaMathLib.imread("./img/tex3.png");
var img4 = EcognitaMathLib.imread("./img/tex4.png");
img3.onload = function(){
    tex3 = new EcognitaMathLib.WebGL_Texture(4,false,img3);
};
img4.onload = function(){
    tex4 = new EcognitaMathLib.WebGL_Texture(4,false,img4);
};
gl.activeTexture(gl.TEXTURE0);

//frame buffer init
var fBufferWidth  = 512;
var fBufferHeight = 512;

var frameBuffer = new EcognitaMathLib.WebGL_FrameBuffer(fBufferWidth,fBufferHeight);
frameBuffer.bindFrameBuffer();
frameBuffer.bindDepthBuffer();
frameBuffer.renderToTexure();
frameBuffer.release();

(function(){

        //bind frame buff
        gl.bindFramebuffer(gl.FRAMEBUFFER,frameBuffer.framebuffer);

        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clearDepth(1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        cnt++;
        var rad  = (cnt % 360) * Math.PI / 180;
        var rad2 = (cnt % 720) * Math.PI / 360;
        var lightDirection = [-1.0, 2.0, 1.0];
        qMatrix = q.ToMat4x4(xQuaternion);

        var camPosition = [0.0,0.0,5.0];
        var camUpDirection = [0.0,1.0,0.0];

        //camera setting
        vMatrix = m.viewMatrix(camPosition, [0, 0, 0], camUpDirection);
        pMatrix = m.perspectiveMatrix(45, fBufferWidth / fBufferHeight, 0.1, 100);
        tmpMatrix =m.multiply(pMatrix, vMatrix);

        //render earth scene's skybox
        if(tex4!=null){
            //gl.activeTexture(gl.TEXTURE1);
            tex4.bind(tex4.texture);
        }

        vbo_earth.bind(shader);
        ibo_earth.bind();

		mMatrix = m.identity(mMatrix);
		mMatrix = m.scale(mMatrix, [50.0, 50.0, 50.0]);
		mvpMatrix = m.multiply(tmpMatrix, mMatrix);
		invMatrix = m.inverse(mMatrix);
		gl.uniformMatrix4fv(uniLocation[0], false, mMatrix);
		gl.uniformMatrix4fv(uniLocation[1], false, mvpMatrix);
		gl.uniformMatrix4fv(uniLocation[2], false, invMatrix);
		gl.uniform3fv(uniLocation[3], lightDirection);
		gl.uniform1i(uniLocation[4], false);
        gl.uniform1i(uniLocation[5], 0);
        
		ibo_earth.draw(gl.TRIANGLES);
        
        //render earth
        if(tex3!=null){
            //gl.activeTexture(gl.TEXTURE0);
            tex3.bind(tex3.texture);
        }
        m.identity(mMatrix);
		mMatrix = m.rotate(mMatrix, rad, [0, 1, 0]);
		mvpMatrix = m.multiply(tmpMatrix, mMatrix);
		invMatrix = m.inverse(mMatrix);
		gl.uniformMatrix4fv(uniLocation[0], false, mMatrix);
		gl.uniformMatrix4fv(uniLocation[1], false, mvpMatrix);
		gl.uniformMatrix4fv(uniLocation[2], false, invMatrix);
		gl.uniform1i(uniLocation[4], true);
        
        ibo_earth.draw(gl.TRIANGLES);
        
        //release frame buffer
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        
        //reset canvas scene
        gl.clearColor(0.0, 0.7, 0.7, 1.0);
		gl.clearDepth(1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        
        //render cube
        vbo_cube.bind(shader);
        ibo_cube.bind();

        //bind rendered texture
        gl.bindTexture(gl.TEXTURE_2D, frameBuffer.targetTexture);
        lightDirection = [-1.0, 0.0, 0.0];

        vMatrix = m.multiply(vMatrix,qMatrix);
        tmpMatrix =m.multiply(pMatrix, vMatrix);

        m.identity(mMatrix);
		mMatrix = m.rotate(mMatrix, rad2, [1, 1, 0]);
		mvpMatrix = m.multiply(tmpMatrix, mMatrix);
		invMatrix = m.inverse(mMatrix);
		gl.uniformMatrix4fv(uniLocation[0], false, mMatrix);
		gl.uniformMatrix4fv(uniLocation[1], false, mvpMatrix);
		gl.uniformMatrix4fv(uniLocation[2], false, invMatrix);
        
        ibo_cube.draw(gl.TRIANGLES);

        gl.flush();
        setTimeout(arguments.callee, 1000 / 30);
})();