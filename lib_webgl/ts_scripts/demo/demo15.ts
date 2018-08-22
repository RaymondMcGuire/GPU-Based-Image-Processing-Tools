/* =========================================================================
 *
 *  demo15.ts
 *  test some webgl demo
 *  
 * ========================================================================= */
/// <reference path="../lib/cv_imread.ts" />
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


var shader = new EcognitaMathLib.WebGL_Shader(Shaders, "texture-vert", "texture-frag");

var vbo = new EcognitaMathLib.WebGL_VertexBuffer();
var ibo = new EcognitaMathLib.WebGL_IndexBuffer();
var tex0 = null;
var tex1 = null;

var img1 = EcognitaMathLib.imread("./img/tex0.png");
img1.onload = function(){
    tex0 = new EcognitaMathLib.WebGL_Texture(4,false,img1);
};
var img2 = EcognitaMathLib.imread("./img/tex1.png");
img2.onload = function(){
    tex1 = new EcognitaMathLib.WebGL_Texture(4,false,img2);
};

vbo.addAttribute("position", 3, gl.FLOAT, false);
vbo.addAttribute("color", 4, gl.FLOAT, false);
vbo.addAttribute("textureCoord", 2, gl.FLOAT, false);

var data = [
    -1.0,  1.0,  0.0, 1.0, 1.0, 1.0, 1.0, 0.0, 0.0,
     1.0,  1.0,  0.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.0,
    -1.0, -1.0,  0.0, 1.0, 1.0, 1.0, 1.0, 0.0, 1.0,
     1.0, -1.0,  0.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0
];

var index = [
    0, 1, 2,
    3, 2, 1
];

vbo.init(4);
vbo.copy(data);
vbo.bind(shader);

ibo.init(index);
ibo.bind();

var m = new EcognitaMathLib.WebGLMatrix();
var q = new EcognitaMathLib.WebGLQuaternion();

var mMatrix = m.identity(m.create());
var vMatrix = m.identity(m.create());
var pMatrix = m.identity(m.create());
var tmpMatrix = m.identity(m.create());
var mvpMatrix =m.identity(m.create());
var invMatrix = m.identity(m.create());
var qMatrix   = m.identity(m.create());

var xQuaternion = q.identity(q.create());

shader.bind();
var uniLocation = new Array<any>();
uniLocation.push(shader.uniformIndex('mvpMatrix'));
uniLocation.push(shader.uniformIndex('texture'));


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

//depth test and blend
gl.enable(gl.DEPTH_TEST);
gl.depthFunc(gl.LEQUAL);
gl.enable(gl.BLEND);
gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE);

(function(){

        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clearDepth(1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
        qMatrix = q.ToMat4x4(xQuaternion);

        var camPosition = [0.0,5.0,10.0];
        var camUpDirection = [0.0,1.0,0.0];

        //camera view matrix
        vMatrix = m.viewMatrix(camPosition, [0, 0, 0], camUpDirection);
        //billboard matrix
        invMatrix = m.viewMatrix( [0, 0, 0],camPosition, camUpDirection);

        //user input -> cam rotate
        vMatrix = m.multiply(vMatrix,qMatrix);
        invMatrix = m.multiply(invMatrix,qMatrix);
        //get billboard inv matrix
        //cam->"a" direction rotate theta == billboard ->"-a" direction rotate theta
        invMatrix = m.inverse(invMatrix);

        //calculate vp matrix
        pMatrix = m.perspectiveMatrix(45, canvas.width / canvas.height, 0.1, 100);
        tmpMatrix =m.multiply(pMatrix, vMatrix);

        //tex1 active
        if(tex1!=null){
            gl.activeTexture(gl.TEXTURE1);
            tex1.bind(tex1.texture);
            gl.uniform1i(uniLocation[1], 1);
        }

        mMatrix = m.identity(mMatrix);
        mMatrix = m.rotate(mMatrix,Math.PI / 2, [1, 0, 0]);
        mMatrix = m.scale(mMatrix, [3.0, 3.0, 1.0]);
        mvpMatrix = m.multiply(tmpMatrix, mMatrix);

        gl.uniformMatrix4fv(uniLocation[0], false, mvpMatrix);
        ibo.draw(gl.TRIANGLES);

        //tex0 active
        if(tex0!=null){
            gl.activeTexture(gl.TEXTURE0);
            tex0.bind(tex0.texture);
            gl.uniform1i(uniLocation[1], 0);
        }

        mMatrix = m.identity(mMatrix);
        mMatrix = m.translate(mMatrix,[0.0, 1.0, 0.0]);
        mMatrix = m.multiply(mMatrix, invMatrix);
        mvpMatrix = m.multiply(tmpMatrix, mMatrix);

        gl.uniformMatrix4fv(uniLocation[0], false, mvpMatrix);
        ibo.draw(gl.TRIANGLES);

        gl.flush();
        setTimeout(arguments.callee, 1000 / 30);
})();