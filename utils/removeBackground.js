let removeBackgroundModule = null

export async function removeBackground(file) {
  if (!removeBackgroundModule) {
    removeBackgroundModule = await import('@imgly/background-removal')
  }

  const blob = await removeBackgroundModule.removeBackground(file, {
    progress: (key, current, total) => {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('bgremove-progress', { detail: { key, current, total } }))
      }
    },
  })

  return blob
}

export function blobToFile(blob, fileName) {
  const ext = blob.type?.includes('png') ? 'png' : 'webp'
  const name = fileName.replace(/\.[^.]+$/, `.${ext}`)
  return new File([blob], name, { type: blob.type || 'image/png' })
}
