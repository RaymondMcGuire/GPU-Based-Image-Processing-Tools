/* =========================================================================
 *
 *  demo8.ts
 *  test some webgl demo
 *  
 * ========================================================================= */
/// <reference path="../lib/webgl_matrix.ts" />
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

var cnt =0;

var shader     = new EcognitaMathLib.WebGL_Shader(Shaders, "specular-vert", "specular-frag");

var vbo = new EcognitaMathLib.WebGL_VertexBuffer();
var ibo = new EcognitaMathLib.WebGL_IndexBuffer();
var torusData = new EcognitaMathLib.TorusModel(32,32,1,2,true);

vbo.addAttribute("position", 3, gl.FLOAT, false);
vbo.addAttribute("normal", 3, gl.FLOAT, false);
vbo.addAttribute("color", 4, gl.FLOAT, false);
vbo.init(torusData.data.length/10);
vbo.copy(torusData.data);
vbo.bind(shader);

ibo.init(torusData.index);
ibo.bind();

var m = new EcognitaMathLib.WebGLMatrix();

var mMatrix = m.identity(m.create());
var vMatrix = m.viewMatrix([0.0, 0.0, 20], [0, 0, 0], [0, 1, 0]);
var pMatrix = m.perspectiveMatrix(45, canvas.width / canvas.height, 0.1, 100);
var tmpMatrix = m.multiply(pMatrix, vMatrix);
var mvpMatrix =m.identity(m.create());
var invMatrix = m.identity(m.create());

shader.bind();
var uniLocation = new Array<any>();
uniLocation.push(shader.uniformIndex('mvpMatrix'));
uniLocation.push(shader.uniformIndex('invMatrix'));
uniLocation.push(shader.uniformIndex('lightDirection'));
uniLocation.push(shader.uniformIndex('ambientColor'));
uniLocation.push(shader.uniformIndex('eyeDirection'));

var lightDirection = [-0.5, 0.5, 0.5];
var ambientColor = [0.1, 0.1, 0.1, 1.0];
var eyeDirection = [0.0, 0.0, 20.0];

//depth test and cull face
gl.enable(gl.DEPTH_TEST);
gl.depthFunc(gl.LEQUAL);
gl.enable(gl.CULL_FACE);
(function(){

        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clearDepth(1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
        cnt++;
        var rad = (cnt%360) * Math.PI/180;

        //draw square
        mMatrix =m.identity(mMatrix);
        mMatrix =m.rotate(mMatrix,rad,[0,1,1]);
        mvpMatrix = m.multiply(tmpMatrix, mMatrix);
        invMatrix = m.inverse(mMatrix);

        gl.uniformMatrix4fv(uniLocation[0], false, mvpMatrix);
        gl.uniformMatrix4fv(uniLocation[1], false, invMatrix);
        gl.uniform3fv(uniLocation[2], lightDirection);
        gl.uniform4fv(uniLocation[3], ambientColor);
        gl.uniform3fv(uniLocation[4], eyeDirection);

        ibo.draw(gl.TRIANGLES);
        gl.flush();
        setTimeout(arguments.callee, 1000 / 30);
})();