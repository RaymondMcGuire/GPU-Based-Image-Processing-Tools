/* =========================================================================
 *
 *  EgnType.ts
 *  static type
 *  v0.1
 *  
 * ========================================================================= */
module EcognitaWeb3D {
    export enum Filter{
        LAPLACIAN,
        SOBEL,
        GAUSSIAN,
        KUWAHARA,
        GKUWAHARA
    }

    export enum RenderPipeLine{
        CONVOLUTION_FILTER,
        BLOOM_EFFECT,
        CONVOLUTION_TWICE
    }
}