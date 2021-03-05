console.log("BG inited")

const files = new Map()

function dataListener(details) {
  let filter = browser.webRequest.filterResponseData(details.requestId);

  filter.onstart = event => {
    files.set(details.requestId, {
      name: '',
      data: [],
      finished: false
    })
  }

  filter.ondata = event => {
    const file = files.get(details.requestId)
    if (file) {
      file.data.push(event.data)
    }
    filter.write(event.data);
  }

  filter.onstop = event => {
    const file = files.get(details.requestId)
    if (file) {
      file.finished = true
      checkReady(file)
    }
    filter.disconnect();
  }
}

function checkReady(file) {
  if(file.finished && file.name) {
    console.log("Ready", file)
    try {
      browser.runtime.sendMessage({type: 'files', files})
    } catch (_) {}
  }
}

browser.webRequest.onBeforeRequest.addListener(
  dataListener,
  {urls: ["*://tabs.ultimate-guitar.com/download*"]},
  ["blocking"]
);

browser.webRequest.onHeadersReceived.addListener(
  (event) => {
    console.log(event)
    try {
      const regexp = /filename=\"(.+)\";/
      const header = event.responseHeaders.filter(({name}) => name == 'content-disposition')[0].value
      const filename = regexp.exec(header)[1]

      const file = files.get(event.requestId)
      if (file) {
        file.name = filename
        checkReady(file)
      }
    } catch (e) {
      console.log(e)
    }
  },
  {urls: ["*://tabs.ultimate-guitar.com/download*"]},
  ['responseHeaders']
)

browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log(request)
  if (request.type == 'ready') {
    sendResponse({files})
  }
});