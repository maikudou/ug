export interface BrowserAPI {
  sendMessage: <T, R>(message: T) => Promise<R> | undefined
  sendCSMessage: <T>(tabId: number, message: T) => void
  listenToMessage: <R, T = never>(
    callback: (request: R, sendResponse?: (message: T) => void) => void
  ) => void
}
