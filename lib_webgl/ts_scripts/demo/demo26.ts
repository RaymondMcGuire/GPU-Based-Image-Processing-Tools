/* =========================================================================
 *
 *  demo26.ts
 *  toon shading
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

var shader = new EcognitaMathLib.WebGL_Shader(Shaders,"toonShading-vert", "toonShading-frag");

//scene model : torus
var torusData = new EcognitaMathLib.TorusModel(64, 64, 0.5, 2.5, undefined,true,false); 
var vbo_torus = new EcognitaMathLib.WebGL_VertexBuffer();
var ibo_torus = new EcognitaMathLib.WebGL_IndexBuffer();

vbo_torus.addAttribute("position", 3, gl.FLOAT, false);
vbo_torus.addAttribute("normal", 3, gl.FLOAT, false);
vbo_torus.addAttribute("color", 4, gl.FLOAT, false);

vbo_torus.init(torusData.data.length/10);
vbo_torus.copy(torusData.data);

ibo_torus.init(torusData.index);

//scene model : sphere
var sphereData = new EcognitaMathLib.ShpereModel(64, 64, 1.5,undefined,true,false); 
var vbo_sphere = new EcognitaMathLib.WebGL_VertexBuffer();
var ibo_sphere = new EcognitaMathLib.WebGL_IndexBuffer();

vbo_sphere.addAttribute("position", 3, gl.FLOAT, false);
vbo_sphere.addAttribute("normal", 3, gl.FLOAT, false);
vbo_sphere.addAttribute("color", 4, gl.FLOAT, false);

vbo_sphere.init(sphereData.data.length/10);
vbo_sphere.copy(sphereData.data);

ibo_sphere.init(sphereData.index);

shader.bind();
var uniLocation = new Array<any>();
uniLocation.push(shader.uniformIndex('mvpMatrix'));
uniLocation.push(shader.uniformIndex('invMatrix'));
uniLocation.push(shader.uniformIndex('lightDirection'));
uniLocation.push(shader.uniformIndex('texture'));
uniLocation.push(shader.uniformIndex('edge'));
uniLocation.push(shader.uniformIndex('edgeColor'));

var m = new EcognitaMathLib.WebGLMatrix();
var q = new EcognitaMathLib.WebGLQuaternion();

var mMatrix = m.identity(m.create());
var vMatrix = m.identity(m.create());
var pMatrix = m.identity(m.create());
var tmpMatrix = m.identity(m.create());
var mvpMatrix =m.identity(m.create());
var invMatrix =m.identity(m.create());

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

//culling
gl.enable(gl.CULL_FACE);

//toon texture
var texToon =null;
var toonImage = EcognitaMathLib.imread("./img/toon.png");
toonImage.onload = function(){
    texToon = new EcognitaMathLib.WebGL_Texture(4,false,toonImage);
};
gl.activeTexture(gl.TEXTURE0);

var edgeColor = [0.0, 0.0, 0.0, 1.0];
var lightDirection = [-0.5, 0.5, 0.5];
var cnt = 0;
(function(){

		gl.clearColor(0.0, 0.7, 0.7, 1.0);
        gl.clearDepth(1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        cnt++;
		var rad  = (cnt % 360) * Math.PI / 180;

		if(texToon!=null){
			texToon.bind(texToon.texture);
		}
        
		var eyePosition = new Array();
		var camUpDirection = new Array();

		eyePosition = q.ToV3([0.0, 0.0, 10.0],xQuaternion);
        camUpDirection = q.ToV3([0.0,1.0,0.0],xQuaternion);
        
        
        //camera setting
        vMatrix = m.viewMatrix(eyePosition, [0, 0, 0], camUpDirection);
        pMatrix = m.perspectiveMatrix(45, canvas.width / canvas.height, 0.1, 100);
        tmpMatrix =m.multiply(pMatrix, vMatrix);

		//draw torus
		vbo_torus.bind(shader);
		ibo_torus.bind();
		mMatrix = m.identity(mMatrix);
		mMatrix = m.rotate(mMatrix, rad, [0, 1, 1]);
		mvpMatrix = m.multiply(tmpMatrix, mMatrix);
		invMatrix = m.inverse(mMatrix);
		gl.uniformMatrix4fv(uniLocation[0], false, mvpMatrix);
		gl.uniformMatrix4fv(uniLocation[1], false, invMatrix);
		gl.uniform3fv(uniLocation[2], lightDirection);
		gl.uniform1i(uniLocation[3], 0);

		gl.cullFace(gl.BACK);
		gl.uniform1i(uniLocation[4], false);
		edgeColor = [0.0, 0.0, 0.0, 0.0];
		gl.uniform4fv(uniLocation[5], edgeColor);
		ibo_torus.draw(gl.TRIANGLES);

		gl.cullFace(gl.FRONT);
		gl.uniform1i(uniLocation[4], true);
		edgeColor = [0.0, 0.0, 0.0, 1.0];
		gl.uniform4fv(uniLocation[5], edgeColor);
		ibo_torus.draw(gl.TRIANGLES);
		
		//draw sphere
		vbo_sphere.bind(shader);
		ibo_sphere.bind();
		mMatrix = m.identity(mMatrix);
		mvpMatrix = m.multiply(tmpMatrix, mMatrix);
		invMatrix = m.inverse(mMatrix);
        gl.uniformMatrix4fv(uniLocation[0], false, mvpMatrix);
		gl.uniformMatrix4fv(uniLocation[1], false, invMatrix);

		gl.cullFace(gl.BACK);
		gl.uniform1i(uniLocation[4], false);
		edgeColor = [0.0, 0.0, 0.0, 0.0];
		gl.uniform4fv(uniLocation[5], edgeColor);
		ibo_sphere.draw(gl.TRIANGLES);

		gl.cullFace(gl.FRONT);
		gl.uniform1i(uniLocation[4], true);
		edgeColor = [0.0, 0.0, 0.0, 1.0];
		gl.uniform4fv(uniLocation[5], edgeColor);
		ibo_sphere.draw(gl.TRIANGLES);

        gl.flush();
        setTimeout(arguments.callee, 1000 / 30);
})();