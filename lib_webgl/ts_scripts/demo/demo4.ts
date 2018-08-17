/* =========================================================================
 *
 *  demo3.ts
 *  test some webgl demo
 *  
 * ========================================================================= */
/// <reference path="../lib/webgl_matrix.ts" />
/// <reference path="../lib/webgl_utils.ts" />
/// <reference path="../lib/webgl_shaders.ts" />

var canvas = <any>document.getElementById('canvas');
canvas.width = 500;
canvas.height = 300;
try {
    var gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
} catch (e) {}
if (!gl)
    throw new Error("Could not initialise WebGL");

var cnt =0;

var shader     = new EcognitaMathLib.WebGL_Shader(Shaders, "demo1-vert", "demo1-frag");

var vbo = new EcognitaMathLib.WebGL_VertexBuffer();
var ibo = new EcognitaMathLib.WebGL_IndexBuffer();

vbo.addAttribute("position", 3, gl.FLOAT, false);
vbo.addAttribute("color", 4, gl.FLOAT, false);
vbo.init(4);

vbo.copy([0.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0,
          1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 1.0,
         -1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 1.0,
          0.0,-1.0, 0.0, 1.0, 1.0, 1.0, 1.0]);
vbo.bind(shader);

ibo.init([0,1,2,
          1,2,3]);
ibo.bind();

var m = new EcognitaMathLib.WebGLMatrix();

var mMatrix = m.identity(m.create());
var vMatrix = m.viewMatrix([0.0, 0.0, 5.0], [0, 0, 0], [0, 1, 0]);
var pMatrix = m.perspectiveMatrix(45, canvas.width / canvas.height, 0.1, 100);
var tmpMatrix = m.multiply(pMatrix, vMatrix);
var mvpMatrix =m.identity(m.create());

shader.bind();
var uniLocation =shader.uniformIndex('mvpMatrix');

(function(){

        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clearDepth(1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
        cnt++;
        var rad = (cnt%360) * Math.PI/180;

        //draw square
        mMatrix =m.identity(mMatrix);
        mMatrix =m.rotate(mMatrix,rad,[0,1,0]);
        mvpMatrix = m.multiply(tmpMatrix, mMatrix);
        gl.uniformMatrix4fv(uniLocation, false, mvpMatrix);
        ibo.draw(gl.TRIANGLES);
        gl.flush();
        setTimeout(arguments.callee, 1000 / 30);
})();