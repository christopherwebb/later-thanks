function get_tabs(result)
{
	for (var i = 0, tab;tab = result[i];i++)
	{
		var text_element = document.createElement("tab detail");
		text_element.textContent = tab.title;
		document.body.appendChild(text_element);
	}
};

var blank = {};
chrome.tabs.query(blank, get_tabs);
