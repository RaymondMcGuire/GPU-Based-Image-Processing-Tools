/* =========================================================================
 *
 *  demo2.ts
 *  test some webgl demo
 *  
 * ========================================================================= */
/// <reference path="./webgl_matrix.ts" />
/// <reference path="./webgl_utils.ts" />
/// <reference path="./webgl_shaders.ts" />

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

var shader     = new EcognitaMathLib.WebGL_Shader(Shaders, "demo1-vert", "demo1-frag");

var vbo = new EcognitaMathLib.WebGL_VertexBuffer();

vbo.addAttribute("position", 3, gl.FLOAT, false);
vbo.addAttribute("color", 4, gl.FLOAT, false);
vbo.init(3);

vbo.copy(new Float32Array([0.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0,
                           1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 1.0,
                          -1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 1.0]));

vbo.bind();
var m = new EcognitaMathLib.WebGLMatrix();

var mMatrix = m.identity(m.create());
var vMatrix = m.viewMatrix([0.0, 0.0, 3.0], [0, 0, 0], [0, 1, 0]);
var pMatrix = m.perspectiveMatrix(90, canvas.width / canvas.height, 0.1, 100);
var tmpMatrix = m.multiply(pMatrix, vMatrix);
mMatrix =m.translate(mMatrix,[1.5,0.0,0.0]);
var mvpMatrix = m.multiply(tmpMatrix, mMatrix);

shader.bind();
var uniLocation =shader.uniformIndex('mvpMatrix');
//draw first triangle
gl.uniformMatrix4fv(uniLocation, false, mvpMatrix);
vbo.draw(shader, gl.TRIANGLES);

//draw second triangle
mMatrix =m.identity(mMatrix);
mMatrix =m.translate(mMatrix,[-1.5,0.0,0.0]);
mvpMatrix = m.multiply(tmpMatrix, mMatrix);
gl.uniformMatrix4fv(uniLocation, false, mvpMatrix);
vbo.draw(shader, gl.TRIANGLES);