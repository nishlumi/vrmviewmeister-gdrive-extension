/**
 * Google Drive loader for VRMViewMeister
 * 
 * Publish URL: [script url]/exec
 * 
 * Method: GET
 * 
 * Parameters : ?mode=[mode]&fileid=[id]&extension=[extension]
 * @param {String} mode - (MOST IMPORTANT) Operation mode flag (load, enumdir, confirmlast)
 * @param {String} apikey - {MOST IMPORTANT} api key for execute function
 * 
 * mode=load
 * @param {String} fileid - Drive file id (/file/d/ID/view...) 
 * @param {String} extension - File extension to open
 * 
 * mode=enumdir
 * @param {String} name - file name to search 
 * @param {String} extension - File extension to open
 * @param {Any} withdata - load also content (true, 1, etc...)
 * 
 *   optional:
 *   @param {String} dirid - directory id to search 
 *   @param {String} dirname - directory name to search 
 * 
 * mode=confirmlast
 * @param {String} name - file name to search 
 * @param {String} extension - File extension to open
 * 
 * 
 * @return {JSON}
 * {
 *    @type {Number} cd
 *    @type {String} msg
 *    @type {Object} data below data
 * }
 * mode=load
 * { 
 *   @type {String} name - file name on Google Drive
 *   @type {Number} size - file size
 *   @type {String} mimeType - file mimeType
 *   @type {Any} data - file data (Byte[] or String[])
 * }
 * mode=confirmlast
 * { 
 *   @type {String} name - file name on Google Drive
 *   @type {String} id - file id
 *   @type {Number} size - file size
 *   @type {String} mimeType - file mimeType
 * }
 * mode=enumdir
 * [{
 *    @type {String} name
 *    @type {String} mimeType
 *    @type {String} id
 *    @type {Number} size
 *    @type {Number} createDate
 *    @type {Number} updatedDate
 *    @type {String} dir.id
 *    @type {String} dir.name
 * }]
 * on error 
 * {}
 * 
 */
function doGet(e) {
  var retdata = {cd:0,msg:""};
  var mode = "";
  var fileid = "";
  var name = "";
  var ext = "";
  var dirid = "";
  var dirname = "";
  var afterdate = 0;
  var withdata = false;
  var apikey = "";
  for (var obj in e.parameter) {
    if (obj == "mode") {
      mode = e.parameter[obj];
    }else if (obj == "fileid") {
      fileid = e.parameter[obj];
    }else if (obj == "name") {
      name = e.parameter[obj];
    }else if (obj == "extension") {
      ext = e.parameter[obj];
    }else if (obj == "dirid") {
      dirid = e.parameter[obj];
    }else if (obj == "dirname") {
      dirname = e.parameter[obj];
    }else if (obj == "withdata") {
      withdata = true;
    }else if (obj == "apikey") {
      apikey = e.parameter[obj];
    }
  }
  const prop = PropertiesService.getScriptProperties();
  //---call each function
  if (apikey == prop.getProperty("APIKEY")) {
    if (mode == "load") {
      retdata = loadFileFromId(fileid, ext);
      if (!retdata) {
        retdata = {cd:9, msg:"parameter error"};
      }
      
    }else if (mode == "enumdir") {
      retdata = enumerateFiles({id: dirid, name:dirname}, name, ext, withdata);
    }else if (mode == "confirmlast") {
      retdata = loadLastSavedFile(name, ext);
    }else{
      retdata = {cd:9, msg:"parameter error"};
    }
  }else{
    retdata = {cd:9, msg:"apikey error"};
  }
  
  return ContentService.createTextOutput(JSON.stringify(retdata)).setMimeType(ContentService.MimeType.JSON);
  
}
function setupTest() {
  /**
   * setup the scope of GAS. simply, get first item of your Google Drive.
   */
  Logger.log(DriveApp.getStorageUsed() / 1024 / 1024 / 1024);
  Logger.log(DriveApp.getStorageLimit() / 1024 / 1024 / 1024);
  
}
/**
 * load contents of file (mode=load)
 * @param {String} gid file id
 * @param {String} extension file extension
 */
