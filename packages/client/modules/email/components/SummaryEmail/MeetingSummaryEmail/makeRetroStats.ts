import {RETRO_TOPIC_LABEL} from 'parabol-client/utils/constants'
import plural from 'parabol-client/utils/plural'

interface Meeting {
  reflectionGroups: {
    reflections: {
      id: string
    }[]
    voteCount: number
  }[]
  meetingMembers: {
    tasks: {
      id: string
    }[]
  }[]
}

const makeRetroStats = (meeting: Meeting) => {
  const {meetingMembers, reflectionGroups} = meeting

  const reflectionCount = reflectionGroups.reduce(
    (sum, {reflections}) => sum + reflections.length,
    0
  )
  const topicCount = reflectionGroups.length
  const newTaskCount = meetingMembers.reduce((sum, {tasks}) => sum + tasks.length, 0)
  const meetingMembersCount = meetingMembers.length
  return [
    {value: reflectionCount, label: plural(reflectionCount, 'Reflection')},
    {
      value: topicCount,
      label: plural(topicCount, RETRO_TOPIC_LABEL)
    },
    {value: newTaskCount, label: plural(newTaskCount, 'New Task')},
    {value: meetingMembersCount, label: 'Participants'}
  ]
}

export default makeRetroStats
