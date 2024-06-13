chrome.action.onClicked.addListener(() => {
    chrome.windows.create({
      url: chrome.runtime.getURL('player.html'),
      type: 'popup',
      width: 350,
      height: 500
    });
  });
  