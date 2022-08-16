export interface BGFile {
  data: ArrayBuffer
  finished: boolean
  name?: string
  url?: string
}

export interface DownloadableFile {
  data: ArrayBuffer
  finished: boolean
  name: string
  url: string
}

export function isDownloadbleFile(file: BGFile): file is DownloadableFile {
  return !!file.name && !!file.url
}

export function isDownloadableFileEntry(
  entry: [string, BGFile]
): entry is [string, DownloadableFile] {
  return isDownloadbleFile(entry[1])
}

export interface PopupFile {
  element: HTMLElement
  file: DownloadableFile
}

interface BaseMessage {
  type: string
}

export interface PopupReadyMessage extends BaseMessage {
  type: 'ready'
}

export interface PopupRemoveFileMessage extends BaseMessage {
  type: 'removeByUrl'
  url: string
}

export type PopupToBGMessage = PopupReadyMessage | PopupRemoveFileMessage

export interface BGToPopupFilesMessage extends BaseMessage {
  type: 'files'
  files: Map<string, DownloadableFile>
}

export type BGToPopupMessage = BGToPopupFilesMessage
