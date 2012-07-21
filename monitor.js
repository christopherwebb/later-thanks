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
        if (changeInfo.url === undefined)
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
    check_folder_contents: function check_folder_contents()
    {
        dropbox.getMetadata('', function(data)
        {
            var metadata = data;
        });
    }
,
    date_filename: function date_filename(date)
    {
        function pad(number) {
            var r = String(number);
            if ( r.length === 1 ) {
                r = '0' + r;
            }
            return r;
        }

        var filename = date.getUTCFullYear() + pad(date.getUTCMonth() + 1) + pad(date.getUTCDate()) + ".json";
        return filename;
    }
,
    get_json: function get_json(filename, success, failure)
    {
        dropbox.getFile(
            filename,
            function(data) {
                success(filename, data);
            },
            function(error) {
                failure(filename, error);
            }
        );
    }
,
    store_tabs_btn_clicked: function store_tabs_btn_clicked()
    {
        tab_monitor.store_tabs_via_date();
    }
,
    store_tabs_via_date: function store_tabs_via_date()
    {
        var tab_array = new Array(0);

        tab_monitor.process_selection(
            function(){
                if (tab_array.length < 1)
                    return;

                tab_monitor.get_json(
                    tab_monitor.date_filename(new Date(Date.now())),
                    function(filename,data){
                        tab_monitor.save_tabs(filename, data, tab_array);
                    },
                    function(filename,error){
                        if (error.jqXHR.status === 404) { tab_monitor.save_tabs(filename, undefined, tab_array); }
                        else { throw "File error - not due to 404"; }
                    }
                );
            },
            function(tab_info){
                if (tab_info !== null)
                {
                    tab_array.push({
                        'url': tab_info.url,
                        'title': tab_info.title || 'Untitled'
                    });
                }
            }
        );
    }
,
    process_selection: function process_selection(on_complete, tab_checked, tab_unchecked)
    {
        var tab_checkbox_list = $('.tab_select_checkbox');
        
        var recurse = function(checkbox_list) {
            if (checkbox_list.length > 0) {
                if (checkbox_list[0].checked && tab_checked) {
                    //
                    //  Append tab details to save tab list
                    //
                    chrome.tabs.get(Number(checkbox_list[0].value), function(tab_info) {
                        tab_checked(tab_info);
                        recurse(checkbox_list.slice(1));
                    });
                }
                else if (!checkbox_list[0].checked && tab_unchecked) {
                    //
                    //  Append tab details to save tab list
                    //
                    chrome.tabs.get(Number(checkbox_list[0].value), function(tab_info) {
                        tab_unchecked(tab_info);
                        recurse(checkbox_list.slice(1));
                    });
                }
                else
                {
                    recurse(checkbox_list.slice(1));
                }
            }
            else {
                on_complete();
            }
        }

        recurse(tab_checkbox_list);
    }
,
    save_tabs: function save_tabs(save_to_name, preexisting_data, new_data)
    {
        var today = new Date(Date.now());
        var date_title = today.getUTCFullYear() + '/' + (today.getUTCMonth() + 1) + '/' + today.getUTCDate();
        var tab_array = new Array(0);
        var tab_store = {
            'title': date_title,
            'date': today,
            'version': 1.0,
            'type': 'daily',
            'tabs': [],
        };

        if (preexisting_data !== undefined)
        {
            try
            {
                var parsed_preexisting_data = JSON.parse(preexisting_data);
                tab_store.tabs = parsed_preexisting_data.tabs;
            }
            catch (e)
            {}
        }
        
        if (new_data.length > 0)
        {
            tab_store['tabs'].push({
                    'pushed': today,
                    'tabs': new_data
            }) ;
            dropbox.quick_upload(save_to_name, JSON.stringify(tab_store), true);
            //$('#messages').
        }
    }
,
    load_event: function load_event()
    {
        $('#store_tabs_btn').click(tab_monitor.store_tabs_btn_clicked);
        $('#manual_button').click(tab_monitor.manual_input);
        //dropbox.getFolderContents('',tab_monitor.folder_contents())
        tab_monitor.loadStoredTabs();
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
,
    manual_input: function ()
    {
        var raw_entries = $('.manual-submission textarea').val().split('\n');
        var manual_entries = [];
        raw_date = raw_entries[0].split('/');
        date = new Date(raw_date[2],raw_date[1] - 1,raw_date[0]);
        for (var i = 1,entry;entry = raw_entries[i];i++)
        {
            if (entry.length > 0)
            {
                manual_entries.push({'url': entry});
            }
        }

        if (manual_entries.length < 1)
            return;

        tab_monitor.get_json(
            tab_monitor.date_filename(date),
            function(filename,data){
                tab_monitor.save_tabs(filename, data, manual_entries);
            },
            function(filename,error){
                if (error.jqXHR.status === 404) { tab_monitor.save_tabs(filename, undefined, manual_entries); }
                else { throw "File error - not due to 404"; }
            }
        );
    }
,
    loadStoredTabs: function ()
    {
        dropbox.getFolderContents(
            '',
            function (data) {
                for (var iter = 0, entry;entry = data['contents'][iter];iter++) {
                    if (!entry['is_dir']) {
                        tab_monitor.create_saved_entry(entry);
                    }
                }
            },
            function (error) {
                console.log('Error accessing folder contents.');
            }
        );
    }
,
    create_saved_entry: function (entry)
    {
        var search_exp = new RegExp('[A-Za-z0-9 -]+.json$');
        var extracted;
        if (!(extracted = search_exp.exec(entry['path'])))
        {
            return;
        }
        var parsed_name = extracted[0].replace(RegExp('.json$'),'');

        var id_name = escape('saved_json_' + parsed_name);
        var id_name_query = '[id=\'' + id_name + '\']';
        $('#dropbox_list').append('<tr id=\"' + id_name +'\"></tr');
        $(id_name_query).append('<td>' + entry['path'] + '</td>');
    }
});

var tab_query = new Object();
chrome.tabs.query(tab_query, tab_monitor.get_tabs);
chrome.tabs.onUpdated.addListener(tab_monitor.event_tab_update);
chrome.tabs.onRemoved.addListener(tab_monitor.event_tab_remove);
chrome.extension.onRequest.addListener(tab_monitor.request_received);

document.addEventListener("DOMContentLoaded", tab_monitor.load_event);
