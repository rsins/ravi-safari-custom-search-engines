
let searchEngines = {};

// Split text assuming format '<search_engine> <search text>'
function splitInputTextForSearch(text) {
  let result = {
    searchEngine: null,
    queryText: null
  };
  if (text) {
    let parts = text.trim().split(' ');
    result.searchEngine=parts[0].toLowerCase();
    parts.shift();
    result.queryText = parts.join(' ');
  }
  return result;
}

// Build Search Url based on user input
function buildSearchURL(text) {
  if (text.toLowerCase().startsWith("http://") || text.toLowerCase().startsWith("https://")) return `${text}`;
  let input = splitInputTextForSearch(text);
  let searchEngObj = searchEngines[input.searchEngine];
  if (searchEngObj) {
  	let searchUrl = searchEngObj.url;
    let url = searchUrl.replace(SEARCH_TEXT_PLACEHOLDER, input.queryText);
    return `${url}`;
  }
  else {
    // If there is only one search engine which is matching the key then use that for searching
    let searchKeys = [];
    for (var key in searchEngines) {
      if(key.startsWith(input.searchEngine)) {
        searchKeys.push(key);
      }
    }
    if (searchKeys.length == 1) {
      return buildSearchURL(searchKeys[0] + " " + input.queryText);
    }
  }

  return null;
}

// Plugin init function
function pluginLoadData() {
  // Read preferences
  getSearchEnginesFromPreferences();
}

function onGotPreferences(item) {
  if (item[SEARCH_PREFERENCE_KEY]) searchEngines = item[SEARCH_PREFERENCE_KEY];
}

// Read preferences from storage
function getSearchEnginesFromPreferences() {
  var preferences = safari.extension.settings.customSearchSettings;
  if (preferences == null) onGotPreferences(JSON.parse("{}"));
  else onGotPreferences(JSON.parse(preferences));
}

// Mani function which loads the plugin functionality
function main() {
  pluginLoadData();
  
  safari.application.addEventListener('beforeSearch', function(e) {
    let mainInput = splitInputTextForSearch(e.query);
    // Must start with extension key
    if (mainInput.searchEngine != SEARCH_EXTENSION_KEY) return;
    let url = buildSearchURL(mainInput.queryText);
    if (!url) return;
    e.preventDefault();
    e.target.url = url;
  });
  	
  safari.application.addEventListener('message', function(evt) {
    if (evt.name == 'SearchPreferenceStore') {
  	  onGotPreferences(JSON.parse(evt.message));
  	  safari.extension.settings.customSearchSettings = evt.message;
  	  evt.target.page.dispatchMessage(evt.name + 'Success');
  	}
  	else if (evt.name == 'SearchPreferenceLoad' || evt.name == 'SearchPreferenceText') {
  	  evt.target.page.dispatchMessage(evt.name + 'Success', safari.extension.settings.customSearchSettings);
  	}
  });
}


main();

