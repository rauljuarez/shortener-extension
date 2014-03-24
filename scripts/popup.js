var background_page = chrome.extension.getBackgroundPage();
var current_tab;

function serviceClick(service)
{    
	return function () 
	{
       share(service, current_tab);
    }
}

function addActions()
{
	var show_actions = false;
	
	var actions = actionsGetter();
	var action_element = document.getElementById('actions');
	

	for (var action in actions)
	{		
		if(!actions[action])
			continue;

		show_actions = true;
			
		var element = document.createElement('div');
		element.setAttribute('class', 'item');
			
		var image = document.createElement('img');
		image.setAttribute('width', '16');

		var nbsp = document.createTextNode('\u00A0');
		
		var anchor = document.createElement('a');
		anchor.setAttribute('href', '#');
		
		switch(action)
		{
			case 'copy':
				image.id = 'copy_link';
				image.setAttribute('src', 'images/copy.png');
				
				anchor.innerText = chrome.i18n.getMessage('copy');
				anchor.addEventListener('click', function () 
												{ 
													background_page.copyToClipboard(current_tab.shortenedUrl); 
													window.close(); 
												}
												, false);
			break;
		}
		
		element.appendChild(image);
		element.appendChild(nbsp);
		element.appendChild(anchor);
		action_element.appendChild(element);
	}
	
	if(show_actions)
		document.getElementById('actions').setAttribute('style', 'visibility:visible; display:block;');
}

function addServices()
{		
	var show_services = false;

	var services = servicesGetter();
	var services_element = document.getElementById('services');
	
	for (var service in services)
	{		
		if(!services[service] || servicesJSON[service] == undefined)
			continue;
			
		show_services = true;
	
		var element = document.createElement('div');
		element.setAttribute('class', 'item');
		
		var image = document.createElement('img');
		image.setAttribute('width', '16');
		image.setAttribute('src', 'images/' + servicesJSON[service].icon);

		var nbsp = document.createTextNode('\u00A0');
		
		var anchor = document.createElement('a');
		anchor.setAttribute('href', '#');
		anchor.innerText = servicesJSON[service].name;
		anchor.addEventListener('click', serviceClick(service));
		
		//element.appendChild(image);
		//element.appendChild(nbsp);
		//element.appendChild(anchor);
		//services_element.appendChild(element);
	}	
	
	
}

function onResponse(response)
{			
	if(response.status == 'error')
	{
		document.getElementById('loading').innerText = response.message;
	}
	else
	{
		var preferences = preferencesGetter();
	
		current_tab.shortenedUrl = response.message;
	
		if(preferences.auto_copy)
			background_page.copyToClipboard(current_tab.shortenedUrl);
	
		document.getElementById('url').innerText = current_tab.shortenedUrl;
		
		
		addActions();
		
		document.getElementById('loading').setAttribute('style', 'visibility:hidden; display:none;');
		document.getElementById('response').setAttribute('style', 'visibility:visible; display:block;');
	}
}

function init()
{
	chrome.tabs.getSelected(null, function(tab) 
	{
		current_tab = tab;
		background_page.shortenUrl(tab.url, tab.incognito, onResponse);
	});
}

document.addEventListener('DOMContentLoaded', function () 
{
	document.getElementById('loading').innerText = chrome.i18n.getMessage('shortening');
	init();
});