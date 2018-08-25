/* =========================================================================
 *
 *  demo10.ts
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

var shader     = new EcognitaMathLib.WebGL_Shader(Shaders, "pointLighting-vert", "pointLighting-frag");

var vbo_torus = new EcognitaMathLib.WebGL_VertexBuffer();
var ibo_torus = new EcognitaMathLib.WebGL_IndexBuffer();
var torusData = new EcognitaMathLib.TorusModel(64,64,0.5,1.5,undefined,true);
vbo_torus.addAttribute("position", 3, gl.FLOAT, false);
vbo_torus.addAttribute("normal", 3, gl.FLOAT, false);
vbo_torus.addAttribute("color", 4, gl.FLOAT, false);
vbo_torus.init(torusData.data.length/10);
vbo_torus.copy(torusData.data);
//vbo_torus.bind(shader);

ibo_torus.init(torusData.index);
ibo_torus.bind();

var vbo_sphere = new EcognitaMathLib.WebGL_VertexBuffer();
var ibo_sphere = new EcognitaMathLib.WebGL_IndexBuffer();
var sphereData= new EcognitaMathLib.ShpereModel(64,64,2.0,undefined,true);
vbo_sphere.addAttribute("position", 3, gl.FLOAT, false);
vbo_sphere.addAttribute("normal", 3, gl.FLOAT, false);
vbo_sphere.addAttribute("color", 4, gl.FLOAT, false);
vbo_sphere.init(sphereData.data.length/10);
vbo_sphere.copy(sphereData.data);
//vbo_sphere.bind(shader);

ibo_sphere.init(sphereData.index);
ibo_sphere.bind();


var m = new EcognitaMathLib.WebGLMatrix();
var lightPosition = [0.0, 0.0, 0.0];
var ambientColor = [0.1, 0.1, 0.1, 1.0];
var eyeDirection = [0.0, 0.0, 20.0];

var mMatrix = m.identity(m.create());
var vMatrix = m.viewMatrix(eyeDirection, [0, 0, 0], [0, 1, 0]);
var pMatrix = m.perspectiveMatrix(45, canvas.width / canvas.height, 0.1, 100);
var tmpMatrix = m.multiply(pMatrix, vMatrix);
var mvpMatrix =m.identity(m.create());
var invMatrix = m.identity(m.create());

shader.bind();
var uniLocation = new Array<any>();
uniLocation.push(shader.uniformIndex('mvpMatrix'));
uniLocation.push(shader.uniformIndex('mMatrix'));
uniLocation.push(shader.uniformIndex('invMatrix'));
uniLocation.push(shader.uniformIndex('lightPosition'));
uniLocation.push(shader.uniformIndex('ambientColor'));
uniLocation.push(shader.uniformIndex('eyeDirection'));

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
        var tx = Math.cos(rad) * 3.5;
        var ty = Math.sin(rad) * 3.5;
        var tz = Math.sin(rad) * 3.5;

        //torus
        mMatrix =m.identity(mMatrix);
        mMatrix = m.translate(mMatrix, [tx, -ty, -tz]);
        mMatrix =m.rotate(mMatrix,-rad,[0,1,1]);
        mvpMatrix = m.multiply(tmpMatrix, mMatrix);
        invMatrix = m.inverse(mMatrix);

        gl.uniformMatrix4fv(uniLocation[0], false, mvpMatrix);
        gl.uniformMatrix4fv(uniLocation[1], false, mMatrix);
        gl.uniformMatrix4fv(uniLocation[2], false, invMatrix);
        gl.uniform3fv(uniLocation[3], lightPosition);
        gl.uniform4fv(uniLocation[4], ambientColor);
        gl.uniform3fv(uniLocation[5], eyeDirection);

        vbo_torus.bind(shader);
        ibo_torus.bind();
        ibo_torus.draw(gl.TRIANGLES);

        //sphere
        mMatrix =m.identity(mMatrix);
        mMatrix = m.translate(mMatrix, [-tx, ty, tz]);
        mvpMatrix = m.multiply(tmpMatrix, mMatrix);
        invMatrix = m.inverse(mMatrix);

        gl.uniformMatrix4fv(uniLocation[0], false, mvpMatrix);
        gl.uniformMatrix4fv(uniLocation[1], false, mMatrix);
        gl.uniformMatrix4fv(uniLocation[2], false, invMatrix);

        vbo_sphere.bind(shader);
        ibo_sphere.bind();
        ibo_sphere.draw(gl.TRIANGLES);

        gl.flush();
        setTimeout(arguments.callee, 1000 / 30);
})();