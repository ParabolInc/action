import {parseAddressList, parseOneAddress} from 'email-addresses'

const getLastEmailIndex = (str: string) => Math.max(str.lastIndexOf(' '), str.lastIndexOf(','), 0)

const removeLastEmail = (str: string) => {
  const lastEmailIndex = getLastEmailIndex(str)
  return (
    str
      .slice(0, lastEmailIndex)
      // remove trailing commas
      .replace(/,$/g, '')
  )
}

const getFormattedStr = (
  commaDelimStr: string,
  isAddingNewEmail: boolean,
  isOutlookFormat: boolean
) => {
  if (isOutlookFormat) {
    const commaDelimArr = commaDelimStr.split(',')
    const outlookStr = commaDelimArr
      // remove everything that's not an email, e.g. names
      // keep the last item as removeLastEmail handles this if isAddingNewEmail is true
      .filter((str, idx) => {
        return idx === commaDelimArr.length - 1 || str.includes('@')
      })
      .join(',')
    if (isAddingNewEmail) {
      return removeLastEmail(outlookStr)
    }
    return outlookStr
  } else if (isAddingNewEmail) {
    return removeLastEmail(commaDelimStr)
  }
  return commaDelimStr
}

const parseEmailAddressList = (rawStr = ''): {parsedInvitees: any; invalidEmailExists: boolean} => {
  // this breaks RFC5322 standards, but people are not standard :-(
  const commaDelimStr = rawStr
    // replace line breaks, semi colons, greater than and less than signs with commas
    .replace(/(?:\r\n|\r|\n|;|<|>)/g, ',')
    // if the above created 2 commas (like a , + linebreak), remove dupes
    .replace(/,+/g, ',')
    // remove leading/trailing whitespace
    .trim()
    // remove trailing commas
    .replace(/,$/g, '')

  const emailCount = commaDelimStr.split(',').length
  const lastEmailIndex = getLastEmailIndex(commaDelimStr)
  const lastEmail = commaDelimStr.slice(lastEmailIndex, commaDelimStr.length)
  const lastChar = rawStr.charAt(rawStr.length - 1)
  const isAddingNewEmail = lastChar !== ' ' && lastChar !== ',' && !parseOneAddress(lastEmail)

  if (emailCount === 1 && isAddingNewEmail) {
    return {
      parsedInvitees: parseAddressList(commaDelimStr),
      invalidEmailExists: false
    }
  }

  const lessThanIndex = rawStr.indexOf('<')
  const greaterThanIndex = rawStr.indexOf('>')
  const isOutlookFormat =
    0 <= lessThanIndex &&
    lessThanIndex < greaterThanIndex &&
    rawStr.substring(lessThanIndex + 1, greaterThanIndex).includes('@') // if includes email in format <dave@email.com>
  const formattedStr = getFormattedStr(commaDelimStr, isAddingNewEmail, isOutlookFormat)
  const parsedInvitees = parseAddressList(formattedStr) // returns null if list is invalid

  if (parsedInvitees) {
    return {
      parsedInvitees,
      invalidEmailExists: false
    }
  }
  // check if there's a valid email in the invalid list
  else {
    const invalidEmailsArr = formattedStr.split(',')
    for (let i = invalidEmailsArr.length - 1; i >= 0; i--) {
      const slicedEmails = invalidEmailsArr.slice(0, i).join(',')
      const parsedSlicedInvitees = parseAddressList(slicedEmails)
      if (parsedSlicedInvitees) {
        return {
          parsedInvitees: parsedSlicedInvitees,
          invalidEmailExists: true
        }
      }
    }
    return {
      parsedInvitees,
      invalidEmailExists: true
    }
  }
}

export default parseEmailAddressList
