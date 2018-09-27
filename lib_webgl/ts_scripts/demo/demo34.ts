/* =========================================================================
 *
 *  demo34.ts
 *  filter:bloom effect
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
var specCptShader = new EcognitaMathLib.WebGL_Shader(Shaders,"specCpt-vert", "specCpt-frag");
var filterShader = new EcognitaMathLib.WebGL_Shader(Shaders,"gaussianFilter-vert", "gaussianFilter-frag");
var synthShader  = new EcognitaMathLib.WebGL_Shader(Shaders,"synth-vert", "synth-frag");

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

var uniLocation_spec = new Array<any>();
uniLocation_spec.push(specCptShader.uniformIndex('mvpMatrix'));
uniLocation_spec.push(specCptShader.uniformIndex('invMatrix'));
uniLocation_spec.push(specCptShader.uniformIndex('lightDirection'));
uniLocation_spec.push(specCptShader.uniformIndex('eyeDirection'));

var uniLocation_s = new Array<any>();
uniLocation_s.push(filterShader.uniformIndex('mvpMatrix'));
uniLocation_s.push(filterShader.uniformIndex('texture'));
uniLocation_s.push(filterShader.uniformIndex('weight'));
uniLocation_s.push(filterShader.uniformIndex('horizontal'));

var uniLocation_synth = new Array<any>();
uniLocation_synth.push(synthShader.uniformIndex('mvpMatrix'));
uniLocation_synth.push(synthShader.uniformIndex('texture1'));
uniLocation_synth.push(synthShader.uniformIndex('texture2'));
uniLocation_synth.push(synthShader.uniformIndex('glare'));

var m = new EcognitaMathLib.WebGLMatrix();
var q = new EcognitaMathLib.WebGLQuaternion();

var mMatrix   = m.identity(m.create());
var vMatrix   = m.identity(m.create());
var pMatrix   = m.identity(m.create());
var tmpMatrix = m.identity(m.create());
var mvpMatrix = m.identity(m.create());
var invMatrix = m.identity(m.create());
var b_tmpMatrix = m.identity(m.create());

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
var frameBuffer1 = new EcognitaMathLib.WebGL_FrameBuffer(fBufferWidth,fBufferHeight);
frameBuffer1.bindFrameBuffer();
frameBuffer1.bindDepthBuffer();
frameBuffer1.renderToShadowTexure();
frameBuffer1.release();

var frameBuffer2 = new EcognitaMathLib.WebGL_FrameBuffer(fBufferWidth,fBufferHeight);
frameBuffer2.bindFrameBuffer();
frameBuffer2.bindDepthBuffer();
frameBuffer2.renderToShadowTexure();
frameBuffer2.release();

var cnt = 0;
var cnt1 = 0;

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
			
(function(){
        cnt++;
		if(cnt % 2 == 0){cnt1++;}

		var rad = (cnt % 360) * Math.PI / 180;

		var eyePosition = new Array();
		var camUpDirection = new Array();

		eyePosition = q.ToV3([0.0, 20.0, 0.0],xQuaternion);
        camUpDirection = q.ToV3([0.0,0.0,-1.0],xQuaternion);
        
        //camera setting
        vMatrix = m.viewMatrix(eyePosition, [0, 0, 0], camUpDirection);
        pMatrix = m.perspectiveMatrix(90, canvas.width / canvas.height, 0.1, 100);
		tmpMatrix = m.multiply(pMatrix, vMatrix);

		// orth matrix
		vMatrix = m.viewMatrix([0.0, 0.0, 0.5], [0.0, 0.0, 0.0], [0.0, 1.0, 0.0]);
		pMatrix = m.orthoMatrix(-1.0, 1.0, 1.0, -1.0, 0.1, 1);
		b_tmpMatrix = m.multiply(pMatrix, vMatrix);


		//render torus specular component
		specCptShader.bind();
		frameBuffer1.bindFrameBuffer();
		
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
			mvpMatrix = m.multiply(tmpMatrix, mMatrix);
			invMatrix = m.inverse(mMatrix);
			gl.uniformMatrix4fv(uniLocation_spec[0], false, mvpMatrix);
			gl.uniformMatrix4fv(uniLocation_spec[1], false, invMatrix);
			gl.uniform3fv(uniLocation_spec[2], lightDirection);
			gl.uniform3fv(uniLocation_spec[3], eyePosition);
			ibo_torus.draw(gl.TRIANGLES);
		}

		//make specular component blur
		filterShader.bind();

		//save to framebuffer2
		frameBuffer2.bindFrameBuffer();

		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, frameBuffer1.targetTexture);

		//render horizontal direction


		gl.clearColor(0.0, 0.0, 0.0, 1.0);
		gl.clearDepth(1.0);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		vbo_board.bind(filterShader);
		ibo_board.bind();
		gl.uniformMatrix4fv(uniLocation_s[0], false, b_tmpMatrix);
		gl.uniform1i(uniLocation_s[1], 0);
		gl.uniform1fv(uniLocation_s[2], weight);
		gl.uniform1i(uniLocation_s[3], true);
		ibo_board.draw(gl.TRIANGLES);

		//switch to framebuffer1
		frameBuffer1.bindFrameBuffer();
		
		gl.bindTexture(gl.TEXTURE_2D, frameBuffer2.targetTexture);

		//render the vertical direction 
		gl.clearColor(0.0, 0.0, 0.0, 1.0);
		gl.clearDepth(1.0);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		vbo_board.bind(filterShader);
		ibo_board.bind();
		gl.uniformMatrix4fv(uniLocation_s[0], false, b_tmpMatrix);
		gl.uniform1i(uniLocation_s[1], 0);
		gl.uniform1fv(uniLocation_s[2], weight);
		gl.uniform1i(uniLocation_s[3], false);
		ibo_board.draw(gl.TRIANGLES);

		//switch to framebuffer2
		frameBuffer2.bindFrameBuffer();
		
		//render scene
		sceneShader.bind();

		gl.clearColor(0.0, 0.0, 0.0, 1.0);
		gl.clearDepth(1.0);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
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

		//using tex0 to save scene texture 
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, frameBuffer2.targetTexture);

		//using tex1 to save torus specular component(blur)
		gl.activeTexture(gl.TEXTURE1);
		gl.bindTexture(gl.TEXTURE_2D, frameBuffer1.targetTexture);

		//release framebuffer
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);

		gl.clearColor(0.0, 0.0, 0.0, 1.0);
		gl.clearDepth(1.0);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		synthShader.bind();
		
		//render texture to board and show this board to user		
		vbo_board.bind(synthShader);
		ibo_board.bind();
		gl.uniformMatrix4fv(uniLocation_synth[0], false, b_tmpMatrix);
		gl.uniform1i(uniLocation_synth[1], 0);
		gl.uniform1i(uniLocation_synth[2], 1);
		gl.uniform1i(uniLocation_synth[3], true);
		ibo_board.draw(gl.TRIANGLES);
		
        gl.flush();
        setTimeout(arguments.callee, 1000 / 30);
})();