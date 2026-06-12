import { Filesystem, Directory } from '@capacitor/filesystem'

export function useFilesystem() {
  async function saveAudioFile(themeId: string, data: Uint8Array): Promise<string> {
    const path = `themes/${themeId}.mp3`
    await Filesystem.writeFile({
      path,
      data: uint8ArrayToBase64(data),
      directory: Directory.Data,
      recursive: true,
    })
    return path
  }

  async function deleteAudioFile(path: string): Promise<void> {
    try {
      await Filesystem.deleteFile({ path, directory: Directory.Data })
    } catch {
      // File may not exist — ignore
    }
  }

  async function getAudioFileUri(path: string): Promise<string> {
    const result = await Filesystem.getUri({ path, directory: Directory.Data })
    return result.uri
  }

  return { saveAudioFile, deleteAudioFile, getAudioFileUri }
}

function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = ''
  const chunkSize = 8192
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize))
  }
  return btoa(binary)
}
