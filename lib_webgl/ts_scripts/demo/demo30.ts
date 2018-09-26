/* =========================================================================
 *
 *  demo30.ts
 *  filter:sepia
 *  
 * ========================================================================= */
/// <reference path="../lib/cv_imread.ts" />
/// <reference path="../lib/extra_utils.ts" />
/// <reference path="../lib/webgl_matrix.ts" />
/// <reference path="../lib/webgl_quaternion.ts" />
/// <reference path="../lib/webgl_utils.ts" />
/// <reference path="../lib/webgl_shaders.ts" />
/// <reference path="../lib/webgl_model.ts" />
/// <reference path="../lib/cv_colorSpace.ts" />

var canvas = <any>document.getElementById('canvas');
canvas.width = 512;
canvas.height = 512;
try {
    var gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
} catch (e) {}
if (!gl)
    throw new Error("Could not initialise WebGL");

var sceneShader = new EcognitaMathLib.WebGL_Shader(Shaders,"filterScene-vert", "filterScene-frag");
var filterShader = new EcognitaMathLib.WebGL_Shader(Shaders,"sepiaFilter-vert", "sepiaFilter-frag");

//scene model : torus
var torusData = new EcognitaMathLib.TorusModel(64, 64, 1.0, 2.0,[1.0, 1.0, 1.0, 1.0],true,false); 
var vbo_torus = new EcognitaMathLib.WebGL_VertexBuffer();
var ibo_torus = new EcognitaMathLib.WebGL_IndexBuffer();

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

vbo_board.addAttribute("position", 3, gl.FLOAT, false);
vbo_board.addAttribute("texCoord", 2, gl.FLOAT, false);

boardData.index = [
	0, 2, 1,
	2, 3, 1
];

vbo_board.init(boardData.data.length/5);
vbo_board.copy(boardData.data);
ibo_board.init(boardData.index);

var uniLocation_f = new Array<any>();
uniLocation_f.push(sceneShader.uniformIndex('mvpMatrix'));
uniLocation_f.push(sceneShader.uniformIndex('invMatrix'));
uniLocation_f.push(sceneShader.uniformIndex('lightDirection'));
uniLocation_f.push(sceneShader.uniformIndex('eyeDirection'));
uniLocation_f.push(sceneShader.uniformIndex('ambientColor'));

var uniLocation_s = new Array<any>();
uniLocation_s.push(filterShader.uniformIndex('mvpMatrix'));
uniLocation_s.push(filterShader.uniformIndex('texture'));
uniLocation_s.push(filterShader.uniformIndex('sepia'));

var m = new EcognitaMathLib.WebGLMatrix();
var q = new EcognitaMathLib.WebGLQuaternion();

var mMatrix   = m.identity(m.create());
var vMatrix   = m.identity(m.create());
var pMatrix   = m.identity(m.create());
var tmpMatrix = m.identity(m.create());
var mvpMatrix = m.identity(m.create());
var invMatrix = m.identity(m.create());

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

var lightDirection = [-0.577, 0.577, 0.577];

//frame buffer
var fBufferWidth  = 512;
var fBufferHeight = 512;
var frameBuffer = new EcognitaMathLib.WebGL_FrameBuffer(fBufferWidth,fBufferHeight);
frameBuffer.bindFrameBuffer();
frameBuffer.bindDepthBuffer();
frameBuffer.renderToShadowTexure();
frameBuffer.release();

var cnt = 0;
var cnt1 = 0;
(function(){
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

		eyePosition = q.ToV3([0.0, 20.0, 0.0],xQuaternion);
        camUpDirection = q.ToV3([0.0,0.0,-1.0],xQuaternion);
        
        //camera setting
        vMatrix = m.viewMatrix(eyePosition, [0, 0, 0], camUpDirection);
        pMatrix = m.perspectiveMatrix(90, canvas.width / canvas.height, 0.1, 100);
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
			gl.uniformMatrix4fv(uniLocation_f[0], false, mvpMatrix);
			gl.uniformMatrix4fv(uniLocation_f[1], false, invMatrix);
			gl.uniform3fv(uniLocation_f[2], lightDirection);
			gl.uniform3fv(uniLocation_f[3], eyePosition);
			gl.uniform4fv(uniLocation_f[4], amb);
			ibo_torus.draw(gl.TRIANGLES);
		}
		
		filterShader.bind();
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		gl.clearColor(0.0, 0.0, 0.0, 1.0);
		gl.clearDepth(1.0);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		// orth matrix
		vMatrix = m.viewMatrix([0.0, 0.0, 0.5], [0.0, 0.0, 0.0], [0.0, 1.0, 0.0]);
		pMatrix = m.orthoMatrix(-1.0, 1.0, 1.0, -1.0, 0.1, 1);
		tmpMatrix = m.multiply(pMatrix, vMatrix);
		
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, frameBuffer.targetTexture);

		//draw filter image into board
		vbo_board.bind(filterShader);
		ibo_board.bind();
		gl.uniformMatrix4fv(uniLocation_s[0], false, tmpMatrix);
		gl.uniform1i(uniLocation_s[1], 0);
		gl.uniform1i(uniLocation_s[2], true);
		ibo_board.draw(gl.TRIANGLES);
		
        gl.flush();
        setTimeout(arguments.callee, 1000 / 30);
})();