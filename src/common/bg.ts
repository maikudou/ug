import {
  BGFile,
  isDownloadableFileEntry,
  DownloadableFile,
  DownloadableFileSerialized
} from '../types'

export function bgFilesToDownloadableFiles(
  files: Map<string, BGFile>
): Map<string, DownloadableFile> {
  return new Map(Array.from(files.entries()).filter(isDownloadableFileEntry))
}

export function bgFilesToDownloadableFilesSerialized(
  files: Map<string, BGFile>
): DownloadableFileSerialized[] {
  return Array.from(bgFilesToDownloadableFiles(files).entries()).map(([id, value]) => {
    return { ...value, data: Array.from(new Uint8Array(value.data)), id }
  })
}
