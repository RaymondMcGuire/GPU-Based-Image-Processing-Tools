/* =========================================================================
 *
 *  demo18.ts
 *  test some webgl demo
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
    var gl = canvas.getContext("webgl", {stencil: true}) || canvas.getContext("experimental-webgl", {stencil: true});
} catch (e) {}
if (!gl)
    throw new Error("Could not initialise WebGL");

var shader = new EcognitaMathLib.WebGL_Shader(Shaders, "stencilBufferOutline-vert", "stencilBufferOutline-frag");

var torusData = new EcognitaMathLib.TorusModel(64,64,0.25,1,undefined,true,true);
var vbo = new EcognitaMathLib.WebGL_VertexBuffer();
var ibo = new EcognitaMathLib.WebGL_IndexBuffer();

vbo.addAttribute("position", 3, gl.FLOAT, false);
vbo.addAttribute("normal", 3, gl.FLOAT, false);
vbo.addAttribute("color", 4, gl.FLOAT, false);
vbo.addAttribute("textureCoord", 2, gl.FLOAT, false);

vbo.init(torusData.data.length/12);
vbo.copy(torusData.data);
//vbo.bind(shader);

ibo.init(torusData.index);
ibo.bind();

var skyData = new EcognitaMathLib.ShpereModel(64,64,1,[1,1,1,1],true,true);
var vbo_sky = new EcognitaMathLib.WebGL_VertexBuffer();
var ibo_sky = new EcognitaMathLib.WebGL_IndexBuffer();

vbo_sky.addAttribute("position", 3, gl.FLOAT, false);
vbo_sky.addAttribute("normal", 3, gl.FLOAT, false);
vbo_sky.addAttribute("color", 4, gl.FLOAT, false);
vbo_sky.addAttribute("textureCoord", 2, gl.FLOAT, false);

vbo_sky.init(skyData.data.length/12);
vbo_sky.copy(skyData.data);
//vbo_sky.bind(shader);

ibo_sky.init(skyData.index);
ibo_sky.bind();


var m = new EcognitaMathLib.WebGLMatrix();
var q = new EcognitaMathLib.WebGLQuaternion();

var mMatrix = m.identity(m.create());
var vMatrix = m.identity(m.create());
var pMatrix = m.identity(m.create());
var tmpMatrix = m.identity(m.create());
var mvpMatrix =m.identity(m.create());
var invMatrix =m.identity(m.create());
var qMatrix   = m.identity(m.create());

var xQuaternion = q.identity(q.create());
var lightDirection = [1.0, 1.0, 1.0];

shader.bind();
var uniLocation = new Array<any>();
uniLocation.push(shader.uniformIndex('mvpMatrix'));
uniLocation.push(shader.uniformIndex('invMatrix'));
uniLocation.push(shader.uniformIndex('lightDirection'));
uniLocation.push(shader.uniformIndex('useLight'));
uniLocation.push(shader.uniformIndex('texture'));
uniLocation.push(shader.uniformIndex('useTexture'));
uniLocation.push(shader.uniformIndex('outline'));

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

var tex =null;
var img = EcognitaMathLib.imread("./img/tex2.png");
img.onload = function(){
    tex = new EcognitaMathLib.WebGL_Texture(4,false,img);
};


(function(){

        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clearDepth(1.0);
        gl.clearStencil(0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);

        cnt++;
        var rad = (cnt%360)*Math.PI/180;
        qMatrix = q.ToMat4x4(xQuaternion);

        var camPosition = [0.0,0.0,10.0];
        var camUpDirection = [0.0,1.0,0.0];

        vMatrix = m.viewMatrix(camPosition, [0, 0, 0], camUpDirection);
        vMatrix = m.multiply(vMatrix,qMatrix);
        pMatrix = m.perspectiveMatrix(45, canvas.width / canvas.height, 0.1, 100);
        tmpMatrix =m.multiply(pMatrix, vMatrix);

        if(tex!=null){
            gl.activeTexture(gl.TEXTURE0);
            tex.bind(tex.texture);
        }

        //stencil(TODO refactor)
        gl.enable(gl.STENCIL_TEST);
        //using color map and depth map
        gl.colorMask(false, false, false, false);
        gl.depthMask(false);
        
        gl.stencilFunc(gl.ALWAYS, 1, ~0);
        gl.stencilOp(gl.KEEP, gl.REPLACE, gl.REPLACE);
        
        vbo.bind(shader);
        ibo.bind();

        mMatrix = m.identity(mMatrix);
        mMatrix = m.rotate(mMatrix,rad, [0, 1, 1]);
        mvpMatrix = m.multiply(tmpMatrix, mMatrix);

        gl.uniformMatrix4fv(uniLocation[0], false, mvpMatrix);
		gl.uniform1i(uniLocation[3], false);
		gl.uniform1i(uniLocation[5], false);
        gl.uniform1i(uniLocation[6], true);


        ibo.draw(gl.TRIANGLES);


        gl.colorMask(true, true, true, true);
        gl.depthMask(true);
        
        gl.stencilFunc(gl.EQUAL, 0, ~0);
        gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP);
       
        vbo_sky.bind(shader);
        ibo_sky.bind();

        mMatrix = m.identity(mMatrix);
		mMatrix = m.scale(mMatrix, [50.0, 50.0, 50.0]);
        mvpMatrix = m.multiply(tmpMatrix, mMatrix);
        
        gl.uniformMatrix4fv(uniLocation[0], false, mvpMatrix);
		gl.uniform1i(uniLocation[3], false);
		gl.uniform1i(uniLocation[4], 0);
		gl.uniform1i(uniLocation[5], true);
        gl.uniform1i(uniLocation[6], false);


        ibo_sky.draw(gl.TRIANGLES);

        gl.disable(gl.STENCIL_TEST);
        
        vbo.bind(shader);
        ibo.bind();

        mMatrix = m.identity(mMatrix);
        mMatrix = m.rotate(mMatrix,rad, [0, 1, 1]);
        mvpMatrix = m.multiply(tmpMatrix, mMatrix);

        gl.uniformMatrix4fv(uniLocation[0], false, mvpMatrix);
		gl.uniformMatrix4fv(uniLocation[1], false, invMatrix);
		gl.uniform3fv(uniLocation[2], lightDirection);
		gl.uniform1i(uniLocation[3], true);
		gl.uniform1i(uniLocation[5], false);
        gl.uniform1i(uniLocation[6], false);
        
        ibo.draw(gl.TRIANGLES);

        gl.flush();
        setTimeout(arguments.callee, 1000 / 30);
})();