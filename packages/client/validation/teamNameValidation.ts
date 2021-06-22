import linkify from '../utils/linkify'
import Legitity from './Legitity'

const teamNameValidation = (rawTeamName: string, teamNames: string[]) => {
  return new Legitity(rawTeamName)
    .trim()
    .required('“The nameless wonder” is better than nothing')
    .min(2, 'The “A Team” had a longer name than that')
    .max(50, 'That isn’t very memorable. Maybe shorten it up?')
    .test((val) => (teamNames.includes(val) ? 'That name is already taken' : undefined))
    .test((val) => (linkify.match(val) ? 'Try using a name, not a link!' : undefined))
}

export default teamNameValidation
