import {GraphQLID} from 'graphql'
import {requireSU} from '../../../utils/authorization'
import getDomainFromEmail from '../../../utils/getDomainFromEmail'
import isCompanyDomain from '../../../utils/isCompanyDomain'
import Company from '../../types/Company'

const company = {
  type: Company,
  args: {
    domain: {
      type: GraphQLID,
      description: 'the top level doamin for a company (e.g. parabol.co)'
    },
    userId: {
      type: GraphQLID,
      description: 'if domain is not provided, the userId that belongs to the company'
    }
  },
  description: 'All the info about a specific company',
  async resolve(_source, {domain, userId}, {authToken, dataLoader}) {
    requireSU(authToken)
    if (domain) return {id: domain}
    const user = await dataLoader.get('users').load(userId)
    if (!user) throw new Error('User not found')
    const {email} = user
    const userDomain = getDomainFromEmail(email)
    if (!isCompanyDomain(userDomain)) return null
    return {id: userDomain}
  }
}

export default company