function loadFileFromId(gid,extension) {
  const TXTLOAD_EXTENSIONS = ["json","vvmproj","vvmmot","vvmpose"];
  var ret = {cd:0,msg:""};
  try {
    var file = DriveApp.getFileById(gid);

    if (file) {
      //---set file meta data
      ret = {
        cd:0,
        msg:"",
        name: file.getName(),
        size : file.getSize(),
        mimeType : file.getMimeType(),
        data : "",
      };

      //---load file content
      if (TXTLOAD_EXTENSIONS.indexOf(extension) > -1) {
        ret.data = JSON.parse(file.getBlob().getDataAsString());
      }else{
        ret.data = file.getBlob().getBytes();
      }
    }else{
      ret.cd = "1";
      ret.msg = "not found";
    }

  }catch(e) {
    ret = null;
  }
  return ret;
}

/**
 * confirm last saved file since datevalue (mode=confirmlast)
 * @param {String} name file name to search
 * @param {String} extension file extension to search
 */
function loadLastSavedFile(name,extension) {

  var ret = {cd:0, msg:"", data:[]};
  var searchString = "(title contains '" +  name + "')";
  //" and (modifiedTime >= '" + (realdate.toUTCString()) + "')";
  var files = DriveApp.searchFiles(searchString);
  while (files.hasNext()) {
    var file = files.next();
    var fitem = {
      name : file.getName(),
      mimeType : file.getMimeType(),
      id : file.getId(),
      size : file.getSize(),
      createDate : file.getDateCreated().valueOf(),
      updatedDate : file.getLastUpdated().valueOf(),
    }
    ret.data.push(fitem);
  }

  //---find most recent file
  var maxm = Math.max(...ret.data.map(obj => obj.createDate));
  var resoret = ret.data.find(obj => obj.createDate === maxm);

  ret.data = resoret;
  return ret;
}
/**
 * enumerate files in folder (mode=enumdir)
 * @param {{id:String, name:String}} dir folder information
 * @param {String} name file name to search
 * @param {String} extension file extension to search
 * @param {Boolean} withdata load also content (ONLY json data)
 */
function enumerateFiles(dir, name, extension, withdata) {
  var ret = {cd:0,msg:"",data:[]};

  var searchString = "";
  var extarr = extension.split(",");
  //---make search condition
  if (name != "") {
    searchString += "title contains '" + name + "'";
  }else{
    
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
    if (dir.id != "") {
      //---By ID
      var hitdir = DriveApp.getFolderById(dir.id);
      files = hitdir.searchFiles(searchString);
    }else if (dir.name != "") {
      //---By Name
      hitdir = DriveApp.getFoldersByName(dir.name);
      var dir = null;
      while (hitdir.hasNext()) {
        dir = hitdir.next();
        break;
      }
      if (dir) {
        files = dir.searchFiles(searchString);
      }else{
        files = DriveApp.searchFiles(searchString);
      }
    }else{
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
        ret.data.push(fitem);
      }
    }
    if (ret.data.length == 0) {
      ret.msg = "not found file";
    }
  }else{
    ret.cd = 1;
    ret.msg = "enumerate error";
  }
  return ret;
}
function toISOStringWithTimezone(date) {
    const pad = function (str) {
        return ('0' + str).slice(-2);
    };
    const year = (date.getFullYear()).toString();
    const month = pad((date.getMonth() + 1).toString());
    const day = pad(date.getDate().toString());
    const hour = pad(date.getHours().toString());
    const min = pad(date.getMinutes().toString());
    const sec = pad(date.getSeconds().toString());
    const tz = -date.getTimezoneOffset();
    const sign = tz >= 0 ? '+' : '-';
    const tzHour = pad((tz / 60).toString());
    const tzMin = pad((tz % 60).toString());

    return `${year}-${month}-${day}T${hour}:${min}:${sec}${sign}${tzHour}:${tzMin}`;
}