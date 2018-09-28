/// <reference path="../lib/HashSet.ts" />
module Utils{

    //dat UI
    declare var dat:any;
    export class FilterViewerUI {
        gui:any;
        data:any;
        folderHashSet:any;
        folderName:any;
        uiController:any;
        constructor(data:any){
            this.gui = new dat.gui.GUI();
            this.data = data;
            this.gui.remember(data);

            this.uiController = new Utils.HashSet<any>();

            this.folderHashSet = new Utils.HashSet<string>();
            this.folderHashSet.set("f","Filter");

            //get all folder name
            this.folderName = [];
            this.folderHashSet.forEach((k,v)=>{
                this.folderName.push(k);
            });

            this.initData();
            this.initFolder();
        }
        initFolder(){

            this.folderName.forEach(fn => {
                let f = this.gui.addFolder(this.folderHashSet.get(fn));
                for(var key in this.data) {
                    //judge this key is in folder or not
                    let f_name = key.split("_");
                    if((<any>key).includes('_') && f_name[0]==fn){
                        let c = f.add(this.data, key);
                        this.uiController.set(key, c);
                    } 
                }
            });
        }
        initData(){

            for(var key in this.data) {
                if(!(<any>key).includes('_')){
                    this.gui.add(this.data, key);
                }
            }
        }
    }
}