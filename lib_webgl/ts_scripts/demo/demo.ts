/* =========================================================================
 *
 *  demo.ts
 *  test some webgl demo
 *  
 * ========================================================================= */
/// <reference path="../lib/webgl_matrix.ts" />
/// <reference path="../lib/webgl_utils.ts" />
/// <reference path="../lib/webgl_shaders.ts" />

var canvas = <any>document.getElementById('canvas');
canvas.width = 300;
canvas.height = 300;
try {
    var gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
} catch (e) {}
if (!gl)
    throw new Error("Could not initialise WebGL");
gl.clearColor(0.0, 0.0, 0.0, 1.0);
gl.clearDepth(1.0);
gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

var shader     = new EcognitaMathLib.WebGL_Shader(Shaders, "demo-vert", "demo-frag");

var vbo = new EcognitaMathLib.WebGL_VertexBuffer();

vbo.addAttribute("position", 3, gl.FLOAT, false);
vbo.init(3);
vbo.copy([0.0, 1.0, 0.0,1.0, 0.0, 0.0,-1.0, 0.0, 0.0]);
vbo.bind(shader);

var m = new EcognitaMathLib.WebGLMatrix();

var mMatrix = m.identity(m.create());
var vMatrix = m.viewMatrix([0.0, 1.0, 3.0], [0, 0, 0], [0, 1, 0]);
var pMatrix = m.perspectiveMatrix(90, canvas.width / canvas.height, 0.1, 100);
var mvpMatrix = m.multiply(pMatrix, vMatrix);
mvpMatrix =m.multiply(mvpMatrix, mMatrix);

shader.bind();
var uniLocation =shader.uniformIndex('mvpMatrix');

gl.uniformMatrix4fv(uniLocation, false, mvpMatrix);
vbo.draw(gl.TRIANGLES);
vbo.release();