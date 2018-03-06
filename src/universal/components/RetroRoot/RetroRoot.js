// @flow
import React from 'react';
import ErrorComponent from 'universal/components/ErrorComponent/ErrorComponent';
import LoadingView from 'universal/components/LoadingView/LoadingView';
import QueryRenderer from 'universal/components/QueryRenderer/QueryRenderer';
import RelayTransitionGroup from 'universal/components/RelayTransitionGroup';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import {cacheConfig, RETROSPECTIVE} from 'universal/utils/constants';
import OrganizationSubscription from 'universal/subscriptions/OrganizationSubscription';
import NewAuthTokenSubscription from 'universal/subscriptions/NewAuthTokenSubscription';
import TaskSubscription from 'universal/subscriptions/TaskSubscription';
import TeamMemberSubscription from 'universal/subscriptions/TeamMemberSubscription';
import NotificationSubscription from 'universal/subscriptions/NotificationSubscription';
import TeamSubscription from 'universal/subscriptions/TeamSubscription';
import NewMeeting from 'universal/components/NewMeeting';
import type {Dispatch} from 'redux';
import type {Location, Match, RouterHistory} from 'react-router-dom';
import {withRouter} from 'react-router-dom';
import {connect} from 'react-redux';

const query = graphql`
  query RetroRootQuery($teamId: ID!, $meetingType: MeetingTypeEnum!) {
    viewer {
      ...NewMeeting_viewer
    }
  }
`;

const subscriptions = [
  NewAuthTokenSubscription,
  NotificationSubscription,
  OrganizationSubscription,
  TaskSubscription,
  TeamMemberSubscription,
  TeamSubscription
];

type Props = {
  atmosphere: Object,
  dispatch: Dispatch<*>,
  location: Location,
  match: Match,
  history: RouterHistory
};

const RetroRoot = ({atmosphere, dispatch, history, location, match}: Props) => {
  const {params: {localPhase, teamId}} = match;
  return (
    <QueryRenderer
      cacheConfig={cacheConfig}
      environment={atmosphere}
      query={query}
      variables={{teamId, meetingType: RETROSPECTIVE}}
      subscriptions={subscriptions}
      subParams={{dispatch, history, location}}
      render={(readyState) => (
        <RelayTransitionGroup
          readyState={readyState}
          error={<ErrorComponent height={'14rem'} />}
          loading={<LoadingView minHeight="50vh" />}
          ready={<NewMeeting localPhase={localPhase} />}
        />
      )}
    />
  );
};

export default withAtmosphere(connect()(withRouter(RetroRoot)));
