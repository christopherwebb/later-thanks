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
    add_tab_entry: function add_tab_entry(tab)
    {
        $('#tab_list').append('<tr id=' + tab_monitor.tab_div_name(tab.id) + '></tr>');
        $('#tab_list #' + tab_monitor.tab_div_name(tab.id))
            .append('<td><input class="tab_select_checkbox" type="checkbox" value="' + tab.id + '"></td>')
            .append('<td class=title>' + tab.title + '</td>');
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

        if ($('#tab_list #' + tab_monitor.tab_div_name(tab.id)).length)
            $('#tab_list #' + tab_monitor.tab_div_name(tab.id) + ' td.title').text(tab.title);
        else
            tab_monitor.add_tab_entry(tab);
    }
,
    event_tab_remove: function event_tab_remove(tabId, removeInfo)
    {
        $('#tab_list #' + tab_monitor.tab_div_name(tabId)).remove();
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
        tab_monitor.store_tabs_via_date({});
    }
,
    store_tabs_close_btn_clicked: function store_tabs_close_btn_clicked()
    {
        var on_success = function() { tab_monitor.close_selected_tabs(); };

        tab_monitor.store_tabs_via_date({
            'on_success': on_success
        });
    }
,
    store_tabs_via_date: function store_tabs_via_date(callback)
    {
        var tab_array = new Array(0);

        tab_monitor.process_selection(
            function(){
                if (tab_array.length < 1)
                    return;

                tab_monitor.get_json(
                    tab_monitor.date_filename(new Date(Date.now())),
                    function(filename,data){
                        tab_monitor.save_tabs(filename, data, tab_array, callback);
                    },
                    function(filename,error){
                        if (error.jqXHR.status === 404) { tab_monitor.save_tabs(filename, undefined, tab_array, callback); }
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
                    //  Tab is checked
                    //
                    chrome.tabs.get(Number(checkbox_list[0].value), function(tab_info) {
                        tab_checked(tab_info);
                        recurse(checkbox_list.slice(1));
                    });
                }
                else if (!checkbox_list[0].checked && tab_unchecked) {
                    //
                    //  Tab is unchecked
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
    save_tabs: function save_tabs(save_to_name, preexisting_data, new_data, callback)
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
            });
            dropbox.quick_upload(save_to_name, JSON.stringify(tab_store), true, function (results) {
                var weird_failure_rsp = function () {
                    tab_monitor.display_message("Upload apparently successful, but response seems alarming");
                    if (callback['on_failure']) { callback.on_failure(results); }
                }
                // On dropbox result
                if (results.status === 200)
                {
                    try {
                        if (JSON.parse(results.response)['rev'] === undefined)
                            weird_failure_rsp();
                        else {
                            tab_monitor.display_message("Upload successful");
                            if (callback['on_success']) { callback.on_success(JSON.parse(results.response)) };
                        }
                    }
                    catch (e) {
                        weird_failure_rsp();
                    }
                }
                else
                {
                    tab_monitor.display_message("Upload unsuccessful");
                    callback.on_failure(results);
                }
            });
            //$('#messages').
        }
    }
,
    close_selected_tabs: function close_selected_tabs ()
    {
        var tab_id_array = new Array(0);

        // Has to be the slowest way of closing tabs, ever. Oh well. The function was there :p
        tab_monitor.process_selection(
            function() {
                chrome.tabs.remove(tab_id_array);
            },
            function(tab_info) {
                if (tab_info !== null)
                {
                    tab_id_array.push(tab_info.id);
                }
            }
        );
    }
,
    load_event: function load_event()
    {
        $('#store_tabs_btn').click(tab_monitor.store_tabs_btn_clicked);
        $('#store_tabs_close_btn').click(tab_monitor.store_tabs_close_btn_clicked);
        $('#manual_button').click(tab_monitor.manual_input);
        //dropbox.getFolderContents('',tab_monitor.folder_contents())
        // tab_monitor.loadStoredTabs();
    }
,
    request_received: function (request, sender, sendResponse)
    {
        if (request.oauth_status === 'user permission granted')
        {
            console.log("OAuth user permission granted")
            dropbox.setup();
        }
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
                for (var iter = 0, entry; entry = data['contents'][iter]; iter++) {
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
    load_tab_file: function(filename)
    {
        var create_tabs = function (this_tab_info) {
            var tab_insert_index = this_tab_info.index + 1;

            for (var block_index = 0, block; block = stored_entries[block_index]; block_index++) {
                var block_tabs = block['tabs'];
                for (var tab_index = 0, tab_entry; tab_entry = block_tabs[tab_index]; tab_index++) {
                    chrome.tabs.create({
                        'url': tab_entry.url,
                        'index': tab_insert_index
                    });
                    tab_insert_index++;
                }
            }
        };

        tab_monitor.get_json(
            filename,
            function (filename, data) {
                try {
                    var stored_entries = JSON.parse(data).tabs;
                }
                catch (e) {
                    return;
                }

                chrome.tabs.getCurrent(create_tabs);
            },
            function (filename,error) {
                console.log('Unable to get file.');
            }
        );
    }
,
    show_saved_entries: function (filename) {
        var show_saved_entry = function (stored_entries) {
            $('#saved_url_list').empty();
            var count = 0;
            var on_each_entry = function(tab_entry) {
                var id_name = escape('saved_url_' + count);
                var id_name_query = '#' + id_name;
                
                $('#saved_url_list').append('<tr id=\"' + id_name +'\"></tr>');
                $(id_name_query).append('<td>' + tab_entry.url + '</td>');
                $(id_name_query).append('<td><a class="open" href=\"#\">Open tab</a></td>');
                $(id_name_query).append('<td><a class="read" href=\"#\">Mark tab read</a></td>');

                $(id_name_query + ' a.open').click(function () {
                    chrome.tabs.getCurrent(function(this_tab_info) {
                        chrome.tabs.create({
                            'url': tab_entry.url,
                            'index': this_tab_info.index + 1
                        });
                    });
                });
                $(id_name_query + ' a.read').click(function () {
                    //tab_monitor.load_tab(tab_entry.url);
                });

                count++;
            };
            _.each(_.pluck(stored_entries, 'tabs'), function(block_entries) {
                _.each(block_entries, function(tab_entry) {
                    on_each_entry(tab_entry);
                });
            });
        };

        tab_monitor.get_json(
            filename,
            function (filename, data) {
                try {
                    var stored_entries = JSON.parse(data).tabs;
                }
                catch (e) {
                    return;
                }

                show_saved_entry(stored_entries);
            },
            function (filename,error) {
                console.log('Unable to get file.');
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

        var filename = entry['path'];
        if (filename.indexOf('/') === 0) {
            filename = filename.substring(1);
        }

        var id_name = escape('saved_json_' + parsed_name);
        //var id_name_query = '[id=\'' + id_name + '\']';
        var id_name_query = '#' + id_name;
        $('#dropbox_list').append('<tr id=\"' + id_name +'\"></tr>');
        $(id_name_query).append('<td>' + filename + '</td>');
        $(id_name_query).append('<td><a href=\"#\">Open tabs</a></td>');

        $(id_name_query + ' a').click(function () {
            // tab_monitor.load_tab(filename);
            tab_monitor.show_saved_entries(filename);
        });
    }
,
    display_message: function (message) {
        console.log('Status update: ' + message);
    }
});
