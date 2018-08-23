/* =========================================================================
 *
 *  demo12.ts
 *  test some webgl demo
 *  
 * ========================================================================= */
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

var cnt =0;

var shader = new EcognitaMathLib.WebGL_Shader(Shaders, "pointLighting-vert", "pointLighting-frag");

var vbo = new EcognitaMathLib.WebGL_VertexBuffer();
var ibo = new EcognitaMathLib.WebGL_IndexBuffer();
var torusData = new EcognitaMathLib.TorusModel(64,64,0.5,1.5,undefined,true);

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
        var rad2 = (cnt%720) * Math.PI/360;

        xQuaternion = q.rotate(rad2,[1,0,0]);
        camPosition = q.ToV3([0.0, 0.0, 10.0],xQuaternion);
        camUpDirection = q.ToV3([0.0, 1.0, 0.0],xQuaternion);

        vMatrix = m.viewMatrix(camPosition, [0, 0, 0], camUpDirection);
        pMatrix = m.perspectiveMatrix(45, canvas.width / canvas.height, 0.1, 100);
        tmpMatrix =m.multiply(pMatrix, vMatrix);

        mMatrix =m.identity(mMatrix);
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