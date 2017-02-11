import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import ui from 'universal/styles/ui';
import OrgUserRow from '../OrgUserRow/OrgUserRow';
import IconControl from 'universal/components/IconControl/IconControl';
import Button from 'universal/components/Button/Button';
import Panel from 'universal/components/Panel/Panel';
import Toggle from 'universal/components/Toggle/Toggle';
import RemoveBillingLeaderModal from 'universal/modules/userDashboard/components/RemoveBillingLeaderModal/RemoveBillingLeaderModal';
import LeaveOrgModal from 'universal/modules/userDashboard/components/LeaveOrgModal/LeaveOrgModal';
import {Menu, MenuItem} from 'universal/modules/menu';
import {cashay} from 'cashay';
import {BILLING_LEADER} from 'universal/utils/constants';

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
      billingLeaderCount,
      users,
      myUserId,
      orgId,
      styles,
    } = props;

    const setRole = (userId, role) => () => {
      const variables = {
        orgId,
        userId,
        role
      };
      cashay.mutate('setOrgUserRole', {variables});
    };
    const userRowActions = (orgUser) => {
      const {id, inactive, preferredName} = orgUser;
      const itemFactory = () => {
        const listItems = [];
        if (orgUser.isBillingLeader) {
          listItems.push(
            <MenuItem label="Remove from Admin Role" onClick={setRole(id)}/>
          )
        } else {
          listItems.push(
            <MenuItem label="Promote to Admin Role" onClick={setRole(id, BILLING_LEADER)}/>
          )
        }
        if (myUserId !== orgUser.id) {
          listItems.push(
            <RemoveBillingLeaderModal
              orgId={orgId}
              preferredName={preferredName}
              userId={id}
              toggle={<MenuItem label="Remove from Organization"/>}
            />
          )
        }
        if (billingLeaderCount > 1 && myUserId === orgUser.id) {
          listItems.push(
            <LeaveOrgModal
              orgId={orgId}
              userId={id}
              toggle={<MenuItem label="Leave Organization"/>}
            />
          )
        }

        return listItems;
      };
      return (
        <div className={css(styles.actionLinkBlock)}>
          <div className={css(styles.toggleBlock)}>
            <Toggle active={!inactive} block label="Active"/>
          </div>
          <div className={css(styles.menuToggleBlock)}>
            <Menu
              itemFactory={itemFactory}
              originAnchor={originAnchor}
              menuWidth="12rem"
              targetAnchor={targetAnchor}
              toggle={
                <Button
                  colorPalette="dark"
                  icon="ellipsis-v"
                  isBlock
                  size="smallest"
                  style="flat"
                />
              }
            />
          </div>
        </div>
      );
    };
    const newAdmin =
      <IconControl
        icon="plus-square-o"
        iconSize={ui.iconSize2x}
        label="New Admin"
        lineHeight={ui.iconSize2x}
        padding={`0 0 0 ${ui.panelGutter}`}
      />;
    return (
      <Panel label="Organization Members" controls={newAdmin}>
        <div className={css(styles.listOfAdmins)}>
          {users.map((orgUser, idx) => {
            return (
              <OrgUserRow
                key={`orgUser${idx}`}
                actions={userRowActions(orgUser)}
                orgUser={orgUser}
              />
            );
          })}
        </div>
      </Panel>
    );
  }
  ;

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

export default withStyles(styleThunk)(OrgMembers);
