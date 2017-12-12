
// Open Options page upon settings checkbox click.
safari.extension.settings.openCustomSearchEngineOptions = false;
safari.extension.settings.addEventListener("change", function(e) {
	if (e.key == 'openCustomSearchEngineOptions') {
    	var safariWindow = safari.application.activeBrowserWindow;
    	var tab = safariWindow.openTab("foreground");
    	if (!safariWindow.visible) safariWindow.activate();
    	tab.url = safari.extension.baseURI + "safari_options.html";
    }
}, false);

