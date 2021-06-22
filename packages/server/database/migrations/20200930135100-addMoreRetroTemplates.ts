import {R} from 'rethinkdb-ts'

const createdAt = new Date()

const templates = [
  {
    createdAt: createdAt,
    id: 'threeLittlePigsTemplate',
    isActive: true,
    name: 'Three Little Pigs 🐷 🐷 🐷',
    orgId: 'aGhostOrg',
    scope: 'PUBLIC',
    teamId: 'aGhostTeam',
    type: 'retrospective',
    updatedAt: createdAt,
    isStarter: true
  },
  {
    createdAt: createdAt,
    id: 'energyLevelsTemplate',
    isActive: true,
    name: 'Energy Levels 🔋',
    orgId: 'aGhostOrg',
    scope: 'PUBLIC',
    teamId: 'aGhostTeam',
    type: 'retrospective',
    updatedAt: createdAt,
    isStarter: true
  },
  {
    createdAt: createdAt,
    id: 'mountainClimberTemplate',
    isActive: true,
    name: 'Mountain Climber ⛰️',
    orgId: 'aGhostOrg',
    scope: 'PUBLIC',
    teamId: 'aGhostTeam',
    type: 'retrospective',
    updatedAt: createdAt,
    isStarter: true
  },
  {
    createdAt: createdAt,
    id: 'winningStreakTemplate',
    isActive: true,
    name: 'Winning Streak 🏆',
    orgId: 'aGhostOrg',
    scope: 'PUBLIC',
    teamId: 'aGhostTeam',
    type: 'retrospective',
    updatedAt: createdAt,
    isStarter: true
  }
]

