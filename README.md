# GPU Based Image Processing Tools

A tool for viewing image filters online.

This project has implemented some NPR algorithms you can use it directly and don't need additional packages.

## Getting Started

### Prerequisites

This project is developed by Typescript, so you should construct the Node.js environment.

And then install the Typescript by using this command

```
npm install -g typescript
```

### Compile

After editing the source code,you should compile this project through

.\tools_webgl\FilterViewer\ts_scripts\build\build-tools.bat (For Windows)

.\tools_webgl\FilterViewer\ts_scripts\build\readme-mac.md  (For Mac)


### Usage

Enter the path ".\tools_webgl\FilterViewer\"

I'd like to use "http-server" to view this project. 

You also can use anyway you like to run this project in the local environment.

### Online Demo

You also can view this project's online demo in [URL](https://raymondmcguire.github.io/project/FilterViewer/).

### Preview

 * Image

![Input Image](./tools_webgl/FilterViewer/image/anim.png?raw=true "Input Image")

 * Line Integral Convolution

![LIC](./tools_webgl/FilterViewer/image/LIC.png?raw=true "LIC")

 * Flow eXtend Difference of Gaussian

![FXDoG](./tools_webgl/FilterViewer/image/FXDoG.png?raw=true "FXDoG")

 * Anisotropic KUWAHARA Filter

![AKF](./tools_webgl/FilterViewer/image/AKF.png?raw=true "AKF")

 * Mix Anisotropic KUWAHARA Filter and Flow eXtend Difference of Gaussian

![FXDoG&AKF](./tools_webgl/FilterViewer/image/FXDoG&AKF.png?raw=true "FXDoG&AKF")

## Papers implemented

 * Imaging Vector Fields Using Line Integral Convolution
 * Image and video abstraction by anisotropic Kuwahara filtering
 * XDoG: an extended difference-of-Gaussians compendium including advanced image stylization

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE) file for details

## Acknowledgments

* Some shaders' source code from Kyprianidis, Jan Eric. You can find it in [http://www.kyprianidis.com](http://www.kyprianidis.com)

