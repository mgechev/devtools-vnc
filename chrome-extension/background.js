chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.type === 'tab-url') {
    chrome.tabs.query({
      active: true,
      currentWindow: true
    }, function (tab) {
      tab = tab[0];
      sendResponse(tab.url);
    });
  }
  return true;
});