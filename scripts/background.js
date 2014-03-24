//You sholud put here your URL Shortener Service, was used for TopicFlower Service, but if yours returns a JSON with the URL, go for it
var url = 'THISISTHEPLACETOPUTYOURURLSHORTENER';

var timer = null;
var milliseconds = 20000;

function chromeExOAuthOnAuthorize(token, secret) {
    if (typeof OnAuthorizeCallBack === 'function')
        OnAuthorizeCallBack();
}

function copyToClipboard(text) {
    var input = document.getElementById('url');

    if (input == undefined)
        return;

    input.value = text;
    input.select();

    document.execCommand('copy', false, null);
}

function shortenUrl(longUrl, incognito, callback)
{	
	var response;
	xmlhttp = new XMLHttpRequest();
	xmlhttp.open('POST', url, true);
	xmlhttp.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
	
	var auth = {};
	
	xmlhttp.onreadystatechange = function()
	{
		if(xmlhttp.readyState == 4 && xmlhttp.status == 200) 
		{
			clearTimeout(timer);

			response = JSON.parse(xmlhttp.responseText);
			if(response.shortener == undefined)
			{
				callback({status: 'error', message: response.error.message});
			}
			else	
			{
				callback({status: 'success', message: response.shortener.url});
			}
			
		}
	}

	xmlhttp.send('url='+longUrl);
	timer = setTimeout(function()
	{
		xmlhttp.abort();
		callback({status: 'error', message: chrome.i18n.getMessage('timeout_occurred')});
	}
	, milliseconds);
}

function onMessage(message, sender, callback) {
    switch (message.type) {
    case 'shortcut':
        chrome.tabs.getSelected(null, function (tab) {
            shortenUrl(tab.url, tab.incognito, function (response) {
                if (response.status != 'error') {
                    if (message.shortcut == 'copy') {
                        copyToClipboard(response.message);
                    } else {
                        tab.shortenedUrl = response.message;
                        share(message.shortcut, tab);
                    }
                }

                callback(response);
            });
        });
        break;

    case 'preferences':
        var shortcuts = shortcutsGetter();
        var preferences = preferencesGetter();
        shortcuts.shortcuts_enabled = preferences.shortcuts_enabled;

        callback(shortcuts);
        break;
    }
}

function init() {
    createContextMenu();
    chrome.extension.onMessage.addListener(onMessage);
}

document.addEventListener('DOMContentLoaded', function () {
    init();
});