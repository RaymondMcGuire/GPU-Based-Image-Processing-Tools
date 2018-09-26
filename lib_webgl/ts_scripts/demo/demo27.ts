/* =========================================================================
 *
 *  demo27.ts
 *  projection texture
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
canvas.width = 500;
canvas.height = 300;
try {
    var gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
} catch (e) {}
if (!gl)
    throw new Error("Could not initialise WebGL");

var shader = new EcognitaMathLib.WebGL_Shader(Shaders,"projTexture-vert", "projTexture-frag");

//scene model : torus
var torusData = new EcognitaMathLib.TorusModel(64, 64, 0.5, 2.5, [1.0, 1.0, 1.0, 1.0],true,false); 
var vbo_torus = new EcognitaMathLib.WebGL_VertexBuffer();
var ibo_torus = new EcognitaMathLib.WebGL_IndexBuffer();

vbo_torus.addAttribute("position", 3, gl.FLOAT, false);
vbo_torus.addAttribute("normal", 3, gl.FLOAT, false);
vbo_torus.addAttribute("color", 4, gl.FLOAT, false);

vbo_torus.init(torusData.data.length/10);
vbo_torus.copy(torusData.data);

ibo_torus.init(torusData.index);

//scene model : board
var boardData = new EcognitaMathLib.BoardModel(); 
var vbo_board = new EcognitaMathLib.WebGL_VertexBuffer();
var ibo_board = new EcognitaMathLib.WebGL_IndexBuffer();

vbo_board.addAttribute("position", 3, gl.FLOAT, false);
vbo_board.addAttribute("normal", 3, gl.FLOAT, false);
vbo_board.addAttribute("color", 4, gl.FLOAT, false);

vbo_board.init(boardData.data.length/10);
vbo_board.copy(boardData.data);
ibo_board.init(boardData.index);

shader.bind();
var uniLocation = new Array<any>();
uniLocation.push(shader.uniformIndex('mMatrix'));
uniLocation.push(shader.uniformIndex('tMatrix'));
uniLocation.push(shader.uniformIndex('mvpMatrix'));
uniLocation.push(shader.uniformIndex('invMatrix'));
uniLocation.push(shader.uniformIndex('lightPosition'));
uniLocation.push(shader.uniformIndex('texture'));

var m = new EcognitaMathLib.WebGLMatrix();
var q = new EcognitaMathLib.WebGLQuaternion();

var mMatrix = m.identity(m.create());
var vMatrix = m.identity(m.create());
var pMatrix = m.identity(m.create());
var tmpMatrix = m.identity(m.create());
var mvpMatrix =m.identity(m.create());
var invMatrix =m.identity(m.create());
var tMatrix   = m.identity(m.create());
var tvMatrix  = m.identity(m.create());
var tpMatrix  = m.identity(m.create());
var tvpMatrix = m.identity(m.create());

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

//projection texture
var projTex =null;
var projImage = EcognitaMathLib.imread("./img/tex4.png");
projImage.onload = function(){
    projTex = new EcognitaMathLib.WebGL_Texture(4,false,projImage,gl.CLAMP_TO_EDGE);
};
gl.activeTexture(gl.TEXTURE0);

var lightPosition = [-10.0, 10.0, 10.0];
var lightUpDirection = [0.577, 0.577, -0.577];
var cnt = 0;
(function(){

		gl.clearColor(0.0, 0.7, 0.7, 1.0);
        gl.clearDepth(1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        cnt++;
    
		var eyePosition = new Array();
		var camUpDirection = new Array();

		eyePosition = q.ToV3([0.0, 0.0, 70.0],xQuaternion);
        camUpDirection = q.ToV3([0.0,1.0,0.0],xQuaternion);
        
        //camera setting
        vMatrix = m.viewMatrix(eyePosition, [0, 0, 0], camUpDirection);
        pMatrix = m.perspectiveMatrix(45, canvas.width / canvas.height, 0.1, 150);
        tmpMatrix =m.multiply(pMatrix, vMatrix);

		if(projTex!=null){
			projTex.bind(projTex.texture);
		}

		//st?w =  tMatrix * xyzw
		tMatrix[0]  =  0.5; tMatrix[1]  =  0.0; tMatrix[2]  =  0.0; tMatrix[3]  =  0.0;
		tMatrix[4]  =  0.0; tMatrix[5]  = -0.5; tMatrix[6]  =  0.0; tMatrix[7]  =  0.0;
		tMatrix[8]  =  0.0; tMatrix[9]  =  0.0; tMatrix[10] =  1.0; tMatrix[11] =  0.0;
		tMatrix[12] =  0.5; tMatrix[13] =  0.5; tMatrix[14] =  0.0; tMatrix[15] =  1.0;

		//auto move light range
		var r = 15+10*Math.sin(cnt*0.01);
		lightPosition[0] = -1.0 * r;
		lightPosition[1] =  1.0 * r;
		lightPosition[2] =  1.0 * r;

		//view matrix switch to light
		tvMatrix = m.viewMatrix(lightPosition, [0, 0, 0], lightUpDirection);
		tpMatrix = m.perspectiveMatrix(90, 1.0, 0.1, 150);

		tvpMatrix = m.multiply(tMatrix, tpMatrix);
		tMatrix = m.multiply(tvpMatrix, tvMatrix);

		//draw torus
		vbo_torus.bind(shader);
		ibo_torus.bind();
		for(var i = 0; i < 10; i++){
			var trans = new Array();
			trans[0] = (i % 5 - 2.0) * 7.0;
			trans[1] = Math.floor(i / 5) * 7.0 - 5.0;
			trans[2] = (i % 5 - 2.0) * 5.0;
			var rad = ((cnt + i * 36) % 360) * Math.PI / 180;
			mMatrix = m.identity(mMatrix);
			mMatrix = m.translate(mMatrix, trans);
			mMatrix = m.rotate(mMatrix, rad, [1.0, 1.0, 0.0]);
			mvpMatrix = m.multiply(tmpMatrix, mMatrix);
			invMatrix = m.inverse(mMatrix);
			gl.uniformMatrix4fv(uniLocation[0], false, mMatrix);
			gl.uniformMatrix4fv(uniLocation[1], false, tMatrix);
			gl.uniformMatrix4fv(uniLocation[2], false, mvpMatrix);
			gl.uniformMatrix4fv(uniLocation[3], false, invMatrix);
			gl.uniform3fv(uniLocation[4], lightPosition);
			gl.uniform1i(uniLocation[5], 0);
			ibo_torus.draw(gl.TRIANGLES);
		}
		
		//draw board(down)
		vbo_board.bind(shader);
		ibo_board.bind();
		mMatrix = m.identity(mMatrix);
		mMatrix =m.translate(mMatrix, [0.0, -10.0, 0.0]);
		mMatrix =m.scale(mMatrix, [20.0, 0.0, 20.0]);
		mvpMatrix = m.multiply(tmpMatrix, mMatrix);
		invMatrix = m.inverse(mMatrix);
		gl.uniformMatrix4fv(uniLocation[0], false, mMatrix);
		gl.uniformMatrix4fv(uniLocation[2], false, mvpMatrix);
		gl.uniformMatrix4fv(uniLocation[3], false, invMatrix);
		ibo_board.draw(gl.TRIANGLES);
		
		// left
		mMatrix = m.identity(mMatrix);
		mMatrix = m.translate(mMatrix, [0.0, 10.0, -20.0]);
		mMatrix = m.rotate(mMatrix, Math.PI / 2, [1, 0, 0]);
		mMatrix = m.scale(mMatrix, [20.0, 0.0, 20.0]);
		mvpMatrix = m.multiply(tmpMatrix, mMatrix);
		invMatrix = m.inverse(mMatrix);
		gl.uniformMatrix4fv(uniLocation[0], false, mMatrix);
		gl.uniformMatrix4fv(uniLocation[2], false, mvpMatrix);
		gl.uniformMatrix4fv(uniLocation[3], false, invMatrix);
		ibo_board.draw(gl.TRIANGLES);
		
		// right
		mMatrix = m.identity(mMatrix);
		mMatrix = m.translate(mMatrix, [20.0, 10.0, 0.0]);
		mMatrix = m.rotate(mMatrix, Math.PI / 2, [0, 0, 1]);
		mMatrix = m.scale(mMatrix, [20.0, 0.0, 20.0]);
		mvpMatrix = m.multiply(tmpMatrix, mMatrix);
		invMatrix = m.inverse(mMatrix);
		gl.uniformMatrix4fv(uniLocation[0], false, mMatrix);
		gl.uniformMatrix4fv(uniLocation[2], false, mvpMatrix);
		gl.uniformMatrix4fv(uniLocation[3], false, invMatrix);
		ibo_board.draw(gl.TRIANGLES);

        gl.flush();
        setTimeout(arguments.callee, 1000 / 30);
})();