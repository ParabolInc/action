import {css} from 'aphrodite-local-styles/no-important';
import PropTypes from 'prop-types';
import React from 'react';
import {commitLocalUpdate, createFragmentContainer} from 'react-relay';
import {withRouter} from 'react-router-dom';
import Button from 'universal/components/Button/Button';
import {DashContent, DashHeader, DashHeaderInfo, DashMain} from 'universal/components/Dashboard';
import DashboardAvatars from 'universal/components/DashboardAvatars/DashboardAvatars';
import LoadingView from 'universal/components/LoadingView/LoadingView';
import EditTeamName from 'universal/modules/teamDashboard/components/EditTeamName/EditTeamName';
import TeamCallsToAction from 'universal/modules/teamDashboard/components/TeamCallsToAction/TeamCallsToAction';
import UnpaidTeamModalRoot from 'universal/modules/teamDashboard/containers/UnpaidTeamModal/UnpaidTeamModalRoot';
import ui from 'universal/styles/ui';
import withStyles from 'universal/styles/withStyles';
import MeetingInProgressModal from '../MeetingInProgressModal/MeetingInProgressModal';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';

// use the same object so the EditTeamName doesn't rerender so gosh darn always
const initialValues = {teamName: ''};

const Team = (props) => {
  const {
    atmosphere,
    children,
    hasMeetingAlert,
    isSettings,
    history,
    styles,
    team
  } = props;
  if (!team) return <LoadingView />;
  const {teamId, teamName, isPaid, meetingId} = team;
  const updateFilter = (e) => {
    const nextValue = e.target.value;
    commitLocalUpdate(atmosphere, (store) => {
      const teamProxy = store.get(teamId);
      teamProxy.setValue(nextValue, 'contentFilter');
    });
  };
  const hasActiveMeeting = Boolean(meetingId);
  const hasOverlay = hasActiveMeeting || !isPaid;
  initialValues.teamName = teamName;
  const DashHeaderInfoTitle = isSettings ?
    <EditTeamName initialValues={initialValues} teamName={teamName} teamId={teamId} /> : teamName;
  const modalLayout = hasMeetingAlert ? ui.modalLayoutMainWithDashAlert : ui.modalLayoutMain;
  const goToTeamSettings = () =>
    history.push(`/team/${teamId}/settings/`);
  const goToTeamDashboard = () =>
    history.push(`/team/${teamId}`);
  return (
    <DashMain>
      <MeetingInProgressModal
        isOpen={hasActiveMeeting}
        modalLayout={modalLayout}
        teamId={teamId}
        teamName={teamName}
        key={`${teamId}MeetingModal`}
      />
      <UnpaidTeamModalRoot
        isOpen={!isPaid}
        teamId={teamId}
        modalLayout={modalLayout}
        key={`${teamId}UnpaidModal`}
      />
      <DashHeader hasOverlay={hasOverlay}>
        <DashHeaderInfo title={DashHeaderInfoTitle}>
          {!isSettings &&
            <TeamCallsToAction teamId={teamId} />
          }
          {__RELEASE_FLAGS__.localFilter &&
            <span>Filter:
              <input onChange={updateFilter} />
            </span>
          }
        </DashHeaderInfo>
        <div className={css(styles.teamLinks)}>
          {isSettings ?
            <Button
              key="1"
              buttonStyle="flat"
              colorPalette="cool"
              icon="arrow-circle-left"
              iconPlacement="left"
              isBlock
              label="Back to Team Dashboard"
              onClick={goToTeamDashboard}
              buttonSize="small"
            /> :
            <Button
              buttonSize="small"
              buttonStyle="flat"
              colorPalette="cool"
              icon="cog"
              iconPlacement="left"
              key="2"
              isBlock
              label="Team Settings"
              onClick={goToTeamSettings}
            />
          }
          <DashboardAvatars team={team} />
        </div>
      </DashHeader>
      <DashContent hasOverlay={hasOverlay} padding="0">
        {children}
      </DashContent>
    </DashMain>
  );
};

Team.propTypes = {
  atmosphere: PropTypes.object.isRequired,
  children: PropTypes.any,
  hasMeetingAlert: PropTypes.bool,
  isSettings: PropTypes.bool.isRequired,
  history: PropTypes.object,
  styles: PropTypes.object,
  team: PropTypes.object
};

const styleThunk = () => ({
  teamLinks: {
    display: 'flex',
    flexWrap: 'nowrap'
  }
});

export default createFragmentContainer(
  withAtmosphere(withRouter(withStyles(styleThunk)(Team))),
  graphql`
    fragment Team_team on Team {
      contentFilter
      teamId: id
      teamName: name
      isPaid
      meetingId
      ...DashboardAvatars_team
    }
  `
);
