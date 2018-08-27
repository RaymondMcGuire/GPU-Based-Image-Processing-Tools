/* =========================================================================
 *
 *  demo21.ts
 *  test some webgl demo
 *  need adjust the param's value
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

var shader = new EcognitaMathLib.WebGL_Shader(Shaders,"bumpMapping-vert", "bumpMapping-frag");
var cubeData = new EcognitaMathLib.CubeModel(2,[6,6,6,255],true,true);
var vbo_cube = new EcognitaMathLib.WebGL_VertexBuffer();
var ibo_cube = new EcognitaMathLib.WebGL_IndexBuffer();

vbo_cube.addAttribute("position", 3, gl.FLOAT, false);
vbo_cube.addAttribute("normal", 3, gl.FLOAT, false);
vbo_cube.addAttribute("color", 4, gl.FLOAT, false);
vbo_cube.addAttribute("textureCoord", 2, gl.FLOAT, false);

vbo_cube.init(cubeData.data.length/12);
vbo_cube.copy(cubeData.data);
vbo_cube.bind(shader);

ibo_cube.init(cubeData.index);
ibo_cube.bind();

shader.bind();
var uniLocation = new Array<any>();
uniLocation.push(shader.uniformIndex('mMatrix'));
uniLocation.push(shader.uniformIndex('mvpMatrix'));
uniLocation.push(shader.uniformIndex('invMatrix'));
uniLocation.push(shader.uniformIndex('lightPosition'));
uniLocation.push(shader.uniformIndex('eyePosition'));
uniLocation.push(shader.uniformIndex('texture'));


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

var cnt = 0;

var tex_normalMap =null;
var img_normalMap = EcognitaMathLib.imread("./img/tex5.png");
img_normalMap.onload = function(){
    tex_normalMap = new EcognitaMathLib.WebGL_Texture(4,false,img_normalMap);
};
gl.activeTexture(gl.TEXTURE0);

var lightPosition = [-10.0, 10.0, 10.0];
var eyePosition = [0.0, 0.0, 5.0];

(function(){

        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clearDepth(1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        cnt++;
        var rad  = (cnt % 360) * Math.PI / 180;
        
        var camUpDirection =new Array();
        camUpDirection = q.ToV3([0.0,1.0,0.0],xQuaternion);
        eyePosition = q.ToV3([0.0, 0.0, 5.0],xQuaternion);
        
        //camera setting
        vMatrix = m.viewMatrix(eyePosition, [0, 0, 0], camUpDirection);
        pMatrix = m.perspectiveMatrix(45, canvas.width / canvas.height, 0.1, 100);
        tmpMatrix =m.multiply(pMatrix, vMatrix);

        if(tex_normalMap!=null){
            tex_normalMap.bind(tex_normalMap.texture);
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
        
		ibo_cube.draw(gl.TRIANGLES);
        
        gl.flush();
        setTimeout(arguments.callee, 1000 / 30);
})();