/* =========================================================================
 *
 *  demo28.ts
 *  shadow
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
    var gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
} catch (e) {}
if (!gl)
    throw new Error("Could not initialise WebGL");

var depthShader = new EcognitaMathLib.WebGL_Shader(Shaders,"shadowDepthBuffer-vert", "shadowDepthBuffer-frag");
var frameShader = new EcognitaMathLib.WebGL_Shader(Shaders,"shadowScreen-vert", "shadowScreen-frag");

//scene model : torus
var torusData = new EcognitaMathLib.TorusModel(64, 64, 1.0, 2.0,undefined,true,false); 
var vbo_torus = new EcognitaMathLib.WebGL_VertexBuffer();
var ibo_torus = new EcognitaMathLib.WebGL_IndexBuffer();

vbo_torus.addAttribute("position", 3, gl.FLOAT, false);
vbo_torus.addAttribute("normal", 3, gl.FLOAT, false);
vbo_torus.addAttribute("color", 4, gl.FLOAT, false);

vbo_torus.init(torusData.data.length/10);
vbo_torus.copy(torusData.data);

ibo_torus.init(torusData.index);

//scene model : board
var color = [
	0.3, 0.3, 0.3, 1.0,
	0.3, 0.3, 0.3, 1.0,
	0.3, 0.3, 0.3, 1.0,
	0.3, 0.3, 0.3, 1.0
];

var boardData = new EcognitaMathLib.BoardModel(color); 
var vbo_board = new EcognitaMathLib.WebGL_VertexBuffer();
var ibo_board = new EcognitaMathLib.WebGL_IndexBuffer();

vbo_board.addAttribute("position", 3, gl.FLOAT, false);
vbo_board.addAttribute("normal", 3, gl.FLOAT, false);
vbo_board.addAttribute("color", 4, gl.FLOAT, false);

boardData.index = [
	0, 2, 1,
	3, 1, 2
];



vbo_board.init(boardData.data.length/10);
vbo_board.copy(boardData.data);
ibo_board.init(boardData.index);

depthShader.bind();
var uniLocation_dph = new Array<any>();
uniLocation_dph.push(depthShader.uniformIndex('mvpMatrix'));
uniLocation_dph.push(depthShader.uniformIndex('depthBuffer'));

frameShader.bind();
var uniLocation_frame = new Array<any>();
uniLocation_frame.push(frameShader.uniformIndex('mMatrix'));
uniLocation_frame.push(frameShader.uniformIndex('mvpMatrix'));
uniLocation_frame.push(frameShader.uniformIndex('invMatrix'));
uniLocation_frame.push(frameShader.uniformIndex('tMatrix'));
uniLocation_frame.push(frameShader.uniformIndex('lgtMatrix'));
uniLocation_frame.push(frameShader.uniformIndex('lightPosition'));
uniLocation_frame.push(frameShader.uniformIndex('texture'));
uniLocation_frame.push(frameShader.uniformIndex('depthBuffer'));

var m = new EcognitaMathLib.WebGLMatrix();
var q = new EcognitaMathLib.WebGLQuaternion();

var mMatrix    = m.identity(m.create());
var vMatrix    = m.identity(m.create());
var pMatrix    = m.identity(m.create());
var tmpMatrix  = m.identity(m.create());
var mvpMatrix  = m.identity(m.create());
var invMatrix  = m.identity(m.create());
var tMatrix    = m.identity(m.create());
var lgtMatrix  = m.identity(m.create());
var dvMatrix   = m.identity(m.create());
var dpMatrix   = m.identity(m.create());
var dvpMatrix  = m.identity(m.create());

var xQuaternion = q.identity(q.create());

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
gl.enable(gl.CULL_FACE);

var lightPosition = [0.0, 1.0, 0.0];
var lightUpDirection = [0.0, 0.0, -1.0];

//frame buffer
var fBufferWidth  = 2048;
var fBufferHeight = 2048;
var frameBuffer = new EcognitaMathLib.WebGL_FrameBuffer(fBufferWidth,fBufferHeight);
frameBuffer.bindFrameBuffer();
frameBuffer.bindDepthBuffer();
frameBuffer.renderToShadowTexure();
frameBuffer.release();

var cnt = 0;
var b_vertex = false;
(function(){
        cnt++;
    
		var eyePosition = new Array();
		var camUpDirection = new Array();

		eyePosition = q.ToV3([0.0, 70.0, 0.0],xQuaternion);
        camUpDirection = q.ToV3([0.0,0.0,-1.0],xQuaternion);
        
        //camera setting
        vMatrix = m.viewMatrix(eyePosition, [0, 0, 0], camUpDirection);
        pMatrix = m.perspectiveMatrix(45, canvas.width / canvas.height, 0.1, 150);
        tmpMatrix =m.multiply(pMatrix, vMatrix);

		//st?w =  tMatrix * xyzw
		tMatrix = m.identity(tMatrix);
		tMatrix[0]  =  0.5; tMatrix[1]  =  0.0; tMatrix[2]  =  0.0; tMatrix[3]  =  0.0;
		tMatrix[4]  =  0.0; tMatrix[5]  = -0.5; tMatrix[6]  =  0.0; tMatrix[7]  =  0.0;
		tMatrix[8]  =  0.0; tMatrix[9]  =  0.0; tMatrix[10] =  1.0; tMatrix[11] =  0.0;
		tMatrix[12] =  0.5; tMatrix[13] =  0.5; tMatrix[14] =  0.0; tMatrix[15] =  1.0;

		lightPosition[0] =  10.0 ;
		lightPosition[1] =  40.0 + 20.0 * Math.sin(cnt/100);
		lightPosition[2] =  0.0;

		//view matrix switch to light
		dvMatrix = m.viewMatrix(lightPosition, [0, 0, 0], lightUpDirection);
		dpMatrix = m.perspectiveMatrix(90, 1.0, 0.1, 150);

		dvpMatrix = m.multiply(tMatrix, dpMatrix);
		tMatrix = m.multiply(dvpMatrix, dvMatrix);
		dvpMatrix = m.multiply(dpMatrix, dvMatrix);

		depthShader.bind();
		frameBuffer.bindFrameBuffer();

		//fresh frame buffer
		gl.clearColor(1.0, 1.0, 1.0, 1.0);
		gl.clearDepth(1.0);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		gl.viewport(0.0, 0.0, fBufferWidth, fBufferHeight);

		//draw torus
		vbo_torus.bind(depthShader);
		ibo_torus.bind();
		for(var i = 0; i < 10; i++){
			var rad = ((cnt + i * 36) % 360) * Math.PI / 180;
			var rad2 = (((i % 5) * 72) % 360) * Math.PI / 180;
			var ifl = -Math.floor(i / 5) + 1;
			var rad = ((cnt + i * 36) % 360) * Math.PI / 180;
			mMatrix = m.identity(mMatrix);
			mMatrix = m.rotate(mMatrix, rad2, [0.0, 1.0, 0.0]);
			mMatrix = m.translate(mMatrix, [0.0, ifl * 10.0 + 10.0, (ifl - 2.0) * 7.0]);
			mMatrix = m.rotate(mMatrix, rad, [1.0, 1.0, 0.0]);
			lgtMatrix = m.multiply(dvpMatrix, mMatrix);
			gl.uniformMatrix4fv(uniLocation_dph[0], false, lgtMatrix);
			gl.uniform1i(uniLocation_dph[1], b_vertex );
			ibo_torus.draw(gl.TRIANGLES);
		}
		
		//draw board(down)
		vbo_board.bind(depthShader);
		ibo_board.bind();
		mMatrix = m.identity(mMatrix);
		mMatrix =m.translate(mMatrix, [0.0, -10.0, 0.0]);
		mMatrix =m.scale(mMatrix, [30.0, 0.0, 30.0]);
		lgtMatrix = m.multiply(dvpMatrix, mMatrix);
		gl.uniformMatrix4fv(uniLocation_dph[0], false, lgtMatrix);
		ibo_board.draw(gl.TRIANGLES);
		


		//release framebuffer
		frameShader.bind();
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);

		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, frameBuffer.targetTexture);

		//render scene
		gl.clearColor(0.0, 0.7, 0.7, 1.0);
		gl.clearDepth(1.0);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		gl.viewport(0.0, 0.0, canvas.width, canvas.height);

		//draw torus
		vbo_torus.bind(frameShader);
		ibo_torus.bind();
		for(var i = 0; i < 10; i++){
			var rad = ((cnt + i * 36) % 360) * Math.PI / 180;
			var rad2 = (((i % 5) * 72) % 360) * Math.PI / 180;
			var ifl = -Math.floor(i / 5) + 1;
			var rad = ((cnt + i * 36) % 360) * Math.PI / 180;
			mMatrix = m.identity(mMatrix);
			mMatrix = m.rotate(mMatrix, rad2, [0.0, 1.0, 0.0]);
			mMatrix = m.translate(mMatrix, [0.0, ifl * 10.0 + 10.0, (ifl - 2.0) * 7.0]);
			mMatrix = m.rotate(mMatrix, rad, [1.0, 1.0, 0.0]);
			mvpMatrix = m.multiply(tmpMatrix, mMatrix);
			invMatrix = m.inverse(mMatrix);
			lgtMatrix = m.multiply(dvpMatrix, mMatrix);
			gl.uniformMatrix4fv(uniLocation_frame[0], false, mMatrix);
			gl.uniformMatrix4fv(uniLocation_frame[1], false, mvpMatrix);
			gl.uniformMatrix4fv(uniLocation_frame[2], false, invMatrix);
			gl.uniformMatrix4fv(uniLocation_frame[3], false, tMatrix);
			gl.uniformMatrix4fv(uniLocation_frame[4], false, lgtMatrix);
			gl.uniform3fv(uniLocation_frame[5], lightPosition);
			gl.uniform1i(uniLocation_frame[6], 0);
			gl.uniform1i(uniLocation_frame[7], b_vertex);
			ibo_torus.draw(gl.TRIANGLES);
		}
		
		//draw board(down)
		vbo_board.bind(frameShader);
		ibo_board.bind();
		mMatrix = m.identity(mMatrix);
		mMatrix =m.translate(mMatrix, [0.0, -10.0, 0.0]);
		mMatrix =m.scale(mMatrix, [30.0, 0.0, 30.0]);
		mvpMatrix = m.multiply(tmpMatrix, mMatrix);
		invMatrix = m.inverse(mMatrix);
		lgtMatrix = m.multiply(dvpMatrix, mMatrix);
		gl.uniformMatrix4fv(uniLocation_frame[0], false, mMatrix);
		gl.uniformMatrix4fv(uniLocation_frame[1], false, mvpMatrix);
		gl.uniformMatrix4fv(uniLocation_frame[2], false, invMatrix);
		gl.uniformMatrix4fv(uniLocation_frame[3], false, tMatrix);
		gl.uniformMatrix4fv(uniLocation_frame[4], false, lgtMatrix);
		ibo_board.draw(gl.TRIANGLES);


        gl.flush();
        setTimeout(arguments.callee, 1000 / 30);
})();