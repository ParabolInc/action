import getRethink from '../../../database/rethinkDriver'
import AuthToken from '../../../database/types/AuthToken'
import SuggestedActionCreateNewTeam from '../../../database/types/SuggestedActionCreateNewTeam'
import SuggestedActionInviteYourTeam from '../../../database/types/SuggestedActionInviteYourTeam'
import SuggestedActionTryTheDemo from '../../../database/types/SuggestedActionTryTheDemo'
import TimelineEventJoinedParabol from '../../../database/types/TimelineEventJoinedParabol'
import User from '../../../database/types/User'
import generateUID from '../../../generateUID'
import segmentIo from '../../../utils/segmentIo'
import addSeedTasks from './addSeedTasks'
import createNewOrg from './createNewOrg'
import createTeamAndLeader from './createTeamAndLeader'
import insertUser from '../../../postgres/queries/insertUser'

// no waiting necessary, it's just analytics
const handleSegment = async (user: User, isInvited: boolean) => {
  const {id: userId, createdAt, email, segmentId, picture, preferredName} = user
  segmentIo.identify({
    userId,
    traits: {
      avatar: picture,
      createdAt,
      email,
      name: preferredName
    },
    anonymousId: segmentId
  })
  segmentIo.track({
    userId,
    event: 'Account Created',
    properties: {
      isInvited,
      // properties below required for Google Analytics destination
      category: 'All',
      label: 'isInvited',
      value: isInvited ? 1 : 0
    }
  })
}

const bootstrapNewUser = async (newUser: User, isOrganic: boolean) => {
  const {id: userId, preferredName, email} = newUser
  const r = await getRethink()
  const joinEvent = new TimelineEventJoinedParabol({userId})

  await Promise.all([
    r({
      user: r.table('User').insert(newUser),
      event: r.table('TimelineEvent').insert(joinEvent)
    }).run(),
    insertUser(newUser)
  ])

  const tms = [] as string[]
  if (isOrganic) {
    const orgId = generateUID()
    const teamId = generateUID()
    tms.push(teamId) // MUTATIVE
    const validNewTeam = {
      id: teamId,
      orgId,
      name: `${preferredName}’s Team`,
      isOnboardTeam: true
    }
    const orgName = `${newUser.preferredName}’s Org`
    await createNewOrg(orgId, orgName, userId, email)
    await Promise.all([
      createTeamAndLeader(userId, validNewTeam),
      addSeedTasks(userId, teamId),
      r
        .table('SuggestedAction')
        .insert(new SuggestedActionInviteYourTeam({userId, teamId}))
        .run()
    ])
    segmentIo.track({
      userId,
      event: 'New Org',
      properties: {
        teamId,
        orgId,
        fromSignup: true
      }
    })
  } else {
    await r
      .table('SuggestedAction')
      .insert([new SuggestedActionTryTheDemo({userId}), new SuggestedActionCreateNewTeam({userId})])
      .run()
  }
  handleSegment(newUser, !isOrganic).catch()

  return new AuthToken({sub: userId, tms})
}

export default bootstrapNewUser
