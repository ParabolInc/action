// @flow
import * as React from 'react';
import styled from 'react-emotion';
import {createFragmentContainer} from 'react-relay';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import MeetingControlBar from 'universal/modules/meeting/components/MeetingControlBar/MeetingControlBar';
import Button from 'universal/components/Button/Button';
import ui from 'universal/styles/ui';
import appTheme from 'universal/styles/theme/appTheme';
import StyledFontAwesome from 'universal/components/StyledFontAwesome';
import ReflectionCard from 'universal/components/ReflectionCard/ReflectionCard';
import MeetingAgendaCards from 'universal/modules/meeting/components/MeetingAgendaCards/MeetingAgendaCards';
import findStageAfterId from 'universal/utils/meetings/findStageAfterId';
import EndNewMeetingMutation from 'universal/mutations/EndNewMeetingMutation';
import {withRouter} from 'react-router-dom';
import type {RouterHistory} from 'react-router-dom';

type Props = {|
  atmosphere: Object,
  history: RouterHistory,
  gotoNext: () => void,
  // flow or relay-compiler is getting really confused here, so I don't use the flow type here
  team: Object,
|};

const DiscussHeader = styled('div')({
  margin: '0 0 1.25rem'
});

const TopicHeading = styled('div')({
  fontSize: appTheme.typography.s6
});

const CheckColumn = styled('div')({
  display: 'flex'
});

const CheckIcon = styled(StyledFontAwesome)(({color}) => ({
  color,
  marginRight: '.25rem',
  width: ui.iconSize
}));

const PhaseWrapper = styled('div')({
  flex: 1,
  overflowY: 'scroll'
});

const ReflectionSection = styled('div')({
  borderBottom: `.0625rem solid ${ui.dashBorderColor}`,
  margin: '0 auto',
  maxHeight: '65%',
  maxWidth: ui.meetingTopicPhaseMaxWidth,
  minHeight: '35%',
  overflowY: 'scroll',
  padding: '2rem 1.375rem .875rem 2.5rem'
});

const ReflectionGrid = styled('div')({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, calc(100% / 3))'
});

const ReflectionGridBlock = styled('div')({
  margin: '0 1.125rem 1.125rem 0'
});

const TaskCardBlock = styled('div')({
  margin: '0 auto',
  maxWidth: ui.meetingTopicPhaseMaxWidth,
  padding: '1rem 2rem 2.5rem',

  [ui.breakpoint.wide]: {
    paddingLeft: '1.75rem',
    paddingRight: '1.75rem'
  },

  [ui.breakpoint.wider]: {
    paddingLeft: '1.5rem',
    paddingRight: '1.5rem'
  }
});



const RetroDiscussPhase = (props: Props) => {
  const {atmosphere, gotoNext, history, team} = props;
  const {viewerId} = atmosphere;
  const {newMeeting, teamId} = team;
  const {facilitatorUserId, localStage: {localStageId, reflectionGroup}, meetingId, phases} = newMeeting || {};
  // reflection group will be null until the server overwrites the placeholder.
  if (!reflectionGroup) return null;
  const {reflectionGroupId, tasks, title, reflections, voteCount} = reflectionGroup;
  const isFacilitating = facilitatorUserId === viewerId;
  const checkMarks = [...Array(voteCount).keys()];
  const nextStageRes = findStageAfterId(phases, localStageId);
  const endMeeting = () => {
    EndNewMeetingMutation(atmosphere, {meetingId}, {history});
  };
  return (
    <React.Fragment>
      <PhaseWrapper>
        <ReflectionSection>
          <DiscussHeader>
            <TopicHeading>{`“${title}”`}</TopicHeading>
            <CheckColumn>
              {checkMarks.map((idx) => <CheckIcon key={idx} name="check" color={ui.palette.mid} />)}
            </CheckColumn>
          </DiscussHeader>
          <ReflectionGrid>
            {reflections.map((reflection) => {
              return (
                <ReflectionGridBlock>
                  <ReflectionCard key={reflection.id} meeting={newMeeting} reflection={reflection} />
                </ReflectionGridBlock>
              );
            })}
          </ReflectionGrid>
        </ReflectionSection>
        <TaskCardBlock>
          <MeetingAgendaCards
            meetingId={meetingId}
            reflectionGroupId={reflectionGroupId}
            tasks={tasks}
            teamId={teamId}
          />
        </TaskCardBlock>
      </PhaseWrapper>
      {isFacilitating &&
      <MeetingControlBar>
        {nextStageRes && <Button
          buttonSize="medium"
          buttonStyle="flat"
          colorPalette="dark"
          icon="arrow-circle-right"
          iconLarge
          iconPalette="warm"
          iconPlacement="right"
          label={'Done! Next topic'}
          onClick={gotoNext}
        />}
        <Button
          buttonSize="medium"
          buttonStyle="flat"
          colorPalette="dark"
          icon="arrow-circle-right"
          iconLarge
          iconPalette="warm"
          iconPlacement="right"
          label={'End Meeting'}
          onClick={endMeeting}
        />
      </MeetingControlBar>
      }
    </React.Fragment>
  );
};

export default createFragmentContainer(
  withRouter(withAtmosphere(RetroDiscussPhase)),
  graphql`
    fragment RetroDiscussPhase_team on Team {
      teamId: id
      newMeeting {
        ...ReflectionCard_meeting
        meetingId: id
        facilitatorUserId
        phases {
          stages {
            id
            ... on RetroDiscussStage {
              reflectionGroup {
                id
                tasks {
                  ...NullableTask_task
                }
              }
            }
          }
        }
        localPhase {
          stages {
            id
          }
        }
        localStage {
          localStageId: id
          ... on RetroDiscussStage {
            reflectionGroup {
              reflectionGroupId: id
              title
              voteCount
              reflections {
                id
                ...ReflectionCard_reflection
              }
              tasks {
                id
                reflectionGroupId
                createdAt
                sortOrder
                ...NullableTask_task
              }
            }
          }
        }
      }
    }
  `
);
