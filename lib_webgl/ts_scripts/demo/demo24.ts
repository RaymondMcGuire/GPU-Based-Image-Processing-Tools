/* =========================================================================
 *
 *  demo24.ts
 *  refraction mapping
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
canvas.height = 500;
try {
    var gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
} catch (e) {}
if (!gl)
    throw new Error("Could not initialise WebGL");

var shader = new EcognitaMathLib.WebGL_Shader(Shaders,"refractionMapping-vert", "refractionMapping-frag");

//cube texture
var cubeData = new EcognitaMathLib.CubeModel(2,[1,1,1,1],true,false);
var vbo_cube = new EcognitaMathLib.WebGL_VertexBuffer();
var ibo_cube = new EcognitaMathLib.WebGL_IndexBuffer();

vbo_cube.addAttribute("position", 3, gl.FLOAT, false);
vbo_cube.addAttribute("normal", 3, gl.FLOAT, false);
vbo_cube.addAttribute("color", 4, gl.FLOAT, false);

vbo_cube.init(cubeData.data.length/10);
vbo_cube.copy(cubeData.data);
vbo_cube.bind(shader);

ibo_cube.init(cubeData.index);
ibo_cube.bind();

//scene model : sphere
var sphereData = new EcognitaMathLib.ShpereModel(64, 64, 2.5, [1.0, 1.0, 1.0, 1.0],true,false); 
var vbo_sphere = new EcognitaMathLib.WebGL_VertexBuffer();
var ibo_sphere = new EcognitaMathLib.WebGL_IndexBuffer();

vbo_sphere.addAttribute("position", 3, gl.FLOAT, false);
vbo_sphere.addAttribute("normal", 3, gl.FLOAT, false);
vbo_sphere.addAttribute("color", 4, gl.FLOAT, false);

vbo_sphere.init(sphereData.data.length/10);
vbo_sphere.copy(sphereData.data);
vbo_sphere.bind(shader);

ibo_sphere.init(sphereData.index);
ibo_sphere.bind();

//scene model : torus
var torusData = new EcognitaMathLib.TorusModel(64, 64, 1.0, 2.0, [1.0, 1.0, 1.0, 1.0],true,false); 
var vbo_torus = new EcognitaMathLib.WebGL_VertexBuffer();
var ibo_torus = new EcognitaMathLib.WebGL_IndexBuffer();

vbo_torus.addAttribute("position", 3, gl.FLOAT, false);
vbo_torus.addAttribute("normal", 3, gl.FLOAT, false);
vbo_torus.addAttribute("color", 4, gl.FLOAT, false);

vbo_torus.init(torusData.data.length/10);
vbo_torus.copy(torusData.data);
vbo_torus.bind(shader);

ibo_torus.init(torusData.index);
ibo_torus.bind();

shader.bind();
var uniLocation = new Array<any>();
uniLocation.push(shader.uniformIndex('mMatrix'));
uniLocation.push(shader.uniformIndex('mvpMatrix'));
uniLocation.push(shader.uniformIndex('eyePosition'));
uniLocation.push(shader.uniformIndex('cubeTexture'));
uniLocation.push(shader.uniformIndex('refraction'));


var m = new EcognitaMathLib.WebGLMatrix();
var q = new EcognitaMathLib.WebGLQuaternion();

var mMatrix = m.identity(m.create());
var vMatrix = m.identity(m.create());
var pMatrix = m.identity(m.create());
var tmpMatrix = m.identity(m.create());
var mvpMatrix =m.identity(m.create());

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

//cube texture mapping
var cubeImagePath = "./img/cube_texture/";
var texArray = new Array(   cubeImagePath+'px.png',
							cubeImagePath+'py.png',
							cubeImagePath+'pz.png',
							cubeImagePath+'nx.png',
							cubeImagePath+'ny.png',
							cubeImagePath+'nz.png');
var cubeTexureMapping = new EcognitaMathLib.WebGL_CubeMapTexture(texArray);
var eyePosition = [0.0, 0.0, 20.0];

var cnt = 0;
(function(){

        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clearDepth(1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        cnt++;
		var rad  = (cnt % 360) * Math.PI / 180;
		var rad2 = ((cnt + 180) % 360) * Math.PI / 180;
        
        var camUpDirection =new Array();
        camUpDirection = q.ToV3([0.0,1.0,0.0],xQuaternion);
        eyePosition = q.ToV3([0.0, 0.0, 20.0],xQuaternion);
        
        //camera setting
        vMatrix = m.viewMatrix(eyePosition, [0, 0, 0], camUpDirection);
        pMatrix = m.perspectiveMatrix(45, canvas.width / canvas.height, 0.1, 200);
        tmpMatrix =m.multiply(pMatrix, vMatrix);

		//background cube texture
		vbo_cube.bind(shader);
		ibo_cube.bind();
		
		mMatrix = m.identity(mMatrix);
		mMatrix = m.scale(mMatrix, [100.0, 100.0, 100.0]);
		mvpMatrix = m.multiply(tmpMatrix, mMatrix);
		gl.uniformMatrix4fv(uniLocation[0], false, mMatrix);
		gl.uniformMatrix4fv(uniLocation[1], false, mvpMatrix);
		gl.uniform3fv(uniLocation[2], eyePosition);
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubeTexureMapping.cubeTexture);
		gl.uniform1i(uniLocation[3], 0);
		gl.uniform1i(uniLocation[4], false);
		ibo_cube.draw(gl.TRIANGLES);

		//draw sphere
		vbo_sphere.bind(shader);
		ibo_sphere.bind();
		mMatrix = m.identity(mMatrix);
		mMatrix = m.rotate(mMatrix, rad, [0, 0, 1]);
		mvpMatrix = m.multiply(tmpMatrix, mMatrix);
        gl.uniformMatrix4fv(uniLocation[0], false, mMatrix);
		gl.uniformMatrix4fv(uniLocation[1], false, mvpMatrix);
		gl.uniform1i(uniLocation[4], true);
		ibo_sphere.draw(gl.TRIANGLES);

		//draw torus
		vbo_torus.bind(shader);
		ibo_torus.bind();
		mMatrix = m.identity(mMatrix);
		mMatrix = m.rotate(mMatrix, rad2, [0, 0, 1]);
		mMatrix = m.translate(mMatrix, [5.0, 0.0, 0.0]);
		mMatrix = m.rotate(mMatrix, rad, [1, 0, 1]);
		mvpMatrix = m.multiply(tmpMatrix, mMatrix);
		gl.uniformMatrix4fv(uniLocation[0], false, mMatrix);
		gl.uniformMatrix4fv(uniLocation[1], false, mvpMatrix);
		gl.uniform1i(uniLocation[4], true);
		ibo_torus.draw(gl.TRIANGLES);

        gl.flush();
        setTimeout(arguments.callee, 1000 / 30);
})();