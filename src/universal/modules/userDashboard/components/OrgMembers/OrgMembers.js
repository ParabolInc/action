import {css} from 'aphrodite-local-styles/no-important';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import {createPaginationContainer} from 'react-relay';
import {withRouter} from 'react-router-dom';
import Button from 'universal/components/Button/Button';
import Panel from 'universal/components/Panel/Panel';
import Toggle from 'universal/components/Toggle/Toggle';
import Tooltip from 'universal/components/Tooltip/Tooltip';
import {Menu, MenuItem} from 'universal/modules/menu';
import {showError, showInfo} from 'universal/modules/toast/ducks/toastDuck';
import LeaveOrgModal from 'universal/modules/userDashboard/components/LeaveOrgModal/LeaveOrgModal';
import RemoveFromOrgModal from 'universal/modules/userDashboard/components/RemoveFromOrgModal/RemoveFromOrgModal';
import InactivateUserMutation from 'universal/mutations/InactivateUserMutation';
import SetOrgUserRoleMutation from 'universal/mutations/SetOrgUserRoleMutation';
import ui from 'universal/styles/ui';
import withStyles from 'universal/styles/withStyles';
import {BILLING_LEADER, PERSONAL} from 'universal/utils/constants';
import withMutationProps from 'universal/utils/relay/withMutationProps';
import OrgUserRow from '../OrgUserRow/OrgUserRow';

const originAnchor = {
  vertical: 'top',
  horizontal: 'right'
};

const targetAnchor = {
  vertical: 'top',
  horizontal: 'left'
};

const OrgMembers = (props) => {
  const {
    dispatch,
    history,
    org,
    orgId,
    viewer: {organization: {orgMembers}},
    relay: {environment},
    submitMutation,
    onError,
    onCompleted,
    styles
  } = props;

  const {tier} = org;
  const isPersonalTier = tier === PERSONAL;
  const setRole = (userId, role = null) => () => {
    const variables = {orgId, userId, role};
    SetOrgUserRoleMutation(environment, variables, {dispatch, history});
  };

  const billingLeaderCount = orgMembers.edges.reduce((count, {node}) => node.isBillingLeader ? count + 1 : count, 0);

  const userRowActions = (orgMember) => {
    const {user: {userId, inactive, preferredName}} = orgMember;
    const itemFactory = () => {
      const {userId: myUserId} = environment;
      const listItems = [];
      if (orgMember.isBillingLeader) {
        if (billingLeaderCount > 1) {
          listItems.push(
            <MenuItem label="Remove Billing Leader role" onClick={setRole(userId)} />
          );
        } else {
          listItems.push(
            <MenuItem label="Have a super day!" />
          );
        }
      } else {
        listItems.push(
          <MenuItem label="Promote to Billing Leader" onClick={setRole(userId, BILLING_LEADER)} />
        );
      }
      if (myUserId !== userId) {
        listItems.push(
          <RemoveFromOrgModal
            orgId={orgId}
            preferredName={preferredName}
            userId={userId}
            toggle={<MenuItem label="Remove from Organization" />}
          />
        );
      }
      if (billingLeaderCount > 1 && myUserId === userId) {
        listItems.push(
          <LeaveOrgModal
            orgId={orgId}
            userId={userId}
            toggle={<MenuItem label="Leave Organization" />}
          />
        );
      }

      return listItems;
    };

    const toggleHandler = () => {
      if (isPersonalTier) return;
      if (!inactive) {
        submitMutation();
        const handleError = (error) => {
          dispatch(showError({
            title: 'Oh no',
            message: error || 'Cannot pause user'
          }));
          onError(error);
        };
        InactivateUserMutation(environment, userId, handleError, onCompleted);
      } else {
        dispatch(
          showInfo({
            title: 'We’ve got you covered!',
            message: 'We’ll reactivate that user the next time they log in so you don’t pay a penny too much'
          })
        );
      }
    };
    const toggleLabel = inactive ? 'Inactive' : 'Active';
    const makeToggle = () => (<Toggle
      active={!inactive}
      block
      disabled={isPersonalTier}
      label={toggleLabel}
      onClick={toggleHandler}
    />);
    const toggleTip = (<div>{'You only need to manage activity on the Pro plan.'}</div>);
    const menuTip = (
      <div>{'You need to promote another Billing Leader'}<br />{'before you can leave this role or Organization.'}
      </div>);
    const menuButtonProps = {
      buttonSize: 'small',
      buttonStyle: 'flat',
      colorPalette: 'dark',
      icon: 'ellipsis-v',
      isBlock: true,
      size: 'smallest'
    };
    return (
      <div className={css(styles.actionLinkBlock)}>
        <div className={css(styles.toggleBlock)}>
          {isPersonalTier ?
            <Tooltip
              tip={toggleTip}
              maxHeight={40}
              maxWidth={500}
              originAnchor={{vertical: 'top', horizontal: 'center'}}
              targetAnchor={{vertical: 'bottom', horizontal: 'center'}}
            >
              <div>{makeToggle()}</div>
            </Tooltip> :
            makeToggle()
          }
        </div>
        <div className={css(styles.menuToggleBlock)}>
          {(orgMember.isBillingLeader && billingLeaderCount === 1) ?
            <Tooltip
              tip={menuTip}
              maxHeight={60}
              maxWidth={500}
              originAnchor={{vertical: 'center', horizontal: 'right'}}
              targetAnchor={{vertical: 'center', horizontal: 'left'}}
            >
              {/* https://github.com/facebook/react/issues/4251 */}
              <Button {...menuButtonProps} visuallyDisabled />
            </Tooltip> :
            <Menu
              itemFactory={itemFactory}
              originAnchor={originAnchor}
              menuWidth="14rem"
              targetAnchor={targetAnchor}
              toggle={
                <Button {...menuButtonProps} />
              }
            />
          }
        </div>
      </div>
    );
  };
  return (
    <Panel label="Organization Members">
      <div className={css(styles.listOfAdmins)}>
        {orgMembers.edges.map(({node: orgMember}) => {
          return (
            <OrgUserRow
              key={`orgUser${orgMember.user.email}`}
              actions={userRowActions(orgMember)}
              orgMember={orgMember}
            />
          );
        })}
      </div>
    </Panel>
  );
};

