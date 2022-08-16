// TODO: stub
chrome.webRequest.onResponseStarted.addListener(
  event => {
    console.log(event)
  },
  {
    urls: [
      '*://tabs.ultimate-guitar.com/download*',
      '*://tabs.ultimate-guitar.com/tab/download/file*'
    ]
  },
  ['responseHeaders']
)
