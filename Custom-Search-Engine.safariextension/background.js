
// Search engines defined by user, saved in plugin storage
let searchEngines = {};

// Internal flag to disable search using multiple search engines
// It is set to false automatically if any of the custom search engine key has CHAR_SEPARATOR_FOR_MULTI_SEARCH as per definition in utils.js
let multiSearchDisabled = null

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

// If user search key is category then return matching list of search categories.
function getMatchingSearchCategoriesForInputCategory(searchCategory) {
  if (! searchCategory.startsWith(CHAR_GROUP_NAME_START_IDENTIFIER)) return;
  let categories = new Set();

  if (searchCategory == CHAR_GROUP_NAME_START_IDENTIFIER) {
    // Pick all the search engines.
    for (var key in searchEngines) {
      let cat = resolveValue(searchEngines[key], "category");
      categories.add(cat);
    }
  }
  else if (searchCategory == (CHAR_GROUP_NAME_START_IDENTIFIER + CHAR_GROUP_NAME_START_IDENTIFIER)) {
    // Pick the search engines with blank/empty category
    for (var key in searchEngines) {
      let cat = resolveValue(searchEngines[key], "category");
      if (cat == "") {
        // Need to check if there is at least one empty search category.
        categories.add(cat);
        break;
      }
    }
  }
  else if (searchCategory.startsWith(CHAR_GROUP_NAME_START_IDENTIFIER)) {
    var newSearchCategory = searchCategory.substring(1, searchCategory.length);
    for (var key in searchEngines) {
      var searchEngObj = searchEngines[key];
      var cat = resolveValue(searchEngObj,"category");
      if (cat.startsWith(newSearchCategory)) categories.add(cat);
    }
  }

  return Array.from(categories);
}

// If user search key is a category then it return the matching list of search keys for given category
function getSearchEngineKeysForInputCategory(searchCategory) {
  if (! searchCategory.startsWith(CHAR_GROUP_NAME_START_IDENTIFIER)) return;
  var searchKeys = [];

  if (searchCategory == CHAR_GROUP_NAME_START_IDENTIFIER) {
    // Pick all the search engines.
    for (var key in searchEngines) {
      searchKeys.push(key);
    }
  }
  else if (searchCategory == (CHAR_GROUP_NAME_START_IDENTIFIER + CHAR_GROUP_NAME_START_IDENTIFIER)) {
    // Pick the search engines with blank/empty category
    for (var key in searchEngines) {
      var searchEngObj = searchEngines[key];
      if (resolveValue(searchEngObj,"category") == "") searchKeys.push(key);
    }
  }
  else {
    // Pick the search engines matching category. If there is only one category then pick that one.
    var matchingCategories = getMatchingSearchCategoriesForInputCategory(searchCategory);
    if (matchingCategories.length == 1) {
      let curCategory = matchingCategories[0];
      for (var key in searchEngines) {
        var searchEngObj = searchEngines[key];
        var cat = resolveValue(searchEngObj,"category");
        if (cat == curCategory) searchKeys.push(key);
      }
    }
  }

  return searchKeys;
}

