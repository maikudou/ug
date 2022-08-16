export interface BrowserAPI {
  sendMessage: <T, R>(message: T) => Promise<R>
  listenToMessage: <R, T = never>(
    callback: (request: R, sendResponse: (message: T) => void) => void
  ) => void
}
