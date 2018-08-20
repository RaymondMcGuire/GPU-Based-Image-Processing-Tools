/* =========================================================================
 *
 *  webgl_utils.ts
 *  utils for webgl
 *  part of source code referenced by tantalum-gl.js
 * ========================================================================= */
module EcognitaMathLib {
    declare var gl: any;
    declare var multiBufExt: any;

    export function GetGLTypeSize(type) {
        switch (type) {
        case gl.BYTE:
        case gl.UNSIGNED_BYTE:
            return 1;
        case gl.SHORT:
        case gl.UNSIGNED_SHORT:
            return 2;
        case gl.INT:
        case gl.UNSIGNED_INT:
        case gl.FLOAT:
            return 4;
        default:
            return 0;
        }
    }

    export class WebGL_Texture {
        type:any;
        format:any;
        glName:any;
        texture:any;
        constructor( channels, isFloat, texels) {
            this.type     = isFloat   ? gl.FLOAT         : gl.UNSIGNED_BYTE;
            this.format   = [gl.LUMINANCE, gl.RG, gl.RGB, gl.RGBA][channels - 1];

            this.glName = gl.createTexture();
            this.bind(this.glName);
            gl.texImage2D(gl.TEXTURE_2D, 0, this.format, this.format, this.type, texels);
            gl.generateMipmap(gl.TEXTURE_2D);
            this.bind(null);
            this.texture = this.glName;
        }

        bind(tex:any){
            gl.bindTexture(gl.TEXTURE_2D, tex);
        }

    }

    export class WebGL_RenderTarget{
        glName:any;
        constructor() {
            this.glName = gl.createFramebuffer();
        }
        bind() {gl.bindFramebuffer(gl.FRAMEBUFFER, this.glName);}

        unbind(){gl.bindFramebuffer(gl.FRAMEBUFFER, null);}

        attachTexture(texture:any, index:number) {
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0 + index, gl.TEXTURE_2D, texture.glName, 0);
        }

