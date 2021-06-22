import {R} from 'rethinkdb-ts'

const createdAt = new Date('2016-06-01')

const aGhostUser = {
  id: 'aGhostUser',
  preferredName: 'A Ghost',
  connectedSockets: [],
  email: 'love@parabol.co',
  featureFlags: [],
  updatedAt: createdAt,
  picture:
    'https://action-files.parabol.co/production/build/v5.10.1/42342faa774f05b7626fa91ff8374e59.svg',
  inactive: false,
  identities: [],
  createdAt,
  tier: 'enterprise',
  tms: 'aGhostTeam'
}

const aGhostOrg = {
  id: 'aGhostOrg',
  name: 'Parabol',
  picture:
    'https://action-files.parabol.co/production/build/v5.10.1/42342faa774f05b7626fa91ff8374e59.svg',
  tier: 'enterprise',
  createdAt,
  updatedAt: createdAt
}
const aGhostTeam = {
  id: 'aGhostTeam',
  name: 'Parabol',
  createdAt,
  createdBy: 'aGhostUser',
  isArchived: false,
  isPaid: true,
  tier: 'enterprise',
  orgId: 'aGhostOrg',
  isOnboardTeam: true,
  updatedAt: createdAt
}

const aGhostOrgMember = {
  id: 'aGhostOrganizationUser',
  inactive: false,
  joinedAt: createdAt,
  newUserUntil: createdAt,
  orgId: 'aGhostOrg',
  removedAt: null,
  role: 'BILLING_LEADER',
  userId: 'aGhostUser'
}

const templates = [
  {
    createdAt: createdAt,
    id: 'sailboatTemplate',
    isActive: true,
    name: 'Sailboat',
    teamId: 'aGhostTeam',
    updatedAt: createdAt,
    scope: 'PUBLIC',
    orgId: 'aGhostOrg'
  },
  {
    createdAt: createdAt,
    id: 'startStopContinueTemplate',
    isActive: true,
    name: 'Start, Stop, Continue',
    teamId: 'aGhostTeam',
    updatedAt: createdAt,
    scope: 'PUBLIC',
    orgId: 'aGhostOrg'
  },
  {
    createdAt: createdAt,
    id: 'workingStuckTemplate',
    isActive: true,
    name: 'Working & Stuck',
    teamId: 'aGhostTeam',
    updatedAt: createdAt,
    scope: 'PUBLIC',
    orgId: 'aGhostOrg'
  },
  {
    createdAt: createdAt,
    id: 'fourLsTemplate',
    isActive: true,
    name: 'Four L’s',
    teamId: 'aGhostTeam',
    updatedAt: createdAt,
    scope: 'PUBLIC',
    orgId: 'aGhostOrg'
  },
  {
    createdAt: createdAt,
    id: 'gladSadMadTemplate',
    isActive: true,
    name: 'Glad, Sad, Mad',
    teamId: 'aGhostTeam',
    updatedAt: createdAt,
    scope: 'PUBLIC',
    orgId: 'aGhostOrg'
  }
]

