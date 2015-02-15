oauth_success_listener = {
	request_received: function (request, sender, sendResponse)
  {
    if (request.oauth_status === 'user permission granted')
    {
      console.log("OAuth user permission granted")
      dropbox.setup();
    }
  }
}
