
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
  for (var obj in e.parameter) {
    if (obj == "mode") {
      mode = e.parameter[obj].toLowerCase();
    }else if (obj == "nameoverwrite") {
      nameoverwrite = true;
    }else if (obj == "apikey") {
      apikey = e.parameter[obj];
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
              test_param_dest ? js.destination : "", nameoverwrite);
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
 */
function saveAppData(mode, name, id, data, destinationDirId, nameoverwrite) {
  var newsaveBody = (name, data, destinationDirId) => {
    var ret = {cd:0, msg:"", name:"", id:"", size:0, mimeType:""};
    //---New save
    var file = DriveApp.createFile(name, JSON.stringify(data));
    if (destinationDirId != "") {
      var dir = DriveApp.getFolderById(destinationDirId);
      if (dir) {
        file.moveTo(dir);
      }
    }
    
    ret.name = file.getName();
    ret.id = file.getId();
    ret.mimeType = file.getMimeType();
    ret.size = file.getSize();
    return ret;
  }
  var ret = {cd:0, msg:"", name:"", id:"", size:0, mimeType:""};
  var ishit = false;
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
      ishit.setContent(JSON.stringify(data));
      ret.name = ishit.getName();
      ret.id = ishit.getId();
      ret.mimeType = ishit.getMimeType();
      ret.size = ishit.getSize();
    }else if (mode == "saveas") {
      ret = newsaveBody(name, data, destinationDirId);
    }
  }else{
    //---New save
    ret = newsaveBody(name, data, destinationDirId);
  }
  return ret;
}