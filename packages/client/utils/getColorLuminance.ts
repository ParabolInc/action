const getColorLuminance = (rawHex: string, lum: number) => {
  const hex = rawHex.slice(1)
  let rgb = "#"
  for (let i = 0; i < 3; i++) {
    const partial = parseInt(hex.substr(i * 2, 2), 16)
    const color = Math.round(Math.min(Math.max(0, partial + (partial * lum)), 255)).toString(16)
    rgb += ("00" + color).substr(color.length)
  }
  return rgb
}

export default getColorLuminance
