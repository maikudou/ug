import { BGFile, BGToPopupMessage, PopupToBGMessage, BGToCSMessage, CSToBGMessage } from '../types'

import { bgFilesToDownloadableFilesSerialized } from '../common/bg'

import { ChromeBrowserAPI } from './browserAPI'
const browserAPI = new ChromeBrowserAPI()
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

function checkReady(requestId: string) {
  const file = files.get(requestId)
  if (file && file.finished && file.name) {
    try {
      sendBGToPopupMessage({
        type: 'files',
        files: bgFilesToDownloadableFilesSerialized(files)
      })?.catch(_ => {})
    } catch (_) {}
  }
}

// New player, has referer
chrome.webRequest.onSendHeaders.addListener(
  event => {
    if (urlToRequestId.has(event.url)) {
      return
    }
    urlToRequestId.set(event.url, event.requestId)
    const header =
      event.requestHeaders && event.requestHeaders.find(({ name }) => name == 'Referer')?.value

    const result = /tabs\.ultimate-guitar\.com\/tab\/([^\\]+)\/(.+)-\d+$/.exec(header || '')
    if (result) {
      const [_, author, name] = result
      updateFile(event.requestId, {
        name: `${author} - ${name.replace(/\-/g, ' ')}.gp`,
        url: event.url
      })
      sendBGToCSMessage(event.tabId, {
        type: 'fileRequest',
        requestId: event.requestId,
        url: event.url
      })
    }
  },
  {
    urls: ['*://tabs.ultimate-guitar.com/tab/download/file*']
  },
  ['requestHeaders', 'extraHeaders']
)
// Old player, has filename
chrome.webRequest.onResponseStarted.addListener(
  event => {
    if (urlToRequestId.has(event.url)) {
      return
    }
    urlToRequestId.set(event.url, event.requestId)

    const header =
      event.responseHeaders &&
      event.responseHeaders.find(({ name }) => name == 'content-disposition')?.value

    if (header) {
      // For "old" player they have content-disposition header
      // what has filename in it
      const filename = /filename=\"(.+)\";/.exec(header)?.[1]
      updateFile(event.requestId, {
        name: filename,
        url: event.url
      })
      sendBGToCSMessage(event.tabId, {
        type: 'fileRequest',
        requestId: event.requestId,
        url: event.url
      })
    }
  },
  {
    urls: ['*://tabs.ultimate-guitar.com/download*']
  },
  ['responseHeaders']
)

// Listen for popup messages
browserAPI.listenToMessage<PopupToBGMessage>(request => {
  switch (request.type) {
    case 'ready':
      sendBGToPopupMessage({
        type: 'files',
        files: bgFilesToDownloadableFilesSerialized(files)
      })
      break
    case 'removeByUrl':
      removeFileByUrl(request.url)
      break
  }
})
// Listen for cs messages
browserAPI.listenToMessage<CSToBGMessage>(request => {
  switch (request.type) {
    case 'fileResponse':
      const data = new Uint8Array(request.data)
      updateFile(request.requestId, {
        finished: true,
        data: data.buffer
      })
      checkReady(request.requestId)
      break
  }
})
