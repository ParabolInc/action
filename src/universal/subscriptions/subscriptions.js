import {
  AGENDA,
  AGENDA_PROJECTS,
  ARCHIVED_PROJECTS,
  INTEGRATIONS,
  INVITATIONS,
  NOTIFICATIONS,
  ORG_APPROVALS,
  ORGANIZATION,
  ORGANIZATIONS,
  OWNED_ORGANIZATIONS,
  TEAM,
  TEAM_MEMBERS,
  PROJECTS,
  UPCOMING_INVOICE,
  USERS_BY_ORG
} from 'universal/subscriptions/constants';

// For now, use an array. In the future, we can make one exclusively for the server that doesn't need to reparse the AST
export default [
  {
    channel: AGENDA_PROJECTS,
    string: `
    subscription($agendaId: ID!) {
      agendaProjects(agendaId: $agendaId) {
        id
        agendaId
        content
        createdAt
        createdBy
        status
        tags
        teamMemberId
        updatedAt
      }
    }`
  },
  {
    channel: ARCHIVED_PROJECTS,
    string: `
    subscription($teamMemberId: ID!) {
      archivedProjects(teamMemberId: $teamMemberId) {
        content
        id
        status
        tags
        teamMemberId
        updatedAt
      }
    }`
  },
  {
    channel: AGENDA,
    string: `
    subscription($teamId: ID!) {
      agenda(teamId: $teamId) {
        id
        content
        isComplete
        sortOrder
        teamMemberId
      }
    }`
  },
  {
    channel: USERS_BY_ORG,
    string: `
    subscription($orgId: ID!) {
      usersByOrg(orgId: $orgId) {
        id
        isBillingLeader
        email
        inactive
        picture
        preferredName
      }
    }`
  },
  {
    channel: INTEGRATIONS,
    string: `
    subscription($teamMemberId: ID!) {
      integrations(teamMemberId: $teamMemberId) {
        id
        accessToken
        service
        userId,
        syncs {
          id
          slackChannelId
        }
      }
    }`
  },
  {
    channel: INVITATIONS,
    string: `
    subscription($teamId: ID!) {
      invitations(teamId: $teamId) {
        id
        email
        tokenExpiration
        updatedAt
      }
    }`
  },
  {
    channel: NOTIFICATIONS,
    string: `
    subscription($userId: ID!) {
      notifications(userId: $userId) {
        id
        orgId
        startAt
        type
        varList
      }
    }`
  },
  {
    channel: ORG_APPROVALS,
    string: `
    subscription($teamId: ID!) {
      orgApprovals(teamId: $teamId) {
        id
        createdAt
        email
      }
    }`
  },
  {
    channel: ORGANIZATION,
    string: `
    subscription($orgId: ID!) {
      organization(orgId: $orgId) {
        id
        activeUserCount
        createdAt
        creditCard {
          brand
          expiry
          last4
        }
        inactiveUserCount
        name
        periodEnd
        periodStart
        picture
      }
    }`
  },
  {
    channel: ORGANIZATIONS,
    string: `
    subscription($userId: ID!) {
      organizations(userId: $userId) {
        id
        name
      }
    }`
  },
  {
    channel: OWNED_ORGANIZATIONS,
    string: `
    subscription($userId: ID!) {
      ownedOrganizations(userId: $userId) {
        id
        activeUserCount
        inactiveUserCount
        name
        picture
      }
    }`
  },
  // {
  //   channel: PRESENCE,
  //   string: `
  //   subscription($teamId: ID!) {
  //     presence(teamId: $teamId) {
  //       id
  //       userId
  //       editing
  //     }
  //   }`
  // },
  {
    channel: PROJECTS,
    string: `
    subscription($teamMemberId: ID!) {
      projects(teamMemberId: $teamMemberId) {
        agendaId
        content
        createdAt
        createdBy
        id
        status
        tags
        teamMemberId
        title
        sortOrder
        updatedAt
      }
    }`
  },
  {
    channel: TEAM,
    string: `
    subscription($teamId: ID!) {
       team(teamId: $teamId) {
         checkInGreeting {
           content,
           language
         },
         checkInQuestion,
         id,
         isArchived,
         isPaid,
         name,
         meetingId,
         activeFacilitator,
         facilitatorPhase,
         facilitatorPhaseItem,
         meetingPhase,
         meetingPhaseItem
       }
    }`
  },
  {
    channel: TEAM_MEMBERS,
    string: `
    subscription($teamId: ID!) {
       teamMembers(teamId: $teamId) {
         id,
         checkInOrder,
         email,
         hideAgenda,
         isNotRemoved,
         isCheckedIn,
         isFacilitator,
         isLead,
         picture,
         preferredName
       }
    }`
  },
  {
    channel: UPCOMING_INVOICE,
    string: `
    subscription($orgId: ID!) {
      upcomingInvoice(orgId: $orgId) {
        id
        amountDue
        cursor
        endAt
        paidAt
        startAt
        status
      }
    }`
  },
  {
    channel: 'user',
    string: `
    subscription($userId: ID!) {
      user(userId: $userId) {
        id
        notificationFlags
      }
    }`
  }
];
