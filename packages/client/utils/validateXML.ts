import jsdom from 'jsdom'

const validateXML = (possiblyXML: string): {error?: string} => {
  try {
    new jsdom.JSDOM(possiblyXML, {contentType: 'text/xml'})
  } catch(e) {
    return { error: e.message }
  }
  return {}
}

export default validateXML