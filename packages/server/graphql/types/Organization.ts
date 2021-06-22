import {
  GraphQLBoolean,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString
} from 'graphql'
import {getUserId, isSuperUser, isUserBillingLeader} from '../../utils/authorization'
import {GQLContext} from '../graphql'
import {resolveForBillingLeaders} from '../resolvers'
import Company from './Company'
import CreditCard from './CreditCard'
import GraphQLISO8601Type from './GraphQLISO8601Type'
import GraphQLURLType from './GraphQLURLType'
import {OrganizationUserConnection} from './OrganizationUser'
import OrgUserCount from './OrgUserCount'
import Team from './Team'
import TierEnum from './TierEnum'
import User from './User'

const Organization = new GraphQLObjectType<any, GQLContext>({
  name: 'Organization',
  description: 'An organization',
  fields: () => ({
    id: {type: new GraphQLNonNull(GraphQLID), description: 'The unique organization ID'},
    activeDomain: {
      type: GraphQLString,
      description:
        'The top level domain this organization is linked to, null if only generic emails used'
    },
    isActiveDomainTouched: {
      type: GraphQLNonNull(GraphQLBoolean),
      description:
        'false if the activeDomain is null or was set automatically via a heuristic, true if set manually',
      resolve: ({isActiveDomainTouched}) => !!isActiveDomainTouched
    },
    createdAt: {
      type: new GraphQLNonNull(GraphQLISO8601Type),
      description: 'The datetime the organization was created'
    },
    creditCard: {
      type: CreditCard,
      description: 'The safe credit card details',
      resolve: resolveForBillingLeaders('creditCard')
    },
    company: {
      type: Company,
      description: 'The assumed company this organizaiton belongs to',
      resolve: async ({activeDomain}, _args, {authToken}) => {
        if (!activeDomain || !isSuperUser(authToken)) return null
        return {id: activeDomain}
      }
    },
    isBillingLeader: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'true if the viewer is the billing leader for the org',
      resolve: async ({id: orgId}, _args, {authToken, dataLoader}) => {
        const viewerId = getUserId(authToken)
        return isUserBillingLeader(viewerId, orgId, dataLoader)
      }
    },
    name: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The name of the organization'
    },
    picture: {
      type: GraphQLURLType,
      description: 'The org avatar'
    },
    teams: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(Team))),
      description: 'all the teams the viewer is on in the organization',
      resolve: async ({id: orgId}, _args, {authToken, dataLoader}) => {
        const allTeamsOnOrg = await dataLoader.get('teamsByOrgId').load(orgId)
        return isSuperUser(authToken)
          ? allTeamsOnOrg
          : allTeamsOnOrg.filter((team) => authToken.tms.includes(team.id))
      }
    },
    tier: {
      type: new GraphQLNonNull(TierEnum),
      description: 'The level of access to features on the parabol site'
    },
    periodEnd: {
      type: GraphQLISO8601Type,
      description: 'THe datetime the current billing cycle ends',
      resolve: resolveForBillingLeaders('periodEnd')
    },
    periodStart: {
      type: GraphQLISO8601Type,
      description: 'The datetime the current billing cycle starts',
      resolve: resolveForBillingLeaders('periodStart')
    },
    retroMeetingsOffered: {
      deprecationReason: 'Unlimited retros for all!',
      type: new GraphQLNonNull(GraphQLInt),
      description: 'The total number of retroMeetings given to the team'
    },
    retroMeetingsRemaining: {
      deprecationReason: 'Unlimited retros for all!',
      type: new GraphQLNonNull(GraphQLInt),
      description: 'Number of retro meetings that can be run (if not pro)'
    },
    showConversionModal: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'true if should show the org the conversion modal, else false',
      resolve: ({showConversionModal}) => !!showConversionModal
    },
    stripeId: {
      type: GraphQLID,
      description: 'The customerId from stripe',
      resolve: resolveForBillingLeaders('stripeId')
    },
    stripeSubscriptionId: {
      type: GraphQLID,
      description: 'The subscriptionId from stripe',
      resolve: resolveForBillingLeaders('stripeSubscriptionId')
    },
    upcomingInvoiceEmailSentAt: {
      type: GraphQLISO8601Type,
      description: 'The last upcoming invoice email that was sent, null if never sent'
    },
    updatedAt: {
      type: GraphQLISO8601Type,
      description: 'The datetime the organization was last updated'
    },
    organizationUsers: {
      args: {
        after: {
          type: GraphQLString
        },
        first: {
          type: GraphQLInt
        }
      },
      type: new GraphQLNonNull(OrganizationUserConnection),
      resolve: async ({id: orgId}, _args, {dataLoader}) => {
        const organizationUsers = await dataLoader.get('organizationUsersByOrgId').load(orgId)
        organizationUsers.sort((a, b) => (a.orgId > b.orgId ? 1 : -1))
        const edges = organizationUsers.map((node) => ({
          cursor: node.id,
          node
        }))
        // TODO implement pagination
        const firstEdge = edges[0]
        return {
          edges,
          pageInfo: {
            endCursor: firstEdge ? edges[edges.length - 1].cursor : null,
            hasNextPage: false
          }
        }
      }
    },
    orgUserCount: {
      type: new GraphQLNonNull(OrgUserCount),
      description: 'The count of active & inactive users',
      resolve: async ({id: orgId}, _args, {dataLoader}) => {
        const organizationUsers = await dataLoader.get('organizationUsersByOrgId').load(orgId)
        const inactiveUserCount = organizationUsers.filter(({inactive}) => inactive).length
        return {
          inactiveUserCount,
          activeUserCount: organizationUsers.length - inactiveUserCount
        }
      }
    },
    billingLeaders: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(User))),
      description: 'The leaders of the org',
      resolve: async ({id: orgId}, _args, {dataLoader}) => {
        const organizationUsers = await dataLoader.get('organizationUsersByOrgId').load(orgId)
        const billingLeaderUserIds = organizationUsers
          .filter((organizationUser) => organizationUser.role === 'BILLING_LEADER')
          .map(({userId}) => userId)
        return dataLoader.get('users').loadMany(billingLeaderUserIds)
      }
    }
  })
})

export default Organization
