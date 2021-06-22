import {TaskStatusEnum} from '~/__generated__/UpdateTaskMutation.graphql'

/**
 * Big stuff:
 */
export const APP_CDN_USER_ASSET_SUBDIR = '/store'
export const APP_NAME = 'Action'

/* Meeting Misc. */
export const MEETING_NAME = 'Check-in Meeting'
export const MEETING_SUMMARY_LABEL = 'Summary'
export const AGENDA_ITEM_LABEL = 'Agenda Topic'
export const RETRO_TOPIC_LABEL = 'Topic'

/* Phases */
export const LOBBY = 'lobby'

// lowercase here to match url
export const CHECKIN = 'checkin'
export const UPDATES = 'updates'
export const FIRST_CALL = 'firstcall'
export const AGENDA_ITEMS = 'agendaitems'
export const LAST_CALL = 'lastcall'
export const SUMMARY = 'summary'

/* Retrospective Phases */
export const REFLECT = 'reflect'
export const GROUP = 'group'
export const VOTE = 'vote'
export const DISCUSS = 'discuss'

/* Columns */
export const ACTIVE = 'active'
export const STUCK = 'stuck'
export const DONE = 'done'
export const FUTURE = 'future'
export const columnArray = [FUTURE, STUCK, ACTIVE, DONE] as TaskStatusEnum[]
export const meetingColumnArray = [DONE, ACTIVE, STUCK, FUTURE] as TaskStatusEnum[]

/* Scoping Task Search Filter */
export const taskScopingStatusFilters = [ACTIVE, STUCK, FUTURE] as TaskStatusEnum[]

/* Drag-n-Drop Items */
export const TASK = 'task'
export const AGENDA_ITEM = 'agendaItem'

/* Sorting */
export const SORT_STEP = 1
export const DND_THROTTLE = 25
export const AUTO_GROUPING_THRESHOLD = 0.25

/* Areas */
export const MEETING = 'meeting'
export const TEAM_DASH = 'teamDash'
export const USER_DASH = 'userDash'

/* Accounts */
export const PERSONAL_LABEL = 'Personal'
export const PRO_LABEL = 'Pro'

/* DEPRECATED. Use NotificationEnum */
// sent to someone just kicked out of a team
export const KICKED_OUT = 'KICKED_OUT'
// Sent to Billing Leaders when a reoccuring payment gets rejected
export const PAYMENT_REJECTED = 'PAYMENT_REJECTED'
// sent to the orgMember that just got promoted, goes away if they get demoted before acknowledging it
export const PROMOTE_TO_BILLING_LEADER = 'PROMOTE_TO_BILLING_LEADER'
// new version of TEAM_INVITE
export const TEAM_INVITATION = 'TEAM_INVITATION'
// sent to members of team that was archived
export const TEAM_ARCHIVED = 'TEAM_ARCHIVED'
// sent to members when a task is assigned to them or mentions them
export const TASK_INVOLVES = 'TASK_INVOLVES'

export const billingLeaderTypes = [PAYMENT_REJECTED]

/* User Settings */
export const PROFILE = 'profile'
export const ORGANIZATIONS = 'organizations'
export const NOTIFICATIONS = 'notifications'

/* Org Settings */
export const BILLING_PAGE = 'billing'
export const MEMBERS_PAGE = 'members'

/* Stripe */
// changing this does NOT change it in stripe, it just changes the UI
export const MONTHLY_PRICE = 6

export const FAILED = 'FAILED'

/* character limits */
export const TASK_MAX_CHARS = 51200

/* Task tags */
export const tags = [
  {
    name: 'private',
    description: 'Only you will be able to see this task'
  },
  {
    name: 'archived',
    description: 'Hidden from your main board'
  }
]

export const textTags = ['#private', '#archived']

export const NEWLINE_REGEX = /\r\n?|\n/g

/* Integrations */
export const GITHUB = 'GitHubIntegration'
export const SLACK = 'SlackIntegration'
export const GITHUB_ENDPOINT = 'https://api.github.com/graphql'

/* JavaScript specifics */
export const MAX_INT = 2147483647

/* Relay Subscription Channels */
export const NOTIFICATION = 'notification'
export const ORGANIZATION = 'organization'
export const TEAM = 'team'

/* Relay Subscription Event Types */
export const UPDATED = 'updated'

/* Task Involvement Types */
export const ASSIGNEE = 'ASSIGNEE'
export const MENTIONEE = 'MENTIONEE'

/* Auth Labels, Slugs */
export const SIGNIN_LABEL = 'Sign In'
export const SIGNIN_SLUG = 'signin'
export const SIGNOUT_LABEL = 'Sign Out'
export const SIGNOUT_SLUG = 'signout'
export const CREATE_ACCOUNT_LABEL = 'Create Free Account'
export const CREATE_ACCOUNT_BUTTON_LABEL = 'Create Free Account'
export const CREATE_ACCOUNT_SLUG = 'create-account'

/* Meeting Types */
export const ACTION = 'action'
export const RETROSPECTIVE = 'retrospective'

/* Retro DnD types */
export const DISCUSSION_TOPIC = 'DISCUSSION_TOPIC'