const reflectPrompts = [
  // Three Little Pigs:
  {
    createdAt: createdAt,
    description: 'What is at risk of breaking?',
    groupColor: '#52CC52',
    id: 'promptHouseOfStraw',
    isActive: true,
    parentPromptId: 'promptWhatAdopt',
    question: 'House of Straw',
    sortOrder: 0,
    teamId: 'aGhostTeam',
    templateId: 'threeLittlePigsTemplate',
    title: 'Start',
    updatedAt: createdAt
  },
  {
    createdAt: createdAt,
    description: 'What needs more work?',
    groupColor: '#E55C5C',
    id: 'promptHouseOfSticks',
    isActive: true,
    parentPromptId: 'promptWhatCease',
    question: 'House of Sticks',
    sortOrder: 1,
    teamId: 'aGhostTeam',
    templateId: 'threeLittlePigsTemplate',
    title: 'Stop',
    updatedAt: createdAt
  },
  {
    createdAt: createdAt,
    description: 'What is rock solid and working well?',
    groupColor: '#D9D916',
    id: 'promptHouseOfBricks',
    isActive: true,
    parentPromptId: 'promptWhatKeep',
    question: 'House of Bricks',
    sortOrder: 2,
    teamId: 'aGhostTeam',
    templateId: 'threeLittlePigsTemplate',
    title: 'Continue',
    updatedAt: createdAt
  },
  // Energy Levels:
  {
    createdAt: createdAt,
    description: "What's your energy level going into the next Sprint?",
    groupColor: '#7373E5',
    id: 'promptSprintEnergy',
    isActive: true,
    question: 'Sprint Energy',
    sortOrder: 3.9999999999999996,
    teamId: 'aGhostTeam',
    templateId: 'energyLevelsTemplate',
    title: 'New prompt #3',
    updatedAt: createdAt
  },
  {
    createdAt: createdAt,
    description: 'What depleted you?',
    groupColor: '#E55C5C',
    id: 'promptLowBattery',
    isActive: true,
    question: 'Low Battery',
    sortOrder: 3.0000000000000004,
    teamId: 'aGhostTeam',
    templateId: 'energyLevelsTemplate',
    title: 'New prompt #2',
    updatedAt: createdAt
  },
  {
    createdAt: createdAt,
    description: 'What energized you?',
    groupColor: '#52CC52',
    id: 'promptFullyCharged',
    isActive: true,
    question: 'Fully Charged',
    sortOrder: 0,
    teamId: 'aGhostTeam',
    templateId: 'energyLevelsTemplate',
    title: 'New prompt',
    updatedAt: createdAt
  },
  // Mountain Climber:
  {
    createdAt: createdAt,
    description: 'How did we feel about our work?',
    groupColor: '#5CA0E5',
    id: 'promptWeather',
    isActive: true,
    question: 'Weather 🌡️',
    sortOrder: 2.0000000000000004,
    teamId: 'aGhostTeam',
    templateId: 'mountainClimberTemplate',
    title: 'New prompt #3',
    updatedAt: createdAt
  },
  {
    createdAt: createdAt,
    description: 'What more do we need to reach our goals?',
    groupColor: '#E55C5C',
    id: 'promptFirstAid',
    isActive: true,
    question: 'First Aid ⛑️',
    sortOrder: 3,
    teamId: 'aGhostTeam',
    templateId: 'mountainClimberTemplate',
    title: 'New prompt #4',
    updatedAt: createdAt
  },
  {
    createdAt: createdAt,
    description: 'What helped us reach our goal?',
    groupColor: '#52CC52',
    id: 'promptRopes',
    isActive: true,
    question: 'Ropes 🧗',
    sortOrder: 0,
    teamId: 'aGhostTeam',
    templateId: 'mountainClimberTemplate',
    title: 'New prompt',
    updatedAt: createdAt
  },
  {
    createdAt: createdAt,
    description: 'What stood in our way?',
    groupColor: '#AC73E5',
    id: 'promptBoulders',
    isActive: true,
    question: 'Boulders ⛰️',
    sortOrder: 0.9999999999999998,
    teamId: 'aGhostTeam',
    templateId: 'mountainClimberTemplate',
    title: 'New prompt #2',
    updatedAt: createdAt
  },
  // Winning Streak:
  {
    createdAt: createdAt,
    description: 'What teamwork practices helped us reach our goals?',
    groupColor: '#AC73E5',
    id: 'promptTeamwork',
    isActive: true,
    question: 'Teamwork',
    sortOrder: 1.0000000000000004,
    teamId: 'aGhostTeam',
    templateId: 'winningStreakTemplate',
    title: 'New prompt #2',
    updatedAt: createdAt
  },
  {
    createdAt: createdAt,
    description: 'Share the love! Give a shoutout to someone who did great work!',
    groupColor: '#45E5E5',
    id: 'promptKudos',
    isActive: true,
    question: 'Kudos',
    sortOrder: 2.9999999999999996,
    teamId: 'aGhostTeam',
    templateId: 'winningStreakTemplate',
    title: 'New prompt #4',
    updatedAt: createdAt
  },
  {
    createdAt: createdAt,
    description: 'How can we maintain/replicate our success in future?',
    groupColor: '#E55CA0',
    id: 'promptRepeatingOurSuccess',
    isActive: true,
    question: 'Repeating our success',
    sortOrder: 2,
    teamId: 'aGhostTeam',
    templateId: 'winningStreakTemplate',
    title: 'New prompt #3',
    updatedAt: createdAt
  },
  {
    createdAt: createdAt,
    description: 'What are we proud of achieving?',
    groupColor: '#52CC52',
    id: 'promptBigWins',
    isActive: true,
    question: 'Big wins',
    sortOrder: 0,
    teamId: 'aGhostTeam',
    templateId: 'winningStreakTemplate',
    title: 'New prompt',
    updatedAt: createdAt
  }
]

export const up = async function(r: R) {
  try {
    await Promise.all([
      r
        .table('MeetingTemplate')
        .insert(templates)
        .run(),
      r
        .table('ReflectPrompt')
        .insert(reflectPrompts)
        .run()
    ])
  } catch (e) {
    console.log(e)
  }
}

export const down = async function(r: R) {
  const templateIds = templates.map(({id}) => id)
  const promptIds = reflectPrompts.map(({id}) => id)

  try {
    await Promise.all([
      r
        .table('MeetingTemplate')
        .getAll(r.args(templateIds))
        .delete()
        .run(),
      r
        .table('ReflectPrompt')
        .getAll(r.args(promptIds))
        .delete()
        .run()
    ])
  } catch (e) {
    console.log(e)
  }
}
