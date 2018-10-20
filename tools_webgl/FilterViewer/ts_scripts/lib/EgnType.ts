/* =========================================================================
 *
 *  EgnType.ts
 *  static type
 *  v0.1
 *  
 * ========================================================================= */
module EcognitaWeb3D {
    export enum Filter {
        LAPLACIAN,
        SOBEL,
        GAUSSIAN,
        KUWAHARA,
        GKUWAHARA,
        AKUWAHARA,
        ANISTROPIC,
        LIC,
        NOISELIC,
        DoG,
        XDoG,
        FDoG,
        FXDoG,
        ABSTRACTION
    }

    export enum RenderPipeLine {
        CONVOLUTION_FILTER,
        ANISTROPIC,
        BLOOM_EFFECT,
        CONVOLUTION_TWICE,
        ABSTRACTION
    }
}