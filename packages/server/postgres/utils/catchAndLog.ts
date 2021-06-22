import sendToSentry from '../../utils/sendToSentry'

const catchAndLog = async (riskyFn: (...args: any[]) => Promise<any>): Promise<any> => {
  try {
    return await riskyFn()
  } catch (e) {
    sendToSentry(e, {tags: {migration: 'postgres'}})
  }
  return null
}

export default catchAndLog
