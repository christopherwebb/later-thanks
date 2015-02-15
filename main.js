// chrome.extension.onRequest.addListener(tab_monitor.request_received);

var ang_app = angular.module('linkArchiverApp', []);
tab_current_control(ang_app);
tab_saved_control(ang_app);

document.addEventListener("DOMContentLoaded", function() {
  var tab_query = new Object();
  // chrome.tabs.query(tab_query, tab_monitor.get_tabs);  

  // tab_monitor.load_event();
});
