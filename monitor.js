var tab_monitor = {};

tab_monitor.setProperties = function setProperties(into, from) {
    if (into != null && from != null) {
        for (var key in from) {
            into[key] = from[key];
        }
    }
    return into;
}

tab_monitor.setProperties(tab_monitor,
{
    tab_div_name: function tab_div_name(tab_id)
    {
        return "tab_detail_" + tab_id;
    }
,
    create_tab_entry: function create_tab_entry(tab)
    {
        var table_entry = document.createElement("tr");
        table_entry.id = tab_monitor.tab_div_name(tab.id);

        var tab_title = document.createElement("td");
        tab_title.textContent = tab.title;

        var tab_select = document.createElement("td");
        var selector = document.createElement("input");
        selector.className = "tab_select_checkbox";
        selector.setAttribute("type", "checkbox");
        selector.setAttribute("value", tab.id);
        tab_select.appendChild(selector);

        table_entry.appendChild(tab_title);
        table_entry.appendChild(tab_select);
        return table_entry;
    }
,
    add_tab_entry: function add_tab_entry(tab)
    {
        var table = document.getElementById("tab_list");
        var element = tab_monitor.create_tab_entry(tab);
        table.appendChild(element);
        //document.body.appendChild(document.createElement("br"));
    }
,
    get_tabs: function get_tabs(result)
    {
        for (var i = 0, tab;tab = result[i];i++)
        {
            tab_monitor.add_tab_entry(tab);
        }
    }
,
    event_tab_update: function event_tab_update(tabId, changeInfo, tab)
    {
        if (changeInfo.url == undefined)
            return;

        // Look for already existing tab entry
        var updated_tab_div = document.getElementById(tab_monitor.tab_div_name(tabId));

        // Modify existing entry
        if (updated_tab_div != null)
        {
            var replacement_element = tab_monitor.create_tab_entry(tab);
            document.body.replaceChild(replacement_element,updated_tab_div);
        }
        // Add new entry 
        else
        {
            tab_monitor.add_tab_entry(tab);
        }
    }
,
    event_tab_remove: function event_tab_remove(tabId, removeInfo)
    {
        var removed_tab_div = document.getElementById(tab_monitor.tab_div_name(tabId));
        document.body.removeChild(removed_tab_div);
    }
,
    store_tabs_btn_clicked: function store_tabs_btn_clicked()
    {
        var tab_array = new Array(0);
        var tab_store = {
            'title': 'not yet',
            'creation': 'not yet',
            'tabs': tab_array
        };
        var tab_checkbox_list = document.getElementsByClassName("tab_select_checkbox");

        if (tab_checkbox_list.length < 1)
        {
            return;
        }
       
        for (var i = 0,checkbox;checkbox = tab_checkbox_list[i];i++)
        {
            chrome.tabs.get(Number(checkbox.value), function(tab_info){
                if (tab_info !== null)
                {
                    tab_array.push({
                        'url': tab_info.url,
                        'title': tab_info.title || 'Untitled'
                    });
                }
            });
        }
        dropbox.uploadFile("upload00001.json", JSON.stringify(tab_store, null, '\t'));
    }
,
    load_event: function load_event()
    {
        var store_tabs_btn = document.getElementById("store_tabs_btn");
        store_tabs_btn.addEventListener("click", tab_monitor.store_tabs_btn_clicked);
        //dropbox.getFolderContents('',tab_monitor.folder_contents())
    }
,
    request_received: function (request, sender, sendResponse)
    {
        if (request.oauth_status === 'user permission granted')
            console.log("OAuth user permission granted")
            dropbox.setup();
    }
,
    dropbox_ready: function () {}

});

var tab_query = new Object();
chrome.tabs.query(tab_query, tab_monitor.get_tabs);
chrome.tabs.onUpdated.addListener(tab_monitor.event_tab_update);
chrome.tabs.onRemoved.addListener(tab_monitor.event_tab_remove);
chrome.extension.onRequest.addListener(tab_monitor.request_received);

document.addEventListener("DOMContentLoaded", tab_monitor.load_event);
