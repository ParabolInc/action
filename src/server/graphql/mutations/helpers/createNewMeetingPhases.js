import makeCheckinStages from 'server/graphql/mutations/helpers/makeCheckinStages';
import {CHECKIN, DISCUSS, GROUP, REFLECT, VOTE} from 'universal/utils/constants';
import makeRetroStage from 'server/graphql/mutations/helpers/makeRetroStage';
import getRethink from 'server/database/rethinkDriver';
import convertToTaskContent from 'universal/utils/draftjs/convertToTaskContent';
import {makeCheckinGreeting, makeCheckinQuestion} from 'universal/utils/makeCheckinGreeting';
import shortid from 'shortid';

const createNewMeetingPhases = async (teamId, meetingId, meetingCount, meetingType, dataLoader) => {
  const r = getRethink();
  const meetingSettings = await r.table('MeetingSettings')
    .getAll(teamId, {index: 'teamId'})
    .filter({meetingType})
    .nth(0)
    .default(null);
  if (!meetingSettings) {
    throw new Error('No meeting setting found for team!');
  }
  const {phaseTypes} = meetingSettings;

  return Promise.all(phaseTypes.map(async (phaseType) => {
    if (phaseType === CHECKIN) {
      return {
        id: shortid.generate(),
        phaseType,
        checkInGreeting: makeCheckinGreeting(meetingCount, teamId),
        checkInQuestion: convertToTaskContent(makeCheckinQuestion(meetingCount, teamId)),
        stages: await makeCheckinStages(teamId, meetingId, dataLoader)
      };
    }
    if (phaseType === REFLECT || phaseType === GROUP || phaseType === VOTE) {
      return {
        id: shortid.generate(),
        phaseType,
        stages: [makeRetroStage(phaseType, meetingId)]
      };
    }
    if (phaseType === DISCUSS) {
      return {
        id: shortid.generate(),
        phaseType,
        stages: [makeRetroStage(phaseType, meetingId)]
      };
    }
    throw new Error('Unhandled phaseType', phaseType);
  }));
};

export default createNewMeetingPhases;