// Build Search Url based on user input
function buildSearchURL(text) {
  if (text.toLowerCase().startsWith("http://") || text.toLowerCase().startsWith("https://")) return `${text}`;
  let input = splitInputTextForSearch(text);
  let searchEngObj = searchEngines[input.searchEngine];
  if (searchEngObj) {
  	let searchUrl = searchEngObj.url;
  	let url = null;
  	if (searchUrl.includes(SEARCH_TEXT_PLACEHOLDER)) {
      url = strReplaceAll(searchUrl, SEARCH_TEXT_PLACEHOLDER, input.queryText);
    }
    else {
      url = buildUrlForSplitWordSearch(searchUrl, input.queryText);
    }
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

function strReplaceAll(str, toReplace, replacement) {
  return str.split(toReplace).join(replacement);
}

function buildUrlForSplitWordSearch(searchUrl, fullQueryText) {
  // Will contain all the remaining words if plaeholder count is less than query words.
  var lastQueryText = "";
  // Will contain the final split of query text words based on how many search tags are present in URL.
  var queryText = [];
  var parts = fullQueryText.split(" ");
  var count = 0;
  // Start preparing the list of query words
  if (searchUrl.includes(SEARCH_TEXT_PLACEHOLDER_0)) {
    if (parts.length > count) queryText.push(parts[count]);
    else queryText.push("");
    count += 1;
  }
  if (searchUrl.includes(SEARCH_TEXT_PLACEHOLDER_1)) {
    if (parts.length > count) queryText.push(parts[count]);
    else queryText.push("");
    count += 1;
  }
  if (searchUrl.includes(SEARCH_TEXT_PLACEHOLDER_2)) {
    if (parts.length > count) queryText.push(parts[count]);
    else queryText.push("");
    count += 1;
  }
  if (searchUrl.includes(SEARCH_TEXT_PLACEHOLDER_3)) {
    if (parts.length > count) queryText.push(parts[count]);
    else queryText.push("");
    count += 1;
  }
  if (searchUrl.includes(SEARCH_TEXT_PLACEHOLDER_4)) {
    if (parts.length > count) queryText.push(parts[count]);
    else queryText.push("");
    count += 1;
  }
  if (searchUrl.includes(SEARCH_TEXT_PLACEHOLDER_5)) {
    if (parts.length > count) queryText.push(parts[count]);
    else queryText.push("");
    count += 1;
  }
  if (searchUrl.includes(SEARCH_TEXT_PLACEHOLDER_6)) {
    if (parts.length > count) queryText.push(parts[count]);
    else queryText.push("");
    count += 1;
  }
  if (searchUrl.includes(SEARCH_TEXT_PLACEHOLDER_7)) {
    if (parts.length > count) queryText.push(parts[count]);
    else queryText.push("");
    count += 1;
  }
  if (searchUrl.includes(SEARCH_TEXT_PLACEHOLDER_8)) {
    if (parts.length > count) queryText.push(parts[count]);
    else queryText.push("");
    count += 1;
  }
  if (searchUrl.includes(SEARCH_TEXT_PLACEHOLDER_9)) {
    if (parts.length > count) queryText.push(parts[count]);
    else queryText.push("");
    count += 1;
  }

  // If query words are more than search tags, last tag will get the remaining search words.
  if (count < parts.length) {
    for (var i = 1; i < count; i++) parts.shift();
    lastQueryText = parts.join(" ");
  }
  count = 0;
  // Start backword for search tag replacement in URL.
  if (searchUrl.includes(SEARCH_TEXT_PLACEHOLDER_9)) {
    count += 1;
    if (lastQueryText != "" && count == 1) searchUrl = strReplaceAll(searchUrl, SEARCH_TEXT_PLACEHOLDER_9, lastQueryText);
    else searchUrl = strReplaceAll(searchUrl, SEARCH_TEXT_PLACEHOLDER_9, queryText[queryText.length - count]);
  }
  if (searchUrl.includes(SEARCH_TEXT_PLACEHOLDER_8)) {
    count += 1;
    if (lastQueryText != "" && count == 1) searchUrl = strReplaceAll(searchUrl, SEARCH_TEXT_PLACEHOLDER_8, lastQueryText);
    else searchUrl = strReplaceAll(searchUrl, SEARCH_TEXT_PLACEHOLDER_8, queryText[queryText.length - count]);
  }
  if (searchUrl.includes(SEARCH_TEXT_PLACEHOLDER_7)) {
    count += 1;
    if (lastQueryText != "" && count == 1) searchUrl = strReplaceAll(searchUrl, SEARCH_TEXT_PLACEHOLDER_7, lastQueryText);
    else searchUrl = strReplaceAll(searchUrl, SEARCH_TEXT_PLACEHOLDER_7, queryText[queryText.length - count]);
  }
  if (searchUrl.includes(SEARCH_TEXT_PLACEHOLDER_6)) {
    count += 1;
    if (lastQueryText != "" && count == 1) searchUrl = strReplaceAll(searchUrl, SEARCH_TEXT_PLACEHOLDER_6, lastQueryText);
    else searchUrl = strReplaceAll(searchUrl, SEARCH_TEXT_PLACEHOLDER_6, queryText[queryText.length - count]);
  }
  if (searchUrl.includes(SEARCH_TEXT_PLACEHOLDER_5)) {
    count += 1;
    if (lastQueryText != "" && count == 1) searchUrl = strReplaceAll(searchUrl, SEARCH_TEXT_PLACEHOLDER_5, lastQueryText);
    else searchUrl = strReplaceAll(searchUrl, SEARCH_TEXT_PLACEHOLDER_5, queryText[queryText.length - count]);
  }
  if (searchUrl.includes(SEARCH_TEXT_PLACEHOLDER_4)) {
    count += 1;
    if (lastQueryText != "" && count == 1) searchUrl = strReplaceAll(searchUrl, SEARCH_TEXT_PLACEHOLDER_4, lastQueryText);
    else searchUrl = strReplaceAll(searchUrl, SEARCH_TEXT_PLACEHOLDER_4, queryText[queryText.length - count]);
  }
  if (searchUrl.includes(SEARCH_TEXT_PLACEHOLDER_3)) {
    count += 1;
    if (lastQueryText != "" && count == 1) searchUrl = strReplaceAll(searchUrl, SEARCH_TEXT_PLACEHOLDER_3, lastQueryText);
    else searchUrl = strReplaceAll(searchUrl, SEARCH_TEXT_PLACEHOLDER_3, queryText[queryText.length - count]);
  }
  if (searchUrl.includes(SEARCH_TEXT_PLACEHOLDER_2)) {
    count += 1;
    if (lastQueryText != "" && count == 1) searchUrl = strReplaceAll(searchUrl, SEARCH_TEXT_PLACEHOLDER_2, lastQueryText);
    else searchUrl = strReplaceAll(searchUrl, SEARCH_TEXT_PLACEHOLDER_2, queryText[queryText.length - count]);
  }
  if (searchUrl.includes(SEARCH_TEXT_PLACEHOLDER_1)) {
    count += 1;
    if (lastQueryText != "" && count == 1) searchUrl = strReplaceAll(searchUrl, SEARCH_TEXT_PLACEHOLDER_1, lastQueryText);
    else searchUrl = strReplaceAll(searchUrl, SEARCH_TEXT_PLACEHOLDER_1, queryText[queryText.length - count]);
  }
  if (searchUrl.includes(SEARCH_TEXT_PLACEHOLDER_0)) {
    count += 1;
    if (lastQueryText != "" && count == 1) searchUrl = strReplaceAll(searchUrl, SEARCH_TEXT_PLACEHOLDER_0, lastQueryText);
    else searchUrl = strReplaceAll(searchUrl, SEARCH_TEXT_PLACEHOLDER_0, queryText[queryText.length - count]);
  }

  return searchUrl;
}

// Plugin init function
function pluginLoadData() {
  // Read preferences
  getSearchEnginesFromPreferences();
}

function onGotPreferences(item) {
  multiSearchDisabled = false;
  if (item[SEARCH_PREFERENCE_KEY]) searchEngines = item[SEARCH_PREFERENCE_KEY];

  for (var key in searchEngines) {
    if (key.includes(CHAR_SEPARATOR_FOR_MULTI_SEARCH)) {
      multiSearchDisabled = true;
    }
    let curSearchObj = preferences[key];
    // Handle new preference property 'category'
    curSearchObj["category"] = resolveValue(curSearchObj, "category");
  }
}

// Read preferences from storage
function getSearchEnginesFromPreferences() {
  var preferences = safari.extension.settings.customSearchSettings;
  if (preferences == null) onGotPreferences(JSON.parse("{}"));
  else onGotPreferences(JSON.parse(preferences));
}

function buildUrlsForSearchKeys(searchEngineKeys, queryText) {
  var searchEngineUrls = [];
  var isFirstSearch = true;
  for (var keyIdx in searchEngineKeys) {
    var searchKey = searchEngineKeys[keyIdx];
    if (searchKey.length != 0) {
      var url = buildSearchURL(searchEngineKeys[keyIdx] + " " + queryText);
      if (url) {
        searchEngineUrls.push({"url": url, "position": (isFirstSearch) ? 0 : searchEngineUrls.length});
        isFirstSearch = false;
      }
    }
  }
  return searchEngineUrls;
}

function beforeSearch_BuildUrls(queryText) {
  // Array of objects {"url" : url, "position" : <position>}
  var searchEngineUrls = [];
  if (text.startsWith(CHAR_GROUP_NAME_START_IDENTIFIER)) {
    // For category driven search
    var input = splitInputTextForSearch(text)
    var searchEngineKeys = getSearchEngineKeysForInputCategory(input.searchEngine);
    searchEngineUrls = buildUrlsForSearchKeys(searchEngineKeys, input.queryText);
  }
  else if (multiSearchDisabled) {
    let url = buildSearchURL(queryText);
    if (url) searchEngineUrls.push({"url": url, "position": 0});
  }
  else {
    var input = splitInputTextForSearch(queryText)
    var searchEngineKeys = input.searchEngine.split(CHAR_SEPARATOR_FOR_MULTI_SEARCH);
    searchEngineUrls = buildUrlsForSearchKeys(searchEngineKeys, input.queryText);
  }
  return searchEngineUrls;
}

function beforeSearch_OpenUrls(e, searchEngineUrls) {
  if (searchEngineUrls.length == 0) return;

  while (searchEngineUrls.length > 0) {
    var seUrl = searchEngineUrls.pop();
    var url = seUrl.url;
    var curPosition = seUrl.position;
    if (!url) return;
    if (curPosition == 0) {
      e.preventDefault();
      e.target.url = url;
    }
    else {
      nextIndex = safari.application.activeBrowserWindow.tabs.indexOf(safari.application.activeBrowserWindow.activeTab) + 1
      safari.application.activeBrowserWindow.openTab("background", nextIndex).url = url;
    }
  }
}

function beforeSearch(e) {
  let mainInput = splitInputTextForSearch(e.query);
  // Must start with extension key
  if (mainInput.searchEngine != SEARCH_EXTENSION_KEY) return;

  var searchEngineUrls = beforeSearch_BuildUrls(mainInput.queryText);
  beforeSearch_OpenUrls(e, searchEngineUrls);
}

// Main function which loads the plugin functionality
function main() {
  pluginLoadData();

  safari.application.addEventListener('beforeSearch', beforeSearch);

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
