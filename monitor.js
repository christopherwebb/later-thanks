function tab_div_name(tab_id)
{
    return "tab_detail_" + tab_id;
}

function create_tab_entry(tab)
{
    var table_entry = document.createElement("tr");
    table_entry.id = tab_div_name(tab.id);

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

function add_tab_entry(tab)
{
    var table = document.getElementById("tab_list");
    var element = create_tab_entry(tab);
    table.appendChild(element);
    //document.body.appendChild(document.createElement("br"));
}

function get_tabs(result)
{
    for (var i = 0, tab;tab = result[i];i++)
    {
        add_tab_entry(tab);
    }
}

function event_tab_update(tabId, changeInfo, tab)
{
    if (changeInfo.url == undefined)
        return;

    // Look for already existing tab entry
    var updated_tab_div = document.getElementById(tab_div_name(tabId));

    // Modify existing entry
    if (updated_tab_div != null)
    {
        var replacement_element = create_tab_entry(tab);
        document.body.replaceChild(replacement_element,updated_tab_div);
    }
    // Add new entry 
    else
    {
        add_tab_entry(tab);
    }
}

function event_tab_remove(tabId, removeInfo)
{
    var removed_tab_div = document.getElementById(tab_div_name(tabId));
    document.body.removeChild(removed_tab_div);
}

function store_tabs_btn_clicked()
{
    var tab_checkbox_list = document.getElementsByClassName("tab_select_checkbox");
    for (var i = 0,checkbox;checkbox = tab_checkbox_list[i];i++)
    {
        checkbox.getAttribute("type", "checkbox");
        if (checkbox.checked)
        {
            var test_div = document.createElement("div");
            test_div.textContent = "Tab " + checkbox.value + " is checked";
            document.body.appendChild(test_div);
        }
    }
}

function load_event()
{
    var store_tabs_btn = document.getElementById("store_tabs_btn");
    store_tabs_btn.addEventListener("click", store_tabs_btn_clicked);
}

var tab_query = new Object();
chrome.tabs.query(tab_query, get_tabs);
chrome.tabs.onUpdated.addListener(event_tab_update);
chrome.tabs.onRemoved.addListener(event_tab_remove);

document.addEventListener("DOMContentLoaded", load_event);
