// Does not always match to the number of rows in preference table.
// This is to help with id tags of elements.
let preferenceRowCount = 0;

// Internal flag to disable search using multiple search engines
// It is set to false automatically if any of the custom search engine key has CHAR_SEPARATOR_FOR_MULTI_SEARCH as per definition in utils.js
let multiSearchDisabled = null

// To store sort order of table columns
let sortOrderOfPrefColById = {}

function getColorBlockForHtml(color) {
  return "<span style='background-color: " + color + "; display: inline-block; width: 12px; height: 12px; border-radius: 50%;'></span>";
}

function saveOptions(e) {
  e.preventDefault();
  deletePreferenceRow();

  var inputError = {
  	  hasAtLeastOneError: false,
      displayMessage: "Errors:<br>",
  	  hasMissingData: false,
  	  hasDuplicateKey: false,
  	  hasInvalidKey: false,
  	  hasInvalidUrlProtocol: false,
  	  hasInvalidUrlSearchParam: false
  };
  multiSearchDisabled = false;
  var prefJson = {};
  // Prepare data for saving and also do validations.
  for (var count = 1; count <= preferenceRowCount; count++) {
    var c1 = document.querySelector("#F" + count + "1");
    var c2 = document.querySelector("#F" + count + "2");
    var c3 = document.querySelector("#F" + count + "3");
    var c4 = document.querySelector("#F" + count + "4");

	  if (c1 == null || c2 == null || c3 == null || c4 == null) continue;

	  // Clear color highlights
    c1.style["background-color"] = "";
    c2.style["background-color"] = "";
    c3.style["background-color"] = "";
    c4.style["background-color"] = "";

    // Corner case
    if (preferenceRowCount == 1 && c1.value.trim() == "" && c2.value.trim() == "" && c3.value.trim() == "" && c4.value.trim() == "") {
       // Do nothing.
       console.log("One input row but no data to save.");
    }
    // Check invalid search keys
    else if (c1.value.trim().includes(" ")) {
      c1.style["background-color"] = "#42f4b9";
      if (! inputError.hasInvalidKey) {
        inputError.hasAtLeastOneError = true;
        inputError.hasInvalidKey = true;
        inputError.displayMessage += getColorBlockForHtml("#42f4b9") + " Search Key cannot include space.</span><br>";
      }
    }
    // Check duplicate search keys
    else if (prefJson.hasOwnProperty(c1.value.trim())) {
      c1.style["background-color"] = "#dbccff";
      if (! inputError.hasDuplicateKey) {
        inputError.hasAtLeastOneError = true;
        inputError.hasDuplicateKey = true;
        inputError.displayMessage += getColorBlockForHtml("#dbccff") + " Duplicate search key.</span><br>";
      }
    }
    // Check empty fields.
    else if (c1.value.trim() == "" || c2.value.trim() == "" || c3.value.trim() == "") {
      c1.style["background-color"] = "#ffcccc";
      c2.style["background-color"] = "#ffcccc";
      c3.style["background-color"] = "#ffcccc";
      if (! inputError.hasMissingData) {
        inputError.hasAtLeastOneError = true;
        inputError.hasMissingData = true;
        inputError.displayMessage += getColorBlockForHtml("#ffcccc") + " All mandatory details should be provided.<br>";
      }
    }
    // Check url protocol
    else if (! c3.value.trim().startsWith("http://") && ! c3.value.trim().startsWith("https://")) {
      c3.style["background-color"] = "#fbccff";
      if (! inputError.hasInvalidUrlProtocol) {
        inputError.hasAtLeastOneError = true;
        inputError.hasInvalidUrlProtocol = true;
        inputError.displayMessage += getColorBlockForHtml("#fbccff") + " URL should start with 'http://' or 'https://'.</span><br>";
      }
    }
    // Check url search parameter, handle split word searches as well.
    else if (
    	    (! c3.value.trim().includes(SEARCH_TEXT_PLACEHOLDER  ) &&
    		 ! c3.value.trim().includes(SEARCH_TEXT_PLACEHOLDER_0) &&
    		 ! c3.value.trim().includes(SEARCH_TEXT_PLACEHOLDER_1) &&
    		 ! c3.value.trim().includes(SEARCH_TEXT_PLACEHOLDER_2) &&
    		 ! c3.value.trim().includes(SEARCH_TEXT_PLACEHOLDER_3) &&
    		 ! c3.value.trim().includes(SEARCH_TEXT_PLACEHOLDER_4) &&
    		 ! c3.value.trim().includes(SEARCH_TEXT_PLACEHOLDER_5) &&
    		 ! c3.value.trim().includes(SEARCH_TEXT_PLACEHOLDER_6) &&
    		 ! c3.value.trim().includes(SEARCH_TEXT_PLACEHOLDER_7) &&
    		 ! c3.value.trim().includes(SEARCH_TEXT_PLACEHOLDER_8) &&
    		 ! c3.value.trim().includes(SEARCH_TEXT_PLACEHOLDER_9) )
    	||
    	    (  c3.value.trim().includes(SEARCH_TEXT_PLACEHOLDER  ) &&
    		  (c3.value.trim().includes(SEARCH_TEXT_PLACEHOLDER_0) ||
    		   c3.value.trim().includes(SEARCH_TEXT_PLACEHOLDER_1) ||
    		   c3.value.trim().includes(SEARCH_TEXT_PLACEHOLDER_2) ||
    		   c3.value.trim().includes(SEARCH_TEXT_PLACEHOLDER_3) ||
    		   c3.value.trim().includes(SEARCH_TEXT_PLACEHOLDER_4) ||
    		   c3.value.trim().includes(SEARCH_TEXT_PLACEHOLDER_5) ||
    		   c3.value.trim().includes(SEARCH_TEXT_PLACEHOLDER_6) ||
    		   c3.value.trim().includes(SEARCH_TEXT_PLACEHOLDER_7) ||
    		   c3.value.trim().includes(SEARCH_TEXT_PLACEHOLDER_8) ||
    		   c3.value.trim().includes(SEARCH_TEXT_PLACEHOLDER_9) ))
    ) {
      c3.style["background-color"] = "#ccd2ff";
      if (! inputError.hasInvalidUrlSearchParam) {
        inputError.hasAtLeastOneError = true;
        inputError.hasInvalidUrlSearchParam = true;
        inputError.displayMessage += getColorBlockForHtml("#ccd2ff") + " URL must contain either {searchTerms} or {searchTerms[x]} where x can range from 0 to 9.</span><br>";
      }
    }
    else {
      var key = c1.value.trim();
      var name = c2.value.trim();
      var url = c3.value.trim();
      var desc = c4.value.trim();
      prefJson[key] = {
      	  "name": name,
      	  "url": url,
      	  "description": desc
      };
      if (key.includes(CHAR_SEPARATOR_FOR_MULTI_SEARCH)) multiSearchDisabled = true;
    }
  }
  if (inputError.hasAtLeastOneError) {
    displayMessage(inputError.displayMessage, true);
    return;
  }

  var prefStorageObj = {};
  prefStorageObj[SEARCH_PREFERENCE_KEY] = prefJson;
  safari.self.tab.dispatchMessage('SearchPreferenceStore', JSON.stringify(prefStorageObj));
}

