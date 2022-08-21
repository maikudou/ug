import { BrowserAPI } from '../common/browserAPI'
export class ChromeBrowserAPI implements BrowserAPI {
  sendMessage<T, R>(message: T): Promise<R> | undefined {
    return chrome.runtime.sendMessage<T, R>(message) as Promise<R> | undefined
  }
  sendCSMessage<T>(tabId: number, message: T): void {
    chrome.tabs.sendMessage(tabId, message)
  }
  listenToMessage<R>(callback: (request: R) => void) {
    chrome.runtime.onMessage.addListener((request, _sender) => {
      callback(request as R)
    })
  }
}
