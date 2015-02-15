var archiver = function() {
  var get_saved_tabs_list = function(success_response, fail_response) {
    dropbox.getFolderContents(
      '',
      success_response,
      fail_response
    );
  };

  var get_saved_group = function(identifier, success_response, fail_response) {
    get_json(identifier, success_response, fail_response);
  };

  var save_tabs =  function(identifier, tabs, success_response, fail_response) {};

  var get_json = function(filename, success, failure) {
    dropbox.getFile(
      filename,
      function(data) {
        parsed_data = JSON.parse(data);
        success(filename, parsed_data);
      },
      function(error) {
        failure(filename, error);
      }
    );
  };

  return {
    'get_saved_tabs_list': get_saved_tabs_list,
    'get_saved_group': get_saved_group,
    'save_tabs': save_tabs
  };
}();