function deletePreferenceRow() {
  for (var count = 1; count <= preferenceRowCount; count++) {
    var chkBox = document.querySelector("#F" + count + "0");
    if (chkBox && chkBox.checked) {
      var rowElement = chkBox.parentElement.parentElement;
      rowElement.parentElement.removeChild(rowElement);
    }
  }

  resetFields();
  displayMessage("Row(s) deleted. Click on 'Save Preferences' to save.");

  // Check if there are any preference row existing or not.
  var hasRow = false;
  for (var count = 1; count <= preferenceRowCount && hasRow == false; count++) {
    var chkBox = document.querySelector("#F" + count + "0");
    if (chkBox) hasRow = true;
  }
  if (! hasRow) parseAndShowCurrentData({});
}

function addPreferenceRow() {
  resetFields();
  var tabRef = document.querySelector("#preftbody");
  var newRow = tabRef.insertRow(tabRef.rows.length);
  preferenceRowCount += 1;
  newRow.innerHTML = "<td><input id='F" + preferenceRowCount + "0' type='checkbox'/></td><td><input type='text' id='F" + preferenceRowCount + "1'/></td><td><input type='text' id='F" + preferenceRowCount + "2'/></td><td><input type='text' id='F" + preferenceRowCount + "3'/></td><td><input type='text' id='F" + preferenceRowCount + "4'/></td>";
}

