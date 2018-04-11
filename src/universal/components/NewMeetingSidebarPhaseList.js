// @flow
import React from 'react';
import {LOBBY} from 'universal/utils/constants';
import styled from 'react-emotion';
import NewMeetingSidebarPhaseListItem from 'universal/components/NewMeetingSidebarPhaseListItem';
import {createFragmentContainer, graphql} from 'react-relay';
import {withRouter} from 'react-router-dom';
import {phaseTypeToPhaseGroup} from 'universal/utils/meetings/lookups';
import type {NewMeetingSidebarPhaseList_viewer as Viewer} from './__generated__/NewMeetingSidebarPhaseList_viewer.graphql';
import findStageById from 'universal/utils/meetings/findStageById';
import getIsNavigable from 'universal/utils/meetings/getIsNavigable';
import NewMeetingSidebarPhaseListItemChildren from 'universal/components/NewMeetingSidebarPhaseListItemChildren';

const NavList = styled('ul')({
  listStyle: 'none',
  margin: 0,
  padding: 0
});

type Props = {
  atmosphere: Object,
  gotoStageId: (stageId: string) => void,
  viewer: Viewer
}

const getItemStage = (name: string, phases: $ReadOnlyArray<Object>, facilitatorStageId: string) => {
  const stageRes = findStageById(phases, facilitatorStageId);
  if (!stageRes) return undefined;
  const {stage, phase} = stageRes;
  if (phase.phaseType === name) {
    return stage;
  }
  const itemPhase = phases.find(({phaseType}) => phaseType === name);
  return itemPhase && itemPhase.stages[0];
};

const NewMeetingSidebarPhaseList = (props: Props) => {
  const {gotoStageId, viewer} = props;
  const {viewerId, team: {meetingSettings: {phaseTypes}, newMeeting}} = viewer;
  const {facilitatorUserId, facilitatorStageId, localPhase = {}, phases = []} = newMeeting || {};
  const localGroup = phaseTypeToPhaseGroup[localPhase.phaseType];
  const facilitatorStageRes = findStageById(phases, facilitatorStageId);
  const {phase: facilitatorPhase = {phaseType: LOBBY}} = facilitatorStageRes || {};
  const facilitatorPhaseGroup = phaseTypeToPhaseGroup[facilitatorPhase.phaseType];
  const isViewerFacilitator = facilitatorUserId === viewerId;
  return (
    <NavList>
      {phaseTypes
        .map((phaseType, idx) => {
          const itemStage = getItemStage(phaseType, phases, facilitatorStageId);
          const itemStageId = itemStage && itemStage.id || '';
          const isNavigable = getIsNavigable(isViewerFacilitator, phases, itemStageId);
          const handleClick = isNavigable ? () => gotoStageId(itemStageId) : undefined;
          return (
            <NewMeetingSidebarPhaseListItem
              key={phaseType}
              phaseType={phaseType}
              listPrefix={String(idx + 1)}
              isActive={localGroup === phaseType}
              isFacilitatorPhaseGroup={facilitatorPhaseGroup === phaseType}
              handleClick={handleClick}
            >
              <NewMeetingSidebarPhaseListItemChildren gotoStageId={gotoStageId} phaseType={phaseType} viewer={viewer} />
            </NewMeetingSidebarPhaseListItem>
          );
        })}
    </NavList>
  );
};

export default createFragmentContainer(
  withRouter(NewMeetingSidebarPhaseList),
  graphql`
    fragment NewMeetingSidebarPhaseList_viewer on User {
      ...NewMeetingSidebarPhaseListItemChildren_viewer
      viewerId: id
      team(teamId: $teamId) {
        meetingSettings(meetingType: $meetingType) {
          phaseTypes
        }
        newMeeting {
          facilitatorUserId
          facilitatorStageId
          localPhase {
            phaseType
          }
          phases {
            phaseType
            stages {
              id
              isComplete
            }
          }
        }
      }
    }
  `
);