        detachTexture(index:number) {
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0 + index, gl.TEXTURE_2D, null, 0);
        }

        drawBuffers(numBufs:number) {
            var buffers = [];
            for (var i = 0; i < numBufs; ++i)
                buffers.push(gl.COLOR_ATTACHMENT0 + i);
            multiBufExt.drawBuffersWEBGL(buffers);
        }
    }

    export class WebGL_Shader{
        vertex:any;
        fragment:any;
        program:any;
        uniforms:any;
        constructor(shaderDict:any, vert:any, frag:any) {
            this.vertex   = this.createShaderObject(shaderDict, vert, false);
            this.fragment = this.createShaderObject(shaderDict, frag, true);
            
            this.program = gl.createProgram();
            gl.attachShader(this.program, this.vertex);
            gl.attachShader(this.program, this.fragment);
            gl.linkProgram(this.program);
            
            this.uniforms = {};
    
            if (!gl.getProgramParameter(this.program, gl.LINK_STATUS))
                alert("Could not initialise shaders");
        }

        bind() {
            gl.useProgram(this.program);
        }

        createShaderObject(shaderDict:any, name:any, isFragment:any) {
            var shaderSource = this.resolveShaderSource(shaderDict, name);
            var shaderObject = gl.createShader(isFragment ? gl.FRAGMENT_SHADER : gl.VERTEX_SHADER);
            gl.shaderSource(shaderObject, shaderSource);
            gl.compileShader(shaderObject);
    
            if (!gl.getShaderParameter(shaderObject, gl.COMPILE_STATUS)) {
                /* Add some line numbers for convenience */
                var lines = shaderSource.split("\n");
                for (var i = 0; i < lines.length; ++i)
                    lines[i] = ("   " + (i + 1)).slice(-4) + " | " + lines[i];
                shaderSource = lines.join("\n");
            
                throw new Error(
                    (isFragment ? "Fragment" : "Vertex") + " shader compilation error for shader '" + name + "':\n\n    " +
                    gl.getShaderInfoLog(shaderObject).split("\n").join("\n    ") +
                    "\nThe expanded shader source code was:\n\n" +
                    shaderSource);
            }
    
            return shaderObject;
        }

        resolveShaderSource(shaderDict:any, name:any) {
            if (!(name in shaderDict))
                throw new Error("Unable to find shader source for '" + name + "'");
            var shaderSource = shaderDict[name];
            
            /* Rudimentary include handling for convenience.
               Not the most robust, but it will do for our purposes */
            var pattern = new RegExp('#include "(.+)"');
            var match;
            while (match = pattern.exec(shaderSource)) {
                shaderSource = shaderSource.slice(0, match.index) +
                               this.resolveShaderSource(shaderDict, match[1]) +
                               shaderSource.slice(match.index + match[0].length);
            }
            
            return shaderSource;
        }

        uniformIndex(name:any) {
            if (!(name in this.uniforms))
                this.uniforms[name] = gl.getUniformLocation(this.program, name);
            return this.uniforms[name];
        }

        uniformTexture(name:any, texture:any) {
            var id = this.uniformIndex(name);
            if (id != -1)
                gl.uniform1i(id, texture.boundUnit);
        }

        uniformF(name:any, f:any) {
            var id = this.uniformIndex(name);
            if (id != -1)
                gl.uniform1f(id, f);
        }

        uniform2F(name:any, f1:any, f2:any) {
            var id = this.uniformIndex(name);
            if (id != -1)
                gl.uniform2f(id, f1, f2);
        }
    }

    //add attribute -> init -> copy -> bind -> draw -> release
    export class WebGL_VertexBuffer{
        attributes:any;
        elementSize:number;
        glName:any;
        length:number;
        constructor() {
            this.attributes = [];
            this.elementSize = 0;
        }

        bind(shader:any) {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.glName);

            for (var i = 0; i < this.attributes.length; ++i) {
                this.attributes[i].index = gl.getAttribLocation(shader.program, this.attributes[i].name);
                if (this.attributes[i].index >= 0) {
                    var attr = this.attributes[i];
                    gl.enableVertexAttribArray(attr.index);
                    gl.vertexAttribPointer(attr.index, attr.size, attr.type, attr.norm, this.elementSize, attr.offset);
                }
            }
        }

        release(){
            for (var i = 0; i < this.attributes.length; ++i) {
                if (this.attributes[i].index >= 0) {
                    gl.disableVertexAttribArray(this.attributes[i].index);
                    this.attributes[i].index = -1;
                }
            }
        }

        addAttribute (name:any, size:any, type:any, norm:any) {
            this.attributes.push({
                "name": name,
                "size": size,
                "type": type,
                "norm": norm,
                "offset": this.elementSize,
                "index": -1
            });
            this.elementSize += size*GetGLTypeSize(type);
        }

        init(numVerts:number) {
            this.length = numVerts;
            this.glName = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this.glName);
            gl.bufferData(gl.ARRAY_BUFFER, this.length*this.elementSize, gl.STATIC_DRAW);
        }

        copy(data:any) {
            data = new Float32Array(data);
            if (data.byteLength != this.length*this.elementSize)
                throw new Error("Resizing VBO during copy strongly discouraged");
            gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
            gl.bindBuffer(gl.ARRAY_BUFFER, null);
        }

        draw (mode:any, length?:number) {
            gl.drawArrays(mode, 0, length ? length : this.length);
        }
    }

    export class WebGL_IndexBuffer{
        attributes:any;
        glName:any;
        length:number;
        constructor() {}

        bind() {
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.glName);
        }

        init(index:any) {
            this.length = index.length;
            this.glName = gl.createBuffer();
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.glName);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(index), gl.STATIC_DRAW);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        }

        draw (mode:any, length?:number) {
            gl.drawElements(mode, length ? length : this.length, gl.UNSIGNED_SHORT, 0);
        }
    }
}