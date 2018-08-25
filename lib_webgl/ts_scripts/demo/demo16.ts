/* =========================================================================
 *
 *  demo16.ts
 *  test some webgl demo
 *  
 * ========================================================================= */
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

//debug the info for point size range 
var pointSizeRange = gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE);
console.log('pointSizeRange:' + pointSizeRange[0] + ' to ' + pointSizeRange[1]);
var shader = new EcognitaMathLib.WebGL_Shader(Shaders, "point-vert", "point-frag");
var pointSphere = new EcognitaMathLib.ShpereModel(16,16,2,undefined,false);
//point shpere
var vbo = new EcognitaMathLib.WebGL_VertexBuffer();

vbo.addAttribute("position", 3, gl.FLOAT, false);
vbo.addAttribute("color", 4, gl.FLOAT, false);

vbo.init(pointSphere.data.length/7);
vbo.copy(pointSphere.data);
vbo.bind(shader);

//line
var vbo_line = new EcognitaMathLib.WebGL_VertexBuffer();

vbo_line.addAttribute("position", 3, gl.FLOAT, false);
vbo_line.addAttribute("color", 4, gl.FLOAT, false);

var lineData =[-1.0, -1.0,  0.0, 1.0, 1.0, 1.0, 1.0,
                1.0, -1.0,  0.0, 1.0, 0.0, 0.0, 1.0,
               -1.0,  1.0,  0.0, 0.0, 1.0, 0.0, 1.0,
                1.0,  1.0,  0.0, 0.0, 0.0, 1.0, 1.0
                ];
vbo_line.init(4);
vbo_line.copy(lineData);
vbo_line.bind(shader);

var m = new EcognitaMathLib.WebGLMatrix();
var q = new EcognitaMathLib.WebGLQuaternion();

var mMatrix = m.identity(m.create());
var vMatrix = m.identity(m.create());
var pMatrix = m.identity(m.create());
var tmpMatrix = m.identity(m.create());
var mvpMatrix =m.identity(m.create());
var qMatrix   = m.identity(m.create());

var xQuaternion = q.identity(q.create());

shader.bind();
var uniLocation = new Array<any>();
uniLocation.push(shader.uniformIndex('mvpMatrix'));
uniLocation.push(shader.uniformIndex('pointSize'));


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

(function(){

        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clearDepth(1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        cnt++;
        var rad = (cnt%360)*Math.PI/180;
        qMatrix = q.ToMat4x4(xQuaternion);

        var camPosition = [0.0,5.0,10.0];
        var camUpDirection = [0.0,1.0,0.0];

        vMatrix = m.viewMatrix(camPosition, [0, 0, 0], camUpDirection);
        vMatrix = m.multiply(vMatrix,qMatrix);
        pMatrix = m.perspectiveMatrix(45, canvas.width / canvas.height, 0.1, 100);
        tmpMatrix =m.multiply(pMatrix, vMatrix);

        var pointSize = 10*Math.sin(cnt/50);
        mMatrix = m.identity(mMatrix);
        mMatrix = m.rotate(mMatrix,rad, [0, 1, 0]);
        mvpMatrix = m.multiply(tmpMatrix, mMatrix);

        gl.uniformMatrix4fv(uniLocation[0], false, mvpMatrix);
        gl.uniform1f(uniLocation[1], pointSize);
        
        vbo.bind(shader);
        vbo.draw(gl.POINTS);

        //draw line
        mMatrix = m.identity(mMatrix);
        mMatrix = m.rotate(mMatrix,Math.PI / 2, [1, 0, 0]);
        mMatrix = m.scale(mMatrix, [3.0, 3.0, 1.0]);
        mvpMatrix = m.multiply(tmpMatrix, mMatrix);
        gl.uniformMatrix4fv(uniLocation[0], false, mvpMatrix);
        vbo_line.bind(shader);
        vbo_line.draw(gl.LINES);


        gl.flush();
        setTimeout(arguments.callee, 1000 / 30);
})();