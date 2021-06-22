const jpgWithoutEXIF = (file: File) => {
  return new Promise<Blob>((resolve) => {
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')!
    const img = new Image()
    img.onload = () => {
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      context.drawImage(img, 0, 0, canvas.width, canvas.height)
      canvas.toBlob(
        (blob) => {
          resolve(blob!)
        },
        'image/jpeg',
        0.75
      )
    }
    img.src = URL.createObjectURL(file)
  })
}

export default jpgWithoutEXIF