function parseAndShowCurrentData(result) {
  let rowNum = 0;
  let htmlTable = "<table id='preftable'><tbody id='preftbody'><tr><th style='width:80px; min-width:80px'><input id='F00' type='checkbox'/> Delete</th><th id='F01' class='clickable' style='width:100px; min-width:100px;'>Key<span style='color:red'>*</span></th><th id='F02' class='clickable' style='width:200px; min-width:200px'>Search Engine Name<span style='color:red'>*</span></th><th id='F03' class='clickable' style='min-width:300px'>Url<span style='color:red'>*</span></th><th id='F04' class='clickable' style='width:200px; min-width:200px'>Description</th></tr>";
  if (result.hasOwnProperty(SEARCH_PREFERENCE_KEY)) {
    let preferences = result[SEARCH_PREFERENCE_KEY];
    for (var key in preferences) {
      let curSearchObj = preferences[key];
      rowNum += 1;
      htmlTable += "<tr><td><input id='F" + rowNum + "0' type='checkbox'/></td><td><input type='text' id='F" + rowNum + "1' value='" + key + "'/></td><td><input type='text' id='F" + rowNum + "2' value='" + curSearchObj.name + "'/></td><td><input type='text' id='F" + rowNum + "3' value='" + curSearchObj.url + "'/></td><td><input type='text' id='F" + rowNum + "4' value='" + curSearchObj.description + "'/></td></tr>";
    }
  }
  if (rowNum == 0) {
      rowNum += 1;
      htmlTable += "<tr><td><input id='F" + rowNum + "0' type='checkbox'/></td><td><input type='text' id='F" + rowNum + "1' value=''/></td><td><input type='text' id='F" + rowNum + "2' value=''/></td><td><input type='text' id='F" + rowNum + "3' value=''/></td><td><input type='text' id='F" + rowNum + "4' value=''/></td></tr>";
  }
  htmlTable += "</tbody></table>";
  document.querySelector("#preferences").innerHTML = htmlTable;

  preferenceRowCount = rowNum;
  document.querySelector("#F00").addEventListener("click", selectAllDeletePreferenceRow);

  // Comparator for preference table
  function getClickSortFunction(objId, propName) {
    return function() {
      var ascOrder = (objId in sortOrderOfPrefColById) ? sortOrderOfPrefColById[objId] : true;
      sortPrefsOnProperty(propName, ascOrder);
      sortOrderOfPrefColById[objId] = !ascOrder;
    };
  }
  document.querySelector("#F01").addEventListener("click", getClickSortFunction("#F01", "key"));
  document.querySelector("#F02").addEventListener("click", getClickSortFunction("#F02", "name"));
  document.querySelector("#F03").addEventListener("click", getClickSortFunction("#F03", "url"));
  document.querySelector("#F04").addEventListener("click", getClickSortFunction("#F04", "description"));
}

function restoreOptions() {
  safari.self.tab.dispatchMessage('SearchPreferenceLoad');

  // Reset sort order details
  sortOrderOfPrefColById = {};
}

function selectAllDeletePreferenceRow() {
  var chkBoxMain = document.querySelector("#F00");
  for (var count = 1; count <= preferenceRowCount; count++) {
    var chkBox = document.querySelector("#F" + count + "0");
    if (chkBox) chkBox.checked = chkBoxMain.checked;
  }
}

function resetPreferences() {
  resetFields();
  restoreOptions();
  displayMessage("Preferences Reset!");
}

function displayMessage(text, isError = false) {
  var msgField = document.querySelector("#message");
  msgField.style.color = (isError ? "red" : "green");
  if (! text || text.length == 0) {
    msgField.innerHTML = "<br>";
    hideModalMsg();
  }
  else {
    msgField.innerHTML = text;
    if (isError) showModalMsg(text, isError);
  }
}