const phaseItems = [
  {
    createdAt: createdAt,
    description: 'What did you learn?',
    groupColor: '#5CA0E5',
    id: 'promptWhatLearn',
    isActive: true,
    phaseItemType: 'retroPhaseItem',
    question: 'Learned',
    sortOrder: 1,
    teamId: 'aGhostTeam',
    templateId: 'fourLsTemplate',
    title: 'Learned',
    updatedAt: createdAt
  },
  {
    createdAt: createdAt,
    description: 'What was missing?',
    groupColor: '#E59545',
    id: 'promptWhatMissing',
    isActive: true,
    phaseItemType: 'retroPhaseItem',
    question: 'Lacked',
    sortOrder: 2,
    teamId: 'aGhostTeam',
    templateId: 'fourLsTemplate',
    title: 'Lacked',
    updatedAt: createdAt
  },
  {
    createdAt: createdAt,
    description: 'What’s slowing the team down in your journey?',
    groupColor: '#D9D916',
    id: 'promptWhatSlowing',
    isActive: true,
    phaseItemType: 'retroPhaseItem',
    question: 'Anchors',
    sortOrder: 1,
    teamId: 'aGhostTeam',
    templateId: 'sailboatTemplate',
    title: 'Anchors',
    updatedAt: createdAt
  },
  {
    createdAt: createdAt,
    description: 'What are you happy about?',
    groupColor: '#52CC52',
    id: 'promptWhatHappy',
    isActive: true,
    phaseItemType: 'retroPhaseItem',
    question: 'Glad',
    sortOrder: 0,
    teamId: 'aGhostTeam',
    templateId: 'gladSadMadTemplate',
    title: 'Glad',
    updatedAt: createdAt
  },
  {
    createdAt: createdAt,
    description: 'What are you angry or disappointed about?',
    groupColor: '#E55C5C',
    id: 'promptWhatAngry',
    isActive: true,
    phaseItemType: 'retroPhaseItem',
    question: 'Mad',
    sortOrder: 2,
    teamId: 'aGhostTeam',
    templateId: 'gladSadMadTemplate',
    title: 'Mad',
    updatedAt: createdAt
  },
  {
    createdAt: createdAt,
    description: 'What could be improved?',
    groupColor: '#D9D916',
    id: 'promptWhatImproved',
    isActive: true,
    phaseItemType: 'retroPhaseItem',
    question: 'Sad',
    sortOrder: 1,
    teamId: 'aGhostTeam',
    templateId: 'gladSadMadTemplate',
    title: 'Sad',
    updatedAt: createdAt
  },
  {
    createdAt: createdAt,
    description: 'What current behaviors should we keep doing?',
    groupColor: '#D9D916',
    id: 'promptWhatKeep',
    isActive: true,
    phaseItemType: 'retroPhaseItem',
    question: 'Continue',
    sortOrder: 2,
    teamId: 'aGhostTeam',
    templateId: 'startStopContinueTemplate',
    title: 'Continue',
    updatedAt: createdAt
  },
  {
    createdAt: createdAt,
    description: 'What’s helping us make progress toward our goals?',
    groupColor: '#52CC52',
    id: 'promptWhatHelps',
    isActive: true,
    phaseItemType: 'retroPhaseItem',
    question: 'What’s working?',
    sortOrder: 0,
    teamId: 'aGhostTeam',
    templateId: 'workingStuckTemplate',
    title: 'Positive',
    updatedAt: createdAt
  },
  {
    createdAt: createdAt,
    description: 'What risks may the team encounter ahead?',
    groupColor: '#E55C5C',
    id: 'promptWhatRisks',
    isActive: true,
    phaseItemType: 'retroPhaseItem',
    question: 'Risks',
    sortOrder: 2,
    teamId: 'aGhostTeam',
    templateId: 'sailboatTemplate',
    title: 'Risks',
    updatedAt: createdAt
  },
  {
    createdAt: createdAt,
    description: 'What new behaviors should we adopt?',
    groupColor: '#52CC52',
    id: 'promptWhatAdopt',
    isActive: true,
    phaseItemType: 'retroPhaseItem',
    question: 'Start',
    sortOrder: 0,
    teamId: 'aGhostTeam',
    templateId: 'startStopContinueTemplate',
    title: 'Start',
    updatedAt: createdAt
  },
  {
    createdAt: createdAt,
    description: 'What’s helping the team reach its goals?',
    groupColor: '#52CC52',
    id: 'promptWhatHelpGoal',
    isActive: true,
    phaseItemType: 'retroPhaseItem',
    question: 'Wind in the sails',
    sortOrder: 0,
    teamId: 'aGhostTeam',
    templateId: 'sailboatTemplate',
    title: 'Wind in the sails',
    updatedAt: createdAt
  },
  {
    createdAt: createdAt,
    description: 'What existing behaviors should we cease doing?',
    groupColor: '#E55C5C',
    id: 'promptWhatCease',
    isActive: true,
    phaseItemType: 'retroPhaseItem',
    question: 'Stop',
    sortOrder: 1,
    teamId: 'aGhostTeam',
    templateId: 'startStopContinueTemplate',
    title: 'Stop',
    updatedAt: createdAt
  },
  {
    createdAt: createdAt,
    description: 'What went well?',
    groupColor: '#52CC52',
    id: 'promptWhatWell',
    isActive: true,
    phaseItemType: 'retroPhaseItem',
    question: 'Liked',
    sortOrder: 0,
    teamId: 'aGhostTeam',
    templateId: 'fourLsTemplate',
    title: 'Liked',
    updatedAt: createdAt
  },
  {
    createdAt: createdAt,
    description: 'What did you want to happen?',
    groupColor: '#AC73E5',
    id: 'promptWhatHappen',
    isActive: true,
    phaseItemType: 'retroPhaseItem',
    question: 'Longed for',
    sortOrder: 3,
    teamId: 'aGhostTeam',
    templateId: 'fourLsTemplate',
    title: 'Longed for',
    updatedAt: createdAt
  },
  {
    createdAt: createdAt,
    description: 'What’s blocking us from achieving our goals?',
    groupColor: '#E55C5C',
    id: 'promptWhatBlocking',
    isActive: true,
    phaseItemType: 'retroPhaseItem',
    question: 'Where did you get stuck?',
    sortOrder: 1,
    teamId: 'aGhostTeam',
    templateId: 'workingStuckTemplate',
    title: 'Negative',
    updatedAt: createdAt
  }
]
export const up = async function(r: R) {
  try {
    // promote templateId to the root of the meeting document
    await r
      .table('NewMeeting')
      .filter({meetingType: 'retrospective'})
      .update((row) => ({
        templateId: row('phases')(
          row('phases')
            .offsetsOf((row) => row('phaseType').eq('reflect'))
            .nth(0)
        )('promptTemplateId').default(null)
      }))
      .run()
    await r
      .table('NewMeeting')
      .indexCreate('templateId')
      .run()
    await r
      .table('NewMeeting')
      .indexWait('templateId')
      .run()
  } catch (e) {
    console.log(e)
  }

  // delete unused templates, approx 90% of templates are unused!
  try {
    await r
      .table('ReflectTemplate')
      .filter((row) =>
        r
          .table('NewMeeting')
          .getAll(row('id'), {index: 'templateId'})
          .count()
          .eq(0)
      )
      .delete()
      .run()
  } catch (e) {
    console.log(e)
  }

  // add scope & orgId to templates
  try {
    await r
      .table('ReflectTemplate')
      .update(
        (row) => ({
          scope: 'TEAM',
          orgId: r
            .table('Team')
            .get(row('teamId'))('orgId')
            .default(null)
        }),
        {nonAtomic: true}
      )
      .run()
    await r
      .table('ReflectTemplate')
      .indexCreate('orgId')
      .run()
    await r
      .table('ReflectTemplate')
      .indexWait('orgId')
      .run()
  } catch (e) {
    console.log(e)
  }

  // add initial public templates
  try {
    await Promise.all([
      r
        .table('User')
        .insert(aGhostUser)
        .run(),
      r
        .table('OrganizationUser')
        .insert(aGhostOrgMember)
        .run(),
      r
        .table('Organization')
        .insert(aGhostOrg)
        .run(),
      r
        .table('Team')
        .insert(aGhostTeam)
        .run(),
      r
        .table('ReflectTemplate')
        .insert(templates)
        .run(),
      r
        .table('CustomPhaseItem')
        .insert(phaseItems)
        .run()
    ])
  } catch (e) {
    console.log(e)
  }
}

