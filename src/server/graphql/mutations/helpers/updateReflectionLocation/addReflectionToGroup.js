import makeRetroGroupTitle from 'server/graphql/mutations/helpers/makeRetroGroupTitle';
import {isTeamMember} from 'server/utils/authorization';
import getRethink from 'server/database/rethinkDriver';
import {sendReflectionGroupNotFoundError, sendReflectionNotFoundError} from 'server/utils/docNotFoundErrors';
import {sendTeamAccessError} from 'server/utils/authorizationErrors';
import {sendAlreadyCompletedMeetingPhaseError, sendAlreadyEndedMeetingError} from 'server/utils/alreadyMutatedErrors';
import updateGroupTitle from 'server/graphql/mutations/helpers/updateReflectionLocation/updateGroupTitle';
import {GROUP} from 'universal/utils/constants';
import isPhaseComplete from 'universal/utils/meetings/isPhaseComplete';

const addReflectionToGroup = async (reflectionId, reflectionGroupId, sortOrder, {authToken, dataLoader}) => {
  const r = getRethink();
  const now = new Date();
  const reflection = await r.table('RetroReflection').get(reflectionId);
  if (!reflection) return sendReflectionNotFoundError(authToken, reflectionId);
  const {reflectionGroupId: oldReflectionGroupId, meetingId: reflectionMeetingId} = reflection;
  const reflectionGroup = await r.table('RetroReflectionGroup').get(reflectionGroupId);
  if (!reflectionGroup) return sendReflectionGroupNotFoundError(authToken, reflectionGroupId);
  const {meetingId} = reflectionGroup;
  if (reflectionMeetingId !== meetingId) sendReflectionGroupNotFoundError(authToken, reflectionGroupId);
  const meeting = await dataLoader.get('newMeetings').load(meetingId);
  const {endedAt, phases, teamId} = meeting;
  if (!isTeamMember(authToken, teamId)) return sendTeamAccessError(authToken, teamId);
  if (endedAt) return sendAlreadyEndedMeetingError(authToken, meetingId);
  if (isPhaseComplete(GROUP, phases)) return sendAlreadyCompletedMeetingPhaseError(authToken, GROUP);

  // RESOLUTION
  await r.table('RetroReflection').get(reflectionId)
    .update({
      sortOrder,
      reflectionGroupId,
      updatedAt: now
    });
  const {nextReflections, oldReflections} = await r({
    nextReflections: r.table('RetroReflection')
      .getAll(reflectionGroupId, {index: 'reflectionGroupId'})
      .filter({isActive: true})
      .coerceTo('array'),
    oldReflections: r.table('RetroReflection')
      .getAll(oldReflectionGroupId, {index: 'reflectionGroupId'})
      .filter({isActive: true})
      .coerceTo('array')
  });

  const {smartTitle: nextGroupSmartTitle, title: nextGroupTitle} = makeRetroGroupTitle(meetingId, nextReflections);
  await updateGroupTitle(reflectionGroupId, nextGroupSmartTitle, nextGroupTitle);

  if (oldReflections.length > 0) {
    const {smartTitle: oldGroupSmartTitle, title: oldGroupTitle} = makeRetroGroupTitle(meetingId, oldReflections);
    await updateGroupTitle(oldReflectionGroupId, oldGroupSmartTitle, oldGroupTitle);
  } else {
    await r.table('RetroReflectionGroup').get(oldReflectionGroupId)
      .update({
        isActive: false,
        updatedAt: now
      });
  }
  return {meetingId, reflectionId, reflectionGroupId, oldReflectionGroupId, teamId};
};

export default addReflectionToGroup;
