import {
  PopupFile,
  BGFile,
  DownloadableFile,
  DownloadableFileSerialized,
  isDownloadbleFile,
  PopupToBGMessage,
  BGToPopupMessage
} from '../types'
import { BrowserAPI } from './browserAPI'

export class Popup {
  private readonly _popupFiles = new Map<string, PopupFile>()

  private _sendMessage(message: PopupToBGMessage) {
    return this._browserAPI.sendMessage<PopupToBGMessage, BGToPopupMessage>(message)
  }

  private remove(url: string) {
    const entry = this._popupFiles.get(url)
    if (entry) {
      entry.element.parentNode?.removeChild(entry.element)
      this._popupFiles.delete(url)
    }
    this._sendMessage({ type: 'removeByUrl', url })
  }

  private removeAll() {
    for (const { element, file } of this._popupFiles.values()) {
      element.parentNode?.removeChild(element)
      this._sendMessage({ type: 'removeByUrl', url: file.url })
    }
    this._popupFiles.clear()
    this.updateFiles(new Map())
  }

  private updateFiles(files: Map<string, BGFile>) {
    document.getElementById('content')!.innerHTML = ''
    const uniqueFiles = Array.from(files.values()).reduce((acc, file) => {
      if (isDownloadbleFile(file)) {
        acc.set(file.url, file)
      }
      return acc
    }, new Map<string, DownloadableFile>())
    if (uniqueFiles.size) {
      const clearAll = document.createElement('span')
      clearAll.addEventListener('click', () => this.removeAll())
      clearAll.innerText = 'clear'
      clearAll.className = 'clear'
      document.getElementById('content')!.appendChild(clearAll)
    }
    Array.from(uniqueFiles.values()).forEach(file => {
      const blob = new Blob([file.data], { type: 'application/octet-stream' })
      const objectURL = URL.createObjectURL(blob)

      const link = document.createElement('a')
      const cross = document.createElement('span')
      cross.addEventListener('click', () => this.remove(file.url))
      cross.innerText = '🞨'
      cross.className = 'cross'
      const space = document.createTextNode(' ')

      const div = document.createElement('div')
      div.appendChild(cross)
      div.appendChild(space)
      div.appendChild(link)

      document.getElementById('content')!.appendChild(div)

      link.href = objectURL
      link.download = file.name
      link.innerHTML = file.name

      this._popupFiles.set(file.url, {
        file,
        element: div
      })
    })
  }
  constructor(private readonly _browserAPI: BrowserAPI) {
    _browserAPI.listenToMessage<BGToPopupMessage>(event => {
      if (event.type == 'files') {
        this.updateFiles(
          event.files.reduce((acc, value) => {
            acc.set(value.id, {
              name: value.name,
              url: value.url,
              data: new Uint8Array(value.data).buffer,
              finished: value.finished
            })
            return acc
          }, new Map<string, BGFile>())
        )
      }
    })

    // Each time popup is opened,
    // signal BG page what popup is ready to get files, if any
    _browserAPI
      .sendMessage<PopupToBGMessage, BGToPopupMessage>({ type: 'ready' })
      ?.then(response => {
        this.updateFiles(
          response.files.reduce((acc, value) => {
            acc.set(value.id, {
              name: value.name,
              url: value.url,
              data: new Uint8Array(value.data).buffer,
              finished: value.finished
            })
            return acc
          }, new Map<string, BGFile>())
        )
      })
  }
}
