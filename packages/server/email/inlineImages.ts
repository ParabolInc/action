import cheerio from 'cheerio'
import fs from 'fs'
import fetch from 'node-fetch'
import path from 'path'
import {promisify} from 'util'
import generateUID from '../generateUID'

const readFile = promisify(fs.readFile)

const getFile = async (pathname: string) => {
  const isRelative = pathname.startsWith('/')
  let data: Buffer
  if (isRelative) {
    const fullpath = path.join(__dirname, '../../../', pathname)
    try {
      data = await readFile(fullpath)
    } catch (e) {
      return null
    }
  } else {
    try {
      const res = await fetch(pathname)
      if (res.status !== 200) return null
      data = await res.buffer()
    } catch (e) {
      return null
    }
  }

  if (!data) {
    return null
  }
  return data
}

const inlineImages = async (html: string) => {
  if (!html) {
    throw new Error('No html provided for email')
  }
  const cidDict = {}

  const $ = cheerio.load(html)
  $('body')
    .find('img')
    .each((_i, img) => {
      const pathname = $(img).attr('src')
      if (!pathname) return
      cidDict[pathname] = cidDict[pathname] || generateUID() + path.extname(pathname)
      $(img).attr('src', `cid:${cidDict[pathname]}`)
    })
  const uniquePathnames = Object.keys(cidDict)
  const files = await Promise.all(uniquePathnames.map(getFile))
  const options = files.map((data, idx) => {
    if (!data) return null
    const pathname = uniquePathnames[idx]
    const filename = cidDict[pathname]
    return {data, filename}
  })
  const attachmentOptions = options.filter(Boolean)
  return {
    html: $.html(),
    attachmentOptions
  }
}

export default inlineImages