function loadPreferencesFromFile() {
  var inputPrefFile = document.querySelector("#inputPrefFileButton");
  var curFile = inputPrefFile.files[0];
  resetFields();
  if (curFile) {
    var reader = new FileReader();
    reader.onload = function() {
      try {
        var prefText = reader.result;
        var filePrefObj = JSON.parse(prefText);
        loadPreferencesFromDataObj(filePrefObj);
        displayMessage("Preferences Loaded from File. Please review & click on 'Save Preferences' to save it.");
      }
      catch (err) {
        console.log(err.message);
        displayMessage(`Error while loading data - ${err.message}`, true);
        return;
      }
    };
    reader.readAsText(curFile);
  }
  else {
  	displayMessage("Please select a file to load preference data.", true);
  }
}

function loadPreferencesFromDataObj(filePrefObj) {
  if (! filePrefObj.hasOwnProperty(PREFERENCE_FILE_VERSION_TAG) || ! filePrefObj.hasOwnProperty(PREFERENCE_FILE_PREF_TAG)) {
    displayMessage("Invalid input file format.");
    return;
  }
  var fileVersion = parseFloat(filePrefObj[PREFERENCE_FILE_VERSION_TAG]);
  var minFileVersionSupported = parseFloat(PREFERENCE_FILE_VERSION_MIN);
  if (fileVersion < minFileVersionSupported) {
    displayMessage("Invalid file version - " + fileVersion + ", this format is not supported currently.");
    return;
  }
  var mergedPref = mergeOnScreenPrefAndFileData(filePrefObj[PREFERENCE_FILE_PREF_TAG]);
  parseAndShowCurrentData(mergedPref);
}

function mergeOnScreenPrefAndFileData(filePrefs) {
  if (! filePrefs.hasOwnProperty(SEARCH_PREFERENCE_KEY)) throw new Error("Invalid File Format.");
  var prefs = filePrefs[SEARCH_PREFERENCE_KEY];

  // Prepare data for merging.
  for (var count = 1; count <= preferenceRowCount; count++) {
    var c1 = document.querySelector("#F" + count + "1");
    var c2 = document.querySelector("#F" + count + "2");
    var c3 = document.querySelector("#F" + count + "3");
    var c4 = document.querySelector("#F" + count + "4");

	if (c1 == null || c2 == null || c3 == null || c4 == null) continue;

	// Clear color highlights
    c1.style["background-color"] = "";
    c2.style["background-color"] = "";
    c3.style["background-color"] = "";
    c4.style["background-color"] = "";

    var key = c1.value.trim();
    var name = c2.value.trim();
    var url = c3.value.trim();
    var desc = c4.value.trim();

	// If UI Pref Key is present in file data then ignore UI data
    if (key == "" || prefs.hasOwnProperty(key)) continue;

    prefs[key] = {
      "name": name,
      "url": url,
      "description": desc
    };
  };

  return filePrefs;
}

function loadTextData(result) {
  var outputArea = document.querySelector("#outputPrefFile");
  if (result && result != "{}") {
    var filePref = {};
    filePref[PREFERENCE_FILE_VERSION_TAG] = PREFERENCE_FILE_VERSION_CUR;
    filePref[PREFERENCE_FILE_PREF_TAG] = result;
    outputArea.value = JSON.stringify(filePref, null, 2);
  }
  else {
    outputArea.value = "** No Preferences Stored **";
  }
}

function showPreferencesPlainText() {
  var hasToHideField = false;
  if (document.querySelector("#outputPrefFileBlock").style["display"] == "block") {
    hasToHideField = true;
  }
  resetFields();
  if (! hasToHideField) {
    document.querySelector("#showPrefDataButton").innerText = "Hide Pref Data";
    document.querySelector("#outputPrefFileBlock").style["display"] = "block";
    safari.self.tab.dispatchMessage('SearchPreferenceText');
  }

}

function resetFields() {
  displayMessage("");
  document.querySelector("#showPrefDataButton").innerText = "Show Pref Data";
  document.querySelector("#outputPrefFileBlock").style["display"] = "none";
  document.querySelector("#inputPrefFileButton").value = "";
  var chkBoxMain = document.querySelector("#F00");
  if (chkBoxMain) {
    chkBoxMain.checked = false;
    selectAllDeletePreferenceRow();
  }
}

