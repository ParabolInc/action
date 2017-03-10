import React, {PropTypes} from 'react';
import Organizations from 'universal/modules/userDashboard/components/Organizations/Organizations';
import {cashay} from 'cashay';
import {connect} from 'react-redux';

const teamProjectsHeaderQuery = `
query {
  ownedOrganizations(userId: $userId) @live {
    id
    activeUserCount
    inactiveUserCount
    name
    picture
  },
  teams (type: "[Team]") @live {
    id
    isPaid
    name
    meetingId
  }
}
`;

const mapStateToProps = (state) => {
  const userId = state.auth.obj.sub;
  const bleh = cashay.query(teamProjectsHeaderQuery, {
    op: 'organizationsContainer',
    key: userId,
    sort: {
      organizations: (a, b) => a.name > b.name ? 1 : -1
    },
    variables: {
      userId
    }
  }).data;
  console.log('orgCont', bleh);
  const {ownedOrganizations: organizations} = bleh;
  return {
    organizations
  };
};

const OrganizationsContainer = (props) => {
  const {organizations} = props;
  return (
    <Organizations organizations={organizations}/>
  );
};

OrganizationsContainer.propTypes = {
  organizations: PropTypes.array
};

export default connect(mapStateToProps)(OrganizationsContainer);
