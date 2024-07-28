class IndexFiler {
    constructor(filekind, extensions) {
      this.basename = "";
      this.extensions = extensions.split(",");
  
      this.CNS_TYPE = ["VVMPROJ","VVMMOT","VVMPOSE","VRM","VRMANIMATION","3DMODEL","IMAGE"];
  
      //---filekind: vvmpose, vvmmot, vvmproj, vrm, otherobject, image, etc...
      this.filetype = filekind.toUpperCase();
      Logger.log(this.filetype);
      if (this.CNS_TYPE.indexOf(this.filetype) == -1) {
        this.filetype = null;
      }else{
        this.indexFilename = "VVM_" + this.filetype + "_INDEX.csv";
      }
      //0 - name, 1 - mimeType, 2 - id, 3 - size, 4 - createDate, 5 - updatedDate
      //6 - dirid, 7 - dirname, 8 - data (specify object only)
      this.data = [];
      /**
       * @type {File}
       */
      this.driveInfo = null;
    }
    create() {
      this.driveInfo = DriveApp.createFile(this.indexFilename,"");
      this.driveInfo.setDescription("use by VRMViewMeister");
    }
    open() {
      var ret = false;
      var searchString = "title contains '" + this.indexFilename + "'";
      var files = DriveApp.searchFiles(searchString);
      while (files.hasNext()) {
        var file = files.next();
        this.data = Utilities.parseCsv(file.getBlob().getDataAsString(),"\t");
        this.driveInfo = file;
        ret = true;
        break;
      }
      return ret;
    }
    decodeToJSON(index) {
      var ret = {
        name : this.data[index][0],
        mimeType : this.data[index][1],
        id : this.data[index][2],
        size : parseFloat(this.data[index][3]),
        createDate : parseFloat(this.data[index][4]),
        updatedDate : parseFloat(this.data[index][5]),
        dir : {
          id : this.data[index][6],
          name : this.data[index][7]
        },
        data : this.data[index][8] != "" ? JSON.parse(this.data[index][8]) : {}
      };
      return ret;
    }
    search(fname) {
      var hit = this.data.findIndex((v,i,arr) => {
        if (v[0].indexOf(fname) > -1) return true;
        return false;
      });
      return hit;
    }
    searchById(id) {
      var hit = this.data.findIndex((v,i,arr) => {
        if (v[2].indexOf(id) > -1) return true;
        return false;
      });
      return hit;
    }
    append(fileinfo) {
      var line = [
        fileinfo.name, fileinfo.mimeType, fileinfo.id, fileinfo.size, 
        fileinfo.createDate, fileinfo.updatedDate, fileinfo.dir.id, fileinfo.dir.name,
        fileinfo.data
      ];
      this.data.push(line);
      return this.data.length-1;
    }
    modify(index, fileinfo) {
      var line = [
        fileinfo.name, fileinfo.mimeType, fileinfo.id, fileinfo.size, 
        fileinfo.createDate, fileinfo.updatedDate, fileinfo.dir.id, fileinfo.dir.name,
        fileinfo.data
      ];
      var ishit = this.search(fileinfo.name);
      if (ishit > -1) {
        this.data[ishit] = line;
      }
    }
    remove(index) {
      this.data.splice(index, 1);
    }
    save() {
      var contents = [];
      for (var i = 0; i < this.data.length; i++) {
        var ln = this.data[i].join("\t");
        contents.push(ln);
      }
      this.driveInfo.setContent(contents.join("\n"));
    }
  }
  
  function regenerateVRM() {
    regenerateBody("vrm","vrm");
  }
  function regenerate3Dmodel() {
    regenerateBody("3dmodel","obj,fbx,zip,gltf,glb,ply,stl,3mf");
  }
  function regenerateVVMPOSE() {
    regenerateBody("vvmpose","vvmpose",true);
  }
  function regenerateVVMMOT() {
    regenerateBody("vvmmot","vvmmot",true);
  }
  function regenerateVVMPROJ() {
    regenerateBody("vvmproj","vvmproj");
  }
  function regenerateBody(enumtype, extension, withdata = false) {
    var ret = {cd:0,msg:"",data:[]};
  
    var searchString = "";
    var extarr = extension.split(",");
    var tmp_enumtype = enumtype;
    if (enumtype == "") {
      //---if not found enumtype. (old version)
      if (
        (extension.toUpperCase().indexOf("FBX") > -1) || 
        (extension.toUpperCase().indexOf("OBJ") > -1) ||
        (extension.toUpperCase().indexOf("GLTF") > -1) || 
        (extension.toUpperCase().indexOf("ZIP") > -1) ||
        (extension.toUpperCase().indexOf("GLB") > -1) ||
        (extension.toUpperCase().indexOf("PLY") > -1) ||
        (extension.toUpperCase().indexOf("STL") > -1) ||
        (extension.toUpperCase().indexOf("3MF") > -1)
      ){
        tmp_enumtype = "3dmodel";
      }else if (
        (extension.toUpperCase().indexOf("PNG") > -1) ||
        (extension.toUpperCase().indexOf("JPG") > -1)
      ){
        tmp_enumtype = "image";
      }else if (extension.toUpperCase().indexOf("VVMPOSE") > -1) {
        tmp_enumtype = "vvmpose";
      }else if (extension.toUpperCase().indexOf("VVMMOT") > -1) {
        tmp_enumtype = "vvmmot";
      }else if (extension.toUpperCase().indexOf("VVMPROJ") > -1) {
        tmp_enumtype = "vvmproj";
      }else if (extension.toUpperCase().indexOf("VRMA") > -1) {
        tmp_enumtype = "vrmanimation";
      }else if (extension.toUpperCase().indexOf("VRM") > -1) {
        tmp_enumtype = "vrm";
      }
    }
    const iFiler = new IndexFiler(tmp_enumtype, extension);
    if (iFiler.open()) {
      iFiler.data.splice(0, iFiler.data.length);
    }else{
      iFiler.create();
    }
  
    //---make search condition
    {
      
      var searr = [];
      for (var i = 0; i < extarr.length; i++) {
        searr.push("(title contains '." + extarr[i] + "')");
      }
      searchString = searr.join(" or ");
      
    }
  
    var files = null;
    //---read specified folder or root folder
    try {
      var hitdir = null;
      {
        files = DriveApp.searchFiles(searchString);
      } 
    }catch(e) {
      //---From Root folder 
      files = DriveApp.searchFiles(searchString);
    }
  
    if (files) {
      //---Enumerate searching files.
      while (files.hasNext()) {
        var file = files.next();
        var filename = file.getName();
  
        var ishit = true;
        if (extarr.length > 0) {
          ishit = extarr.findIndex(v => {
            if (filename.endsWith(v)) return true;
            return false;
          }) > -1;
        }
        if (ishit) {
          //---search parent dir
          var pardirs = file.getParents();
          var pardir = null;
          while (pardirs.hasNext()) {
            pardir = pardirs.next();
          }
  
          //---set file meta data
          var fitem = {
            name : filename,
            mimeType : file.getMimeType(),
            id : file.getId(),
            size : file.getSize(),
            createDate : file.getDateCreated().valueOf(),
            updatedDate : file.getLastUpdated().valueOf(),
            dir : {
              id : pardir == null ? "" : pardir.getId(),
              name : pardir == null ? "" : pardir.getName()
            },
            data : ""
          }
          
          if (withdata === true) {
            //---if withdata flag enabled, load file content.
            fitem.data = JSON.parse(file.getBlob().getDataAsString());
          }
          //---for IndexFiler
          var newinx = iFiler.append(fitem);
          if (extension.toLowerCase() == "vvmpose") {
            //---only necessary items
            iFiler.data[newinx][8] = JSON.stringify({
              thumbnail:fitem.data.thumbnail,
              frameData: {
                bodyHeight: fitem.data.frameData.bodyHeight
              },
              sampleavatar:fitem.data.sampleavatar
            });
          }else if (extension.toLowerCase() == "vvmmot") {
            //---only necessary items
            var tmpjs = fitem.data;
            if (typeof tmpjs == "string") tmpjs = JSON.parse(fitem.data);
            iFiler.data[newinx][8] = JSON.stringify({
              targetType:tmpjs.targetType,
              version : tmpjs.version,
              bodyHeight: tmpjs.bodyHeight,
              frames : tmpjs.frames.map((v,i) => { 
                return {index: v.index}
              }),
            });
          }
          
          //ret.data.push(fitem);
        }
      }
      //if (ret.data.length == 0) {
      //  ret.msg = "not found file";
      //}
  
      //---save IndexFiler
      iFiler.save();
    }else{
      ret.cd = 1;
      ret.msg = "enumerate error";
    }
    
  }