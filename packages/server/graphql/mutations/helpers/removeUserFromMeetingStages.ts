import getRethink from '../../../database/rethinkDriver'
import {DataLoaderWorker} from '../../graphql'

/*
 * Removes the following user-specific details from a stage:
 *  - readyToAdvance
 */

const removeUserFromMeetingStages = async (
  userId: string,
  teamId: string,
  dataLoader: DataLoaderWorker
) => {
  const now = new Date()
  const r = await getRethink()
  const activeMeetings = await dataLoader.get('activeMeetingsByTeamId').load(teamId)
  await Promise.all(
    activeMeetings.map((meeting) => {
      const {id: meetingId, phases} = meeting
      let isChanged = false
      phases.forEach((phase) => {
        // do this inside the loop since it's mutative
        const {stages} = phase
        for (let i = 0; i < stages.length; i++) {
          const stage = stages[i]
          const {readyToAdvance} = stage
          if (!readyToAdvance) continue
          const userIdIdx = readyToAdvance.indexOf(userId)
          if (userIdIdx === -1) continue
          readyToAdvance.splice(userIdIdx, 1)
          isChanged = true
        }
      })
      if (!isChanged) return Promise.resolve(undefined)
      return r
        .table('NewMeeting')
        .get(meetingId)
        .update({
          phases,
          updatedAt: now
        })
        .run()
    })
  )
  return activeMeetings.map((activeMeeting) => activeMeeting.id)
}

export default removeUserFromMeetingStages
