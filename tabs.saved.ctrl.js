var tab_saved_control = function (ang_app) {
  ang_app.controller('tab_saved_controller', function ($scope) {
    $scope.saved_tabs = [];

    var create_saved_entry = function(entry) {
      var search_exp = new RegExp('[A-Za-z0-9 -]+.json$');
        var extracted;
        if (!(extracted = search_exp.exec(entry['path'])))
        {
          return null;
        }

        return {
          'path': entry['path'],
          'show_loaded_tabs': false
        };
    };

    dropbox.getFolderContents(
      '',
      function (data) {
        processed_files = [];
        for (var iter = 0, entry; entry = data['contents'][iter]; iter++) {
          if (!entry['is_dir']) {
            processed_files.push(create_saved_entry(entry));
          }
        }

        $scope.saved_tabs = _.compact(processed_files);
        $scope.$apply();
      },
      function (error) {
        console.log('Error accessing folder contents.');
      }
    );

  });
};
