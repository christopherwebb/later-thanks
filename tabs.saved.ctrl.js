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
          'id': entry['path'],
          'show_loaded_tabs': false,
          'loaded_tabs': []
        };
    };

    archiver.get_saved_tabs_list(
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

    var load_saved_group = function(entry) {
      archiver.get_saved_group(
        entry.path,
        function (filename, data) {
          entry.loaded_tabs = [];

          for(var iter_1 = 0, tab_group; tab_group = data['tabs'][iter_1]; iter_1++) {
            for(var iter_2 = 0, tab; tab = tab_group['tabs'][iter_2]; iter_2++) {
              entry.loaded_tabs.push({
                'tab_title': tab.title,
                'url': tab.url
              });
            }
          }

          $scope.$apply();
        },
        function (filename,error) {
          console.log('Unable to get file: ' + filename + 'due to: ' + error);
        }
      );
    };

    $scope.saved_group_clicked = function(tab_id) {
      for (var iter = 0, entry; entry = $scope.saved_tabs[iter]; iter++) {
        if (entry.id === tab_id) {
          if (entry.show_loaded_tabs === false) {
            load_saved_group(entry);
          }

          entry.show_loaded_tabs = !entry.show_loaded_tabs;
          $scope.$apply();
          break;
        }
      }
    };

    $scope.mark_saved_url_as_read_clicked = function(tab_id, url) {
      for (var iter = 0, entry; entry = $scope.saved_tabs[iter]; iter++) {
        if (entry.id === tab_id) {
          break;
        }
      }
    };

  });
};
