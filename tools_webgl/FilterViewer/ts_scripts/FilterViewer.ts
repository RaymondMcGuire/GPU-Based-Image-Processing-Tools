/* =========================================================================
 *
 *  FilterViewer.ts
 *  tool for test filter in WebGL
 *  filter viewer 
 *  
 * ========================================================================= */
/// <reference path="../ts_scripts/package/pkg_FilterViewHub.ts" />
declare var $: any;

let viewer = <any>document.getElementById("canvas_viewer");
viewer.width = 512;
viewer.height = 512;

//load data
$.getJSON( "./config/ui.json", (ui_data) => {
    //console.log( "loaded UI data");
    $.getJSON( "./config/shader.json", (shader_data) => {
        //console.log( "loaded shader data");
        $.getJSON( "./config/button.json", (button_data) => {
            //console.log( "loaded button data");
            $.getJSON( "./config/user_config.json", (user_config) => {
                //console.log( "loaded user config data");
                var filterViewer = new EcognitaWeb3D.FilterViewer(viewer);
                filterViewer.initialize(ui_data,shader_data,button_data,user_config);
            });
        });
    });
});

