import { BrowserAPI } from '../common/browserAPI'
export class FirefoxBrowserAPI implements BrowserAPI {
  sendMessage<T, R>(message: T): Promise<R> {
    return browser.runtime.sendMessage(message) as Promise<R>
  }
  listenToMessage<R, T = never>(
    callback: (request: R, sendResponse: (message: T) => void) => void
  ) {
    browser.runtime.onMessage.addListener((request, _sender, sendResponse) => {
      callback(request as R, sendResponse as (message: T) => void)
    })
  }
}