// Load from remote url a default preference data.
function loadPopularSearchEngines() {
  resetFields();
  getPopularSearchEngineData()
  .then(function(prefText) {
    try {
      var filePrefObj = JSON.parse(prefText);
      loadPreferencesFromDataObj(filePrefObj);
      displayMessage("Popular Search Engines loaded. Please review & click on 'Save Preferences' to save it.");
    }
    catch (err) {
      console.log(`Error: ${err}`);
      console.log(err.stack);
      displayMessage(`Error while loading data - ${err.message}`, true);
      return;
    }
  });
}

// Required to do sorting on table columns
function buildPrefObjectArrayWithoutValidation() {
  deletePreferenceRow();

  var prefObjArr = [];
  // Prepare data for saving and also do validations.
  for (var count = 1; count <= preferenceRowCount; count++) {
    var c1 = document.querySelector("#F" + count + "1");
    var c2 = document.querySelector("#F" + count + "2");
    var c3 = document.querySelector("#F" + count + "3");
    var c4 = document.querySelector("#F" + count + "4");

	  if (c1 == null || c2 == null || c3 == null || c4 == null) continue;

    var key = c1.value.trim();
    var name = c2.value.trim();
    var url = c3.value.trim();
    var desc = c4.value.trim();
    if (key == "" && name == "" && url == "" && desc == "") continue;

    prefObjArr.push({
        "key": key,
    	  "name": name,
    	  "url": url,
    	  "description": desc
    });
  }

  return prefObjArr;
}

// To sort prefernce table on the given property name
function sortPrefsOnProperty(propName, ascOrder) {
  function ascSortObjectsOnProperty(name) {
    return function(a, b) {
      if (a[name] > b[name]) return 1;
      if (a[name] < b[name]) return -1;
      return 0;
    }
  }
  function descSortObjectsOnProperty(name) {
    return function(a, b) {
      if (b[name] > a[name]) return 1;
      if (b[name] < a[name]) return -1;
      return 0;
    }
  }

  var prefObjArr = buildPrefObjectArrayWithoutValidation();
  prefObjArr = prefObjArr.sort(ascOrder ? ascSortObjectsOnProperty(propName) : descSortObjectsOnProperty(propName));

  var prefJson = {};
  var prevKeys = [];
  for (var idx in prefObjArr) {
    var prefObj = prefObjArr[idx];
    prefJson[prefObj["key"]] = {
      "name": prefObj["name"],
      "url": prefObj["url"],
      "description": prefObj["description"]
    };

    if (prevKeys.includes(prefObj["key"])) {
      displayMessage("Duplicate search engine key : " + prefObj["key"], true);
      return;
    }
    prevKeys.push(prefObj["key"]);
  }
  var prefStorageObj = {};
  prefStorageObj[SEARCH_PREFERENCE_KEY] = prefJson
  resetFields();
  parseAndShowCurrentData(prefStorageObj);
  displayMessage("Preference sorted on '" + propName + "' in " + (ascOrder ? "ascending" : "descending") + " order.");
}

safari.self.addEventListener('message', function(evt) {
	if (evt.name == 'SearchPreferenceLoadSuccess') {
    	getting = evt.message;
    	if (getting == null) parseAndShowCurrentData(JSON.parse("{}"));
    	else parseAndShowCurrentData(JSON.parse(getting));
	}
	else if (evt.name == 'SearchPreferenceStoreSuccess') {
  		restoreOptions();
      displayMessage("Preferences Saved!" + (multiSearchDisabled ? "<br><span style='color: brown'>Note: At least one key contains '" + CHAR_SEPARATOR_FOR_MULTI_SEARCH + "' so multi-search will be disabled.</span>" : ""));
	}
	else if (evt.name == 'SearchPreferenceTextSuccess') {
		loadTextData(JSON.parse(evt.message));
	}
});

resetFields();
document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("#delete").addEventListener("click", deletePreferenceRow);
document.querySelector("#add").addEventListener("click", addPreferenceRow);
document.querySelector("#reset").addEventListener("click", resetPreferences);
document.querySelector("#loadInputPrefFileButton").addEventListener("click", loadPreferencesFromFile);
document.querySelector("#inputPrefFileButton").addEventListener("click", resetFields);
document.querySelector("#showPrefDataButton").addEventListener("click", showPreferencesPlainText);
document.querySelector("#loadPopular").addEventListener("click", loadPopularSearchEngines);
document.querySelector("form").addEventListener("submit", saveOptions);