export const down = async function(r: R) {
  try {
    await r
      .table('NewMeeting')
      .indexDrop('templateId')
      .run()
    await r
      .table('NewMeeting')
      .replace((row) => row.without('templateId'))
      .run()
  } catch (e) {
    console.log(e)
  }

  try {
    await r
      .table('ReflectTemplate')
      .indexDrop('orgId')
      .run()
    await r
      .table('ReflectTemplate')
      .replace((row) => row.without('scope', 'orgId'))
      .run()
  } catch (e) {
    console.log(e)
  }
  const templateIds = templates.map(({id}) => id)
  const promptIds = phaseItems.map(({id}) => id)
  try {
    await Promise.all([
      r
        .table('User')
        .get(aGhostUser.id)
        .delete()
        .run(),
      r
        .table('OrganizationUser')
        .get(aGhostOrgMember.id)
        .delete()
        .run(),
      r
        .table('Organization')
        .get(aGhostOrg.id)
        .delete()
        .run(),
      r
        .table('Team')
        .get(aGhostTeam.id)
        .delete()
        .run(),
      r
        .table('ReflectTemplate')
        .getAll(r.args(templateIds))
        .delete()
        .run(),
      r
        .table('CustomPhaseItem')
        .getAll(r.args(promptIds))
        .delete()
        .run()
    ])
  } catch (e) {
    console.log(e)
  }
}
