import getGroupSmartTitle from 'parabol-client/utils/smartGroup/getGroupSmartTitle'
import dndNoise from '../../../../../client/utils/dndNoise'
import getRethink from '../../../../database/rethinkDriver'
import ReflectionGroup from '../../../../database/types/ReflectionGroup'
import updateSmartGroupTitle from './updateSmartGroupTitle'

const removeReflectionFromGroup = async (reflectionId, {dataLoader}) => {
  const r = await getRethink()
  const now = new Date()
  const reflection = await r
    .table('RetroReflection')
    .get(reflectionId)
    .run()
  if (!reflection) throw new Error('Reflection not found')
  const {reflectionGroupId: oldReflectionGroupId, meetingId, promptId} = reflection
  const [oldReflectionGroup, reflectionGroupsInColumn, meeting] = await Promise.all([
    dataLoader.get('retroReflectionGroups').load(oldReflectionGroupId),
    r
      .table('RetroReflectionGroup')
      .getAll(meetingId, {index: 'meetingId'})
      .filter({isActive: true, promptId})
      .orderBy('sortOrder')
      .run(),
    dataLoader.get('newMeetings').load(meetingId)
  ])

  let newSortOrder = 1e6
  const oldReflectionGroupIdx = reflectionGroupsInColumn.findIndex(
    (group) => group.id === oldReflectionGroup.id
  )
  const sortOrderAtBottom =
    reflectionGroupsInColumn[reflectionGroupsInColumn.length - 1]?.sortOrder + 1 + dndNoise() ?? 1e6
  if (oldReflectionGroupIdx === -1 || reflection.promptId !== oldReflectionGroup.promptId) {
    newSortOrder = sortOrderAtBottom
  } else if (oldReflectionGroupIdx === reflectionGroupsInColumn.length - 1) {
    newSortOrder = oldReflectionGroup.sortOrder + 1 + dndNoise()
  } else {
    const {sortOrder: oldSortOrder} = oldReflectionGroup
    const afterSortOrder = reflectionGroupsInColumn[oldReflectionGroupIdx + 1].sortOrder
    newSortOrder = (oldSortOrder + afterSortOrder) / 2 + dndNoise()
  }

  const reflectionGroup = new ReflectionGroup({meetingId, promptId, sortOrder: newSortOrder})
  const {id: reflectionGroupId} = reflectionGroup
  await r({
    reflectionGroup: r.table('RetroReflectionGroup').insert(reflectionGroup),
    reflection: r
      .table('RetroReflection')
      .get(reflectionId)
      .update({
        sortOrder: 0,
        reflectionGroupId,
        updatedAt: now
      }),
    meeting: r
      .table('NewMeeting')
      .get(meetingId)
      .update({nextAutoGroupThreshold: null})
  }).run()
  // mutates the dataloader response
  meeting.nextAutoGroupThreshold = null
  const oldReflections = await r
    .table('RetroReflection')
    .getAll(oldReflectionGroupId, {index: 'reflectionGroupId'})
    .filter({isActive: true})
    .run()

  const nextTitle = getGroupSmartTitle([reflection])
  await updateSmartGroupTitle(reflectionGroupId, nextTitle)

  if (oldReflections.length > 0) {
    const oldTitle = getGroupSmartTitle(oldReflections)
    await updateSmartGroupTitle(oldReflectionGroupId, oldTitle)
  } else {
    await r
      .table('RetroReflectionGroup')
      .get(oldReflectionGroupId)
      .update({
        isActive: false,
        updatedAt: now
      })
      .run()
  }
  return reflectionGroupId
}

export default removeReflectionFromGroup