OrgMembers.propTypes = {
  history: PropTypes.object.isRequired,
  relay: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  org: PropTypes.object,
  orgId: PropTypes.string.isRequired,
  viewer: PropTypes.object.isRequired,
  error: PropTypes.any,
  submitting: PropTypes.bool,
  submitMutation: PropTypes.func.isRequired,
  onCompleted: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  styles: PropTypes.object
};

const styleThunk = () => ({
  actionLinkBlock: {
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'flex-end'
  },

  menuToggleBlock: {
    marginLeft: ui.rowGutter,
    width: '1.5rem'
  },

  toggleBlock: {
    marginLeft: ui.rowGutter,
    width: '100px'
  }
});

export default createPaginationContainer(
  withRouter(connect()(withMutationProps(withStyles(styleThunk)(OrgMembers)))),
  graphql`
    fragment OrgMembers_viewer on User {
      organization(orgId: $orgId) {
        orgMembers(first: $first, after: $after) @connection(key: "OrgMembers_orgMembers") {
          edges {
            cursor
            node {
              ...OrgUserRow_orgMember
              isBillingLeader
              user {
                userId: id
                email
                inactive
                preferredName
              }
            }
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    }
  `,
  {
    direction: 'forward',
    getConnectionFromProps(props) {
      return props.viewer && props.viewer.orgMembers;
    },
    getFragmentVariables(prevVars, totalCount) {
      return {
        ...prevVars,
        first: totalCount
      };
    },
    getVariables(props, {count, cursor}, fragmentVariables) {
      return {
        ...fragmentVariables,
        first: count,
        after: cursor
      };
    },
    query: graphql`
      query OrgMembersPaginationQuery($first: Int!, $after: String, $orgId: ID!) {
        viewer {
          ...OrgMembers_viewer
        }
      }
    `
  }
);
