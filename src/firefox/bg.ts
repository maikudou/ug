import { BGFile, BGToPopupMessage, PopupToBGMessage, BGToCSMessage } from '../types'

import { bgFilesToDownloadableFilesSerialized } from '../common/bg'

import { FirefoxBrowserAPI } from './browserAPI'
const browserAPI = new FirefoxBrowserAPI()
const sendBGToPopupMessage = (message: BGToPopupMessage) => {
  return browserAPI.sendMessage<BGToPopupMessage, PopupToBGMessage>(message)
}
const sendBGToCSMessage = (tabId: number, message: BGToCSMessage) => {
  return browserAPI.sendCSMessage<BGToCSMessage>(tabId, message)
}

const files = new Map<string, BGFile>()
const urlToRequestId = new Map<string, string>()

function updateFile(requestId: string, data: Partial<BGFile>) {
  files.set(requestId, {
    data: new ArrayBuffer(0),
    finished: false,
    ...files.get(requestId),
    ...data
  })
}

function removeFileByUrl(url: string) {
  const requestId = urlToRequestId.get(url)
  if (requestId) {
    files.delete(requestId)
    urlToRequestId.delete(url)
  }
}

/*
 * Firefox can read requests bodies, so we can
 * store tab files to be downloaded later if needed
 */
function onBeforeRequestDataListener(details: browser.webRequest._OnBeforeRequestDetails) {
  let filter = browser.webRequest.filterResponseData(details.requestId)

  filter.onstart = _event => {
    updateFile(details.requestId, {
      data: new ArrayBuffer(0),
      finished: false
    })
  }

  filter.ondata = event => {
    const file = files.get(details.requestId)
    if (file) {
      const newData = new Uint8Array(file.data.byteLength + event.data.byteLength)
      newData.set(new Uint8Array(file.data), 0)
      newData.set(new Uint8Array(event.data), file.data.byteLength)
      file.data = newData.buffer
    }
    filter.write(event.data)
  }

  filter.onstop = _event => {
    updateFile(details.requestId, {
      finished: true
    })
    checkReady(details.requestId)
    filter.disconnect()
  }
}

function checkReady(requestId: string) {
  const file = files.get(requestId)
  if (file && file.finished && file.name) {
    try {
      sendBGToPopupMessage({
        type: 'files',
        files: bgFilesToDownloadableFilesSerialized(files)
      }).catch(_ => {})
    } catch (_) {}
  }
}

// Attach data processor for all requests what look like a tab file
browser.webRequest.onBeforeRequest.addListener(
  onBeforeRequestDataListener,
  {
    urls: ['*://tabs.ultimate-guitar.com/download*']
  },
  ['blocking']
)

browser.webRequest.onHeadersReceived.addListener(
  event => {
    try {
      if (event.statusCode !== 200) {
        return
      }
      const header =
        event.responseHeaders &&
        event.responseHeaders.find(({ name }) => name == 'content-disposition')?.value

      if (header) {
        // For "old" player they have content-disposition header
        // what has filename in it
        const filename = /filename=\"(.+)\";/.exec(header)?.[1]
        updateFile(event.requestId, { name: filename, url: event.url })
      } else {
        console.warn("Can't find filename", event)
      }

      urlToRequestId.set(event.url, event.requestId)
      checkReady(event.requestId)
    } catch (e) {
      console.error(e)
    }
  },
  {
    urls: ['*://tabs.ultimate-guitar.com/download*']
  },
  ['responseHeaders']
)

browser.webRequest.onBeforeSendHeaders.addListener(
  event => {
    ;(event.requestHeaders || []).forEach(header => {
      if (header.name === 'Cookie') {
        // Tell backend we are still in the old player
        header.value = header.value?.replace('ug_react_xtz_player=1', 'ug_react_xtz_player=4')
      }
    })
    return event
  },
  {
    urls: ['*://tabs.ultimate-guitar.com/download*']
  },
  ['blocking', 'requestHeaders']
)

// Listen for popup messages
browserAPI.listenToMessage<PopupToBGMessage, BGToPopupMessage>((request, sendResponse) => {
  switch (request.type) {
    case 'ready':
      sendResponse({ type: 'files', files: bgFilesToDownloadableFilesSerialized(files) })
      break
    case 'removeByUrl':
      removeFileByUrl(request.url)
      break
  }
})
