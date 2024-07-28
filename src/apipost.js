
/**
 * Google Drive writer for VRMViewMeister
 * 
 * Publish URL: [script url]/exec
 * 
 * Method: POST
 * 
 * Parameters : ?mode=[mode]&nameoverwrite=[1]
 * @param {String} mode (MOST IMPORTANT) Operation mode flag (save,saveas)
 * @param {Any} nameoverwrite wheather to overwrite by file name (normally file ID)
 * @param {String} apikey - {MOST IMPORTANT} api key for execute function
 * 
 * Postdata :
 * @param {String} name file name and extension
 * @param {String} id file id to save 
 * @param {String} destination save directory id
 * @param {Boolean} isbinary file is binary ?
 * @param {Any} data file contents
 * 
 * @return {JSON}
 * { 
 *   @type {String} name - file name on Google Drive
 *   @type {String} id - file id
 *   @type {Number} size - file size
 *   @type {String} mimeType - file mimeType
 * }
 * on error 
 * {}
 * 
 */
function doPost(e) {
  var mode = "";
  var nameoverwrite = false;
  var apikey = "";
  var isbinary = false;
  for (var obj in e.parameter) {
    if (obj == "mode") {
      mode = e.parameter[obj].toLowerCase();
    }else if (obj == "nameoverwrite") {
      nameoverwrite = true;
    }else if (obj == "apikey") {
      apikey = e.parameter[obj];
    }else if (obj == "isbinary") {
      isbinary = e.parameter[obj];
    }
  }
  var retdata = {cd:0, msg:""}

  const prop = PropertiesService.getScriptProperties();

  if (apikey == prop.getProperty("APIKEY")) {
    var JsonDATA = JSON.parse(e.postData.getDataAsString());
    Logger.log(e);
    Logger.log(e.postData.type);
    Logger.log(mode);
    Logger.log(JsonDATA);

    if (JsonDATA) {
      /**
       * JSON properties
       * {String} name file name and extension
       * {String} id file id to save 
       * {String} destination save directory id
       * {Any} data file contents
       */
      var js = JsonDATA; //JSON.parse(e.postData.contents);
      if ((mode == "save") || (mode == "saveas")) {
        var test_param_name = ("name" in js);
        var test_param_id = ("id" in js);
        var test_param_data = ("data" in js);
        var test_param_dest = ("destination" in js);
        if (test_param_name === true) {
          if (test_param_data === true) {
            retdata = saveAppData(mode, js.name, (test_param_id ? js.id : ""), js.data, 
              test_param_dest ? js.destination : "", nameoverwrite, {isbinary: isbinary});
          }else{
            retdata.cd = 1;
            retdata.msg = "no contents to save";
          }
        }else{
          retdata.cd = 1;
          retdata.msg = "no filename to save";
        }
      }else{
        retdata.cd = 9;
        retdata.msg = "mode error";
      }
      
      
    }else{
      retdata.cd = 9;
      retdata.msg = "mimetype error";
    }
    Logger.log(retdata);
    /*var template = HtmlService.createTemplateFromFile("retpost");
    template.retdata = JSON.stringify(retdata);
    return template.evaluate().setSandboxMode(HtmlService.SandboxMode.IFRAME);
    */
  }else{
    retdata.cd = 9;
    retdata.msg = "apikey error";
  }
  
  return ContentService.createTextOutput(JSON.stringify(retdata)).setMimeType(ContentService.MimeType.JSON);

}
/**
 * To save application format data of VRMViewMeister (vvmpose, vvmmot, vvmproj) (mode=save, saveas)
 * @param {String} mode operation mode
 * @param {String} name filename
 * @param {String} id file id
 * @param {Any} file data
 * @param {String} destination dir id to save
 * @param {Boolean} nameoverwrite wheather to overwrite by file name (normally file ID)
 * @param {{isbinary: Boolean}} file options
 */
function saveAppData(mode, name, id, data, destinationDirId, nameoverwrite, fileoption) {
  var getFirstParent = (file) => {
    var pardirs = file.getParents();
    var pardir = null;
    while (pardirs.hasNext()) {
      pardir = pardirs.next();
    }
    return pardir;
  }
  /**
   * @param {String} name file name
   * @param {String} data file data
   * @param {String} destinationDirId destination folder id to save
   * @param {File} ishit existing file object
   * @param {{isbinary:Boolean}} file options
   */
  var newsaveBody = (name, data, destinationDirId, ishit, fileoption) => {
    var ret = {cd:0, msg:"", name:"", id:"", size:0, mimeType:"", createDate:"", updatedDate:"",
      dir : {id: "", name:""},
      data:""
    };
    var file = null;
    
    if (ishit) {
      //---if the file already exists, overwrite.
      file = ishit;
      file.setContent(JSON.stringify(data));
    }else{
      //---New save
      var judgename = name;
      judgename = judgename.toLocaleLowerCase();
      //if ((judgename.endsWith(".png")) || (judgename.endsWith(".jpg"))) {
      if (fileoption.isbinary) {
        var bb = null;
        if (data instanceof Array) {
          var b8 = new Uint8Array(data);
          bb = Utilities.newBlob(b8);
        }else if (data instanceof Uint8Array) {
          bb = Utilities.newBlob(data);
        }else{
          var oarr = [];
          for (var o in data) {
            oarr.push(data[o]);
          }
          var b8 = new Uint8Array(data)
          bb = Utilities.newBlob(b8);
        }
        
        bb.setName(name);
        file = DriveApp.createFile(bb);
      }else{
        file = DriveApp.createFile(name, JSON.stringify(data));
      }
      
      
    }
    
    if (destinationDirId != "") {
      var dir = DriveApp.getFolderById(destinationDirId);
      if (dir) {
        file.moveTo(dir);
      }
    }

    
    var pardir = getFirstParent(file);
    
    ret.name = file.getName();
    ret.id = file.getId();
    ret.mimeType = file.getMimeType();
    ret.size = file.getSize();
    ret.createDate = file.getDateCreated().valueOf();
    ret.updatedDate = file.getLastUpdated().valueOf();
    ret.dir = {
      id : pardir == null ? "" : pardir.getId(),
      name : pardir == null ? "" : pardir.getName()
    }
    return ret;
  }
  var names = name.split(".");
  const iFiler = new IndexFiler(names[names.length-1], names[names.length-1]);

  var ret = {cd:0, msg:"", name:"", id:"", size:0, mimeType:""};
  var ishit = null;
  if (nameoverwrite === true) {
    var files = DriveApp.getFilesByName(name);
    while (files.hasNext()) {
      var file = files.next();
      ishit = file;
      //---get first file.
      break;
    }
  }else{
    if (id != "") {
      ishit = DriveApp.getFileById(id);
      
    }
  }
  
  if (ishit) {
    //---Overwrite
    if (mode == "save") {
      if (fileoption.isbinary) {
        ishit.setTrashed(true);
        newsaveBody(name, data, destinationDirId, null, fileoption);
      }else{
        var pardir = getFirstParent(ishit);

        ishit.setContent(JSON.stringify(data));
        ret.name = ishit.getName();
        ret.id = ishit.getId();
        ret.mimeType = ishit.getMimeType();
        ret.size = ishit.getSize();
        ret.createDate = ishit.getDateCreated().valueOf();
        ret.updatedDate = ishit.getLastUpdated().valueOf();
        ret.dir = {
          id : pardir == null ? "" : pardir.getId(),
          name : pardir == null ? "" : pardir.getName()
        }
      }
    }else if (mode == "saveas") {
      ret = newsaveBody(name, data, destinationDirId, ishit, fileoption);
    }
  }else{
    //---New save
    ret = newsaveBody(name, data, destinationDirId, null, fileoption);
  }

  //---refresh IndexFiler
  if (name.toLowerCase().indexOf("vvmpose") > -1) {
    //---only necessary items
    ret.data = JSON.stringify({
      thumbnail:data.thumbnail,
      frameData: {
        bodyHeight: data.frameData.bodyHeight
      },
      sampleavatar:data.sampleavatar
    });
  }else if (name.toLowerCase().indexOf("vvmmot") > -1) {
    //---only necessary items
    ret.data = JSON.stringify({
      targetType:data.targetType,
      version : data.version,
      bodyHeight: data.bodyHeight,
      frames : data.frames.map((v,i) => { 
        return {index: v.index}
      }),
    });
  }
  
  if (iFiler.open()) {
    var ifinx = iFiler.searchById(ret.id);
    if (ifinx > -1) {
      //---update
      iFiler.modify(ifinx, ret);
    }else{
      //---new
      iFiler.append(ret);
    }
  }else{
    iFiler.create();
    iFiler.append(ret);
  }
  iFiler.save();
  return ret;
}
