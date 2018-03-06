import PropTypes from 'prop-types';
import React from 'react';
import ErrorComponent from 'universal/components/ErrorComponent/ErrorComponent';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import Organization from 'universal/modules/userDashboard/components/Organization/Organization';
import {cacheConfig} from 'universal/utils/constants';
import QueryRenderer from 'universal/components/QueryRenderer/QueryRenderer';

const query = graphql`
  query OrganizationRootQuery($orgId: ID!) {
    viewer {
      ...Organization_viewer
    }
  }
`;

const OrganizationRoot = (rootProps) => {
  const {
    atmosphere,
    match
  } = rootProps;
  const {params: {orgId}} = match;
  return (
    <QueryRenderer
      cacheConfig={cacheConfig}
      environment={atmosphere}
      query={query}
      variables={{orgId}}
      subParams={{orgId}}
      render={({error, props: queryProps}) => {
        if (error) {
          return <ErrorComponent height={'14rem'} error={error} />;
        }
        const viewer = queryProps ? queryProps.viewer : null;
        // pass in match to mitigate update blocker
        return <Organization orgId={orgId} viewer={viewer} match={match} />;
      }}
    />
  );
};

OrganizationRoot.propTypes = {
  activeOrgDetail: PropTypes.string,
  billingLeaders: PropTypes.array,
  dispatch: PropTypes.func,
  myUserId: PropTypes.string,
  org: PropTypes.object
};

export default withAtmosphere(OrganizationRoot);
