chrome.tabs.query({url:chrome.extension.getURL("main.html")},
    function (tabs)
    {
        for (i = 0;i < tabs.length;i++)
        {
            chrome.tabs.sendRequest(tabs[i].id,
                {oauth_status: 'user permission granted'});
        }
    }
)
