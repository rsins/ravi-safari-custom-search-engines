// Keyword to use for this extension
const SEARCH_EXTENSION_KEY = "ms";

// This part of the search engine url gets replaced by the actual query text.
const SEARCH_TEXT_PLACEHOLDER = "{searchTerms}";

// Property name in the preference data stored in storage
const SEARCH_PREFERENCE_KEY = "custom_engines";

// Property name in the preference file for preference data
const PREFERENCE_FILE_PREF_TAG = "preferences";
// Property name in the preference file for version number
const PREFERENCE_FILE_VERSION_TAG = "file_version";
// Minimum file version supported
const PREFERENCE_FILE_VERSION_MIN = "1.0";
// Current file version
const PREFERENCE_FILE_VERSION_CUR = "1.0";

// Url for popular search engines data
const POPULAR_SEARCH_ENGINE_URL = "https://raw.githubusercontent.com/rsins/ravi-firefox-custom-search-engines/master/SampleCustomEngines/PopularSearchEngines.txt";

function getPopularSearchEngineData() {
  return fetch(POPULAR_SEARCH_ENGINE_URL).then((resp) => resp.text());
}
