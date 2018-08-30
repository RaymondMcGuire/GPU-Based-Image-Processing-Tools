/* =========================================================================
 *
 *  demo25.ts
 *  dynamic cube texture mapping
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
canvas.width = 512;
canvas.height = 512;
try {
    var gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
} catch (e) {}
if (!gl)
    throw new Error("Could not initialise WebGL");

var specularShader = new EcognitaMathLib.WebGL_Shader(Shaders,"specular-vert", "specular-frag");
var cubeTexMappingShader = new EcognitaMathLib.WebGL_Shader(Shaders,"cubeTexMapping-vert", "cubeTexMapping-frag");
//specular Shader attribute and uniform setting 
var specAttrNameArray = new Array("position","normal","color");
var specSizeArray = new Array(3,3,4);
var specTotalSize = 10;

var uniLocForSpec = new Array<any>();
uniLocForSpec.push(specularShader.uniformIndex('mvpMatrix'));
uniLocForSpec.push(specularShader.uniformIndex('invMatrix'));
uniLocForSpec.push(specularShader.uniformIndex('lightDirection'));
uniLocForSpec.push(specularShader.uniformIndex('eyeDirection'));
uniLocForSpec.push(specularShader.uniformIndex('ambientColor'));

//cube mapping Shader attribute and uniform setting 
var cubeTexAttrNameArray = new Array("position","normal","color");
var cubeTexSizeArray = new Array(3,3,4);
var cubeTexTotalSize = 10;

var uniLocForCubeMap = new Array<any>();
uniLocForCubeMap.push(cubeTexMappingShader.uniformIndex('mMatrix'));
uniLocForCubeMap.push(cubeTexMappingShader.uniformIndex('mvpMatrix'));
uniLocForCubeMap.push(cubeTexMappingShader.uniformIndex('eyePosition'));
uniLocForCubeMap.push(cubeTexMappingShader.uniformIndex('cubeTexture'));
uniLocForCubeMap.push(cubeTexMappingShader.uniformIndex('reflection'));


//cubeTexMappingShader.bind();
//init model
var cubeData = new EcognitaMathLib.CubeModel(2,[1,1,1,1],true,false);
var vbo_cube = new EcognitaMathLib.WebGL_VertexBuffer();
var ibo_cube = new EcognitaMathLib.WebGL_IndexBuffer();

vbo_cube.addAttributes(cubeTexAttrNameArray,cubeTexSizeArray);

vbo_cube.init(cubeData.data.length/cubeTexTotalSize);
vbo_cube.copy(cubeData.data);
vbo_cube.bind(cubeTexMappingShader);

ibo_cube.init(cubeData.index);
ibo_cube.bind();

var sphereData = new EcognitaMathLib.ShpereModel(64, 64, 3, [1.0, 1.0, 1.0, 1.0],true,false); 
var vbo_sphere = new EcognitaMathLib.WebGL_VertexBuffer();
var ibo_sphere = new EcognitaMathLib.WebGL_IndexBuffer();

vbo_sphere.addAttributes(cubeTexAttrNameArray,cubeTexSizeArray)

vbo_sphere.init(sphereData.data.length/cubeTexTotalSize);
vbo_sphere.copy(sphereData.data);
vbo_sphere.bind(cubeTexMappingShader);

ibo_sphere.init(sphereData.index);
ibo_sphere.bind();


//specularShader.bind();
var torusData = new EcognitaMathLib.TorusModel(64, 64, 0.5, 1.0, [1.0, 1.0, 1.0, 1.0],true,false); 
var vbo_torus = new EcognitaMathLib.WebGL_VertexBuffer();
var ibo_torus = new EcognitaMathLib.WebGL_IndexBuffer();

vbo_torus.addAttributes(specAttrNameArray,specSizeArray);

vbo_torus.init(torusData.data.length/specTotalSize);
vbo_torus.copy(torusData.data);
vbo_torus.bind(specularShader);

ibo_torus.init(torusData.index);
ibo_torus.bind();


var m = new EcognitaMathLib.WebGLMatrix();
var q = new EcognitaMathLib.WebGLQuaternion();

var mMatrix = m.identity(m.create());
var vMatrix = m.identity(m.create());
var pMatrix = m.identity(m.create());
var tmpMatrix = m.identity(m.create());
var mvpMatrix =m.identity(m.create());
var invMatrix =m.identity(m.create());

var xQuaternion = q.identity(q.create());

//camera operation
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

//cube texture mapping
var cubeImagePath = "./img/cube_texture/";
var texArray = new Array(   cubeImagePath+'px.png',
							cubeImagePath+'py.png',
							cubeImagePath+'pz.png',
							cubeImagePath+'nx.png',
							cubeImagePath+'ny.png',
							cubeImagePath+'nz.png');
var cubeTexureMapping = new EcognitaMathLib.WebGL_CubeMapTexture(texArray);
var eyePosition = [0.0, 0.0, 20.0];

var fBufferWidth  = 512;
var fBufferHeight = 512;
var frameBuffer = new EcognitaMathLib.WebGL_FrameBuffer(fBufferWidth,fBufferHeight);
frameBuffer.bindFrameBuffer();
frameBuffer.bindDepthBuffer();
frameBuffer.renderToCubeTexture(cubeTexureMapping.cubeTarget);
frameBuffer.releaseCubeTex();

var cnt = 0;
(function(){

        cnt++;
		var rad  = (cnt % 360) * Math.PI / 180;
		
		//setting different view points
		var eye = new Array();
		var camUp = new Array();
		var pos = new Array();
		var amb = new Array();
		frameBuffer.bindFrameBuffer();

		//rendering the six different direction scenes for the cube maps
		for(var i = 0; i < cubeTexureMapping.cubeTarget.length; i++){
			// attach texture to framebuffer
			gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, cubeTexureMapping.cubeTarget[i], frameBuffer.targetTexture, 0);
			
			// init framebuffer
			gl.clearColor(0.0, 0.0, 0.0, 1.0);
			gl.clearDepth(1.0);
			gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
			
			var lightDirection = [-1.0, 1.0, 1.0];
			
			switch(cubeTexureMapping.cubeTarget[i]){
				case gl.TEXTURE_CUBE_MAP_POSITIVE_X:
					eye[i]   = [ 1,  0,  0];
					camUp[i] = [ 0, -1,  0];
					pos[i]   = [ 6,  0,  0];
					amb[i]   = [1.0, 0.5, 0.5, 1.0];
					break;
				case gl.TEXTURE_CUBE_MAP_POSITIVE_Y:
					eye[i]   = [ 0,  1,  0];
					camUp[i] = [ 0,  0,  1];
					pos[i]   = [ 0,  6,  0];
					amb[i]   = [0.5, 1.0, 0.5, 1.0];
					break;
				case gl.TEXTURE_CUBE_MAP_POSITIVE_Z:
					eye[i]   = [ 0,  0,  1];
					camUp[i] = [ 0, -1,  0];
					pos[i]   = [ 0,  0,  6];
					amb[i]   = [0.5, 0.5, 1.0, 1.0];
					break;
				case gl.TEXTURE_CUBE_MAP_NEGATIVE_X:
					eye[i]   = [-1,  0,  0];
					camUp[i] = [ 0, -1,  0];
					pos[i]   = [-6,  0,  0];
					amb[i]   = [0.5, 0.0, 0.0, 1.0];
					break;
				case gl.TEXTURE_CUBE_MAP_NEGATIVE_Y:
					eye[i]   = [ 0, -1,  0];
					camUp[i] = [ 0,  0, -1];
					pos[i]   = [ 0, -6,  0];
					amb[i]   = [0.0, 0.5, 0.0, 1.0];
					break;
				case gl.TEXTURE_CUBE_MAP_NEGATIVE_Z:
					eye[i]   = [ 0,  0, -1];
					camUp[i] = [ 0, -1,  0];
					pos[i]   = [ 0,  0, -6];
					amb[i]   = [0.0, 0.0, 0.5, 1.0];
					break;
				default :
					break;
			}
			
			//adjust the view
			vMatrix = m.viewMatrix([0, 0, 0], eye[i], camUp[i]);
			pMatrix = m.perspectiveMatrix(90, 1.0, 0.1, 200);
			tmpMatrix = m.multiply(pMatrix, vMatrix);

			//re-rendering cube texture maps
			cubeTexMappingShader.bind();
			vbo_cube.bind(cubeTexMappingShader);
			ibo_cube.bind();

			mMatrix = m.identity(mMatrix);
			mMatrix = m.scale(mMatrix, [100.0, 100.0, 100.0]);
			mvpMatrix =  m.multiply(tmpMatrix, mMatrix);
			gl.uniformMatrix4fv(uniLocForCubeMap[0], false, mMatrix);
			gl.uniformMatrix4fv(uniLocForCubeMap[1], false, mvpMatrix);
			gl.uniform3fv(uniLocForCubeMap[2], eyePosition);
			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubeTexureMapping.cubeTexture);
			gl.uniform1i(uniLocForCubeMap[3], 0);
			gl.uniform1i(uniLocForCubeMap[4], false);

			ibo_cube.draw(gl.TRIANGLES);

			//change the eye direction then draw torus
			var invEye = new Array();
			invEye[0] = -eye[i][0];
			invEye[1] = -eye[i][1];
			invEye[2] = -eye[i][2];

			specularShader.bind();
			vbo_torus.bind(specularShader);
			ibo_torus.bind();

			mMatrix = m.identity(mMatrix);
			mMatrix = m.translate(mMatrix, pos[i]);
			mMatrix = m.rotate(mMatrix, rad, eye[i]);
			mvpMatrix = m.multiply(tmpMatrix, mMatrix);
			invMatrix = m.inverse(mMatrix);
			gl.uniformMatrix4fv(uniLocForSpec[0], false, mvpMatrix);
			gl.uniformMatrix4fv(uniLocForSpec[1], false, invMatrix);
			gl.uniform3fv(uniLocForSpec[2], lightDirection);
			gl.uniform3fv(uniLocForSpec[3], invEye);
			gl.uniform4fv(uniLocForSpec[4], amb[i]);
			ibo_torus.draw(gl.TRIANGLES);
		}

		
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);

		gl.clearColor(0.0, 1.0, 0.0, 1.0);
		gl.clearDepth(1.0);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		var camUpDirection = new Array();
		eyePosition = q.ToV3([0.0, 0.0, 20.0], xQuaternion);
		camUpDirection = q.ToV3([0.0, 1.0, 0.0], xQuaternion);
		vMatrix = m.viewMatrix(eyePosition, [0, 0, 0], camUpDirection);
		pMatrix =  m.perspectiveMatrix(45, canvas.width / canvas.height, 0.1, 200);
		tmpMatrix = m.multiply(pMatrix, vMatrix);

		
		//draw background texture: dynamic cube texture mapping
		cubeTexMappingShader.bind();
		vbo_cube.bind(cubeTexMappingShader);
		ibo_cube.bind();

		mMatrix = m.identity(mMatrix);
		mMatrix = m.scale(mMatrix, [100.0, 100.0, 100.0]);
		mvpMatrix =  m.multiply(tmpMatrix, mMatrix);
		gl.uniformMatrix4fv(uniLocForCubeMap[0], false, mMatrix);
		gl.uniformMatrix4fv(uniLocForCubeMap[1], false, mvpMatrix);
		gl.uniform3fv(uniLocForCubeMap[2], eyePosition);
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubeTexureMapping.cubeTexture);
		gl.uniform1i(uniLocForCubeMap[3], 0);
		gl.uniform1i(uniLocForCubeMap[4], false);

		ibo_cube.draw(gl.TRIANGLES);

		//draw sphere
		vbo_sphere.bind(cubeTexMappingShader);
		ibo_sphere.bind();
		mMatrix = m.identity(mMatrix);
		mvpMatrix = m.multiply(tmpMatrix, mMatrix);
		gl.uniformMatrix4fv(uniLocForCubeMap[0], false, mMatrix);
		gl.uniformMatrix4fv(uniLocForCubeMap[1], false, mvpMatrix);
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_CUBE_MAP, frameBuffer.targetTexture);
		gl.uniform1i(uniLocForCubeMap[3], 0);
		gl.uniform1i(uniLocForCubeMap[4], true);
		ibo_sphere.draw(gl.TRIANGLES);
		
		//draw torus
		specularShader.bind();
		vbo_torus.bind(specularShader);
		ibo_torus.bind();
		for(i = 0; i < cubeTexureMapping.cubeTarget.length; i++){
			mMatrix = m.identity(mMatrix);
			mMatrix = m.translate(mMatrix, pos[i]);
			mMatrix = m.rotate(mMatrix, rad, eye[i]);
			mvpMatrix = m.multiply(tmpMatrix, mMatrix);
			invMatrix = m.inverse(mMatrix);
			gl.uniformMatrix4fv(uniLocForSpec[0], false, mvpMatrix);
			gl.uniformMatrix4fv(uniLocForSpec[1], false, invMatrix);
			gl.uniform3fv(uniLocForSpec[2], lightDirection);
			gl.uniform3fv(uniLocForSpec[3], eyePosition);
			gl.uniform4fv(uniLocForSpec[4], amb[i]);
			ibo_torus.draw(gl.TRIANGLES);
		}
		

        gl.flush();
        setTimeout(arguments.callee, 1000 / 30);
})();