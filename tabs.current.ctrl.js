var tab_current_control = function (ang_app) {
  ang_app.controller('tab_current_controller', function ($scope) {
    $scope.current_tabs = [];

    var create_entry = function(tab) {
      return {
        'chrome_Id': tab.id,
        'title': tab.title,
        'icon': tab.favIconUrl
      };
    };

    var tab_query = new Object();
    chrome.tabs.query(tab_query, function get_tabs(result) {
      $scope.current_tabs = _.map(result, function(tab) { return create_entry(tab); });
      $scope.$apply();
    });

    var event_tab_update = function(tabId, changeInfo, tab) {
      if (changeInfo.url === undefined)
        return;

      var foundTab = false;
      for (var index = 0;index < $scope.current_tabs.length;index++) {
        if ($scope.current_tabs[index].chrome_Id == tabId) {
          foundTab = true;
          $scope.current_tabs[index].disp_title = tab.title;
          $scope.current_tabs[index].icon = tab.favIconUrl;
        }
      }

      if (!foundTab) {
        $scope.current_tabs.push(create_entry(tab));
      }

      $scope.$apply();
    };

    var event_tab_remove = function(tabId, removeInfo){
      $scope.current_tabs = _.filter($scope.current_tabs, function(tab) {
        return tabId != tab.id;
      });
      $scope.$apply();
    };

    chrome.tabs.onUpdated.addListener(event_tab_update);
    chrome.tabs.onRemoved.addListener(event_tab_remove);
  });
};
