/* =========================================================================
 *
 *  demo13.ts
 *  test some webgl demo
 *  
 * ========================================================================= */
/// <reference path="../lib/webgl_matrix.ts" />
/// <reference path="../lib/webgl_quaternion.ts" />
/// <reference path="../lib/webgl_utils.ts" />
/// <reference path="../lib/webgl_shaders.ts" />
/// <reference path="../lib/webgl_model.ts" />
declare var Hammer:any;
var canvas = <any>document.getElementById('canvas');
canvas.width = 500;
canvas.height = 300;
try {
    var gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
} catch (e) {}
if (!gl)
    throw new Error("Could not initialise WebGL");

//event listener
//using hammer library
var mc = new Hammer(canvas);
mc.add( new Hammer.Pan({ direction: Hammer.DIRECTION_ALL, threshold: 0 }) );
mc.on("pan", mouseDrag);

var cnt =0;

var shader = new EcognitaMathLib.WebGL_Shader(Shaders, "pointLighting-vert", "pointLighting-frag");

var vbo = new EcognitaMathLib.WebGL_VertexBuffer();
var ibo = new EcognitaMathLib.WebGL_IndexBuffer();
var torusData = new EcognitaMathLib.TorusModel(64,64,0.5,1.5,true);

vbo.addAttribute("position", 3, gl.FLOAT, false);
vbo.addAttribute("normal", 3, gl.FLOAT, false);
vbo.addAttribute("color", 4, gl.FLOAT, false);
vbo.init(torusData.data.length/10);
vbo.copy(torusData.data);
vbo.bind(shader);

ibo.init(torusData.index);
ibo.bind();

var m = new EcognitaMathLib.WebGLMatrix();
var q = new EcognitaMathLib.WebGLQuaternion();

var mMatrix = m.identity(m.create());
var vMatrix = m.identity(m.create());
var pMatrix = m.identity(m.create());
var tmpMatrix = m.identity(m.create());
var mvpMatrix =m.identity(m.create());
var invMatrix = m.identity(m.create());

shader.bind();
var uniLocation = new Array<any>();
uniLocation.push(shader.uniformIndex('mvpMatrix'));
uniLocation.push(shader.uniformIndex('mMatrix'));
uniLocation.push(shader.uniformIndex('invMatrix'));
uniLocation.push(shader.uniformIndex('lightPosition'));
uniLocation.push(shader.uniformIndex('eyeDirection'));
uniLocation.push(shader.uniformIndex('ambientColor'));


var lightPosition = [15.0, 10.0, 15.0];
var ambientColor = [0.1, 0.1, 0.1, 1.0];

var xQuaternion = q.identity(q.create());

var camPosition = [0.0,0.0,10.0];
var camUpDirection = [0.0,1.0,0.0];

vMatrix = m.viewMatrix(camPosition, [0, 0, 0], camUpDirection);
pMatrix = m.perspectiveMatrix(45, canvas.width / canvas.height, 0.1, 100);
tmpMatrix =m.multiply(pMatrix, vMatrix);

var lastPosX = 0;
var lastPosY = 0;
var isDragging = false;
function mouseDrag(ev){
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

//depth test and cull face
gl.enable(gl.DEPTH_TEST);
gl.depthFunc(gl.LEQUAL);
gl.enable(gl.CULL_FACE);
(function(){

        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clearDepth(1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
        cnt++;
        var rad = (cnt%180) * Math.PI/90;

        var qMatrix = m.identity(m.create());
		qMatrix = q.ToMat4x4(xQuaternion);

        mMatrix =m.identity(mMatrix);
        mMatrix = m.multiply(qMatrix,mMatrix);
        mMatrix =m.rotate(mMatrix,rad,[0,1,0]);
        mvpMatrix = m.multiply(tmpMatrix, mMatrix);
        invMatrix = m.inverse(mMatrix);

        gl.uniformMatrix4fv(uniLocation[0], false, mvpMatrix);
        gl.uniformMatrix4fv(uniLocation[1], false, mMatrix);
        gl.uniformMatrix4fv(uniLocation[2], false, invMatrix);
        gl.uniform3fv(uniLocation[3], lightPosition);
        gl.uniform3fv(uniLocation[4], camPosition);
        gl.uniform4fv(uniLocation[5], ambientColor);

        ibo.draw(gl.TRIANGLES);
        gl.flush();
        setTimeout(arguments.callee, 1000 / 30);
})();