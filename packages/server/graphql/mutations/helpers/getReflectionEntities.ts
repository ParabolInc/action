import sanitizeAnalyzedEntitiesResponse from './autoGroup/sanitizeAnalyzedEntititesResponse'
import addLemmaToEntities from './autoGroup/addLemmaToEntities'
import sendToSentry from '../../../utils/sendToSentry'
import getGoogleLanguageManager from '../../../getGoogleLanguageManager'
import {GoogleErrorResponse} from '../../../GoogleLanguageManager'

const manageErrorResponse = <T>(res: T) => {
  if (Array.isArray(res)) {
    const [firstError] = res
    if (firstError) {
      const {error} = firstError
      if (error) {
        const {message} = error
        const re = /language \S+ is not supported/
        if (!re.test(message)) {
          sendToSentry(new Error(`Grouping Error: Google NLP: ${message}`))
        }
      }
    }
    return null
  }
  return res as T extends GoogleErrorResponse ? never : T
}

const getReflectionEntities = async (plaintextContent: string) => {
  if (!plaintextContent) return []
  // If Google NLP is disabled, just return the first 3 words of the reflection
  if (process.env.DISABLE_GOOGLE_NLP === 'true') {
    return plaintextContent
      .split(' ')
      .slice(0, 3)
      .join(' ')
  }
  const manager = getGoogleLanguageManager()
  const res = await Promise.all([
    manager.analyzeEntities(plaintextContent),
    manager.analyzeSyntax(plaintextContent)
  ])
  const reflectionResponse = manageErrorResponse(res[0])
  const reflectionSyntax = manageErrorResponse(res[1])
  // for each entity, look in the tokens array to first the first word of the entity
  // for each word in the entity, make sure that the next token points to it, else continue, return entity starting index
  // take the lemma of the last word and recompute the entity based on that lemma
  // run a distance matrix on the lemma
  // sanitize reflection responses, nulling out anything without a full response tree
  const sanitizedReflectionResponse = sanitizeAnalyzedEntitiesResponse(reflectionResponse)
  if (!sanitizedReflectionResponse) return []
  return addLemmaToEntities(sanitizedReflectionResponse, reflectionSyntax)
}

export default getReflectionEntities
