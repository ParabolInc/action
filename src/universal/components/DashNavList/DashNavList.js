import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import DashNavItem from '../Dashboard/DashNavItem';
import ui from 'universal/styles/ui';
import appTheme from 'universal/styles/theme/appTheme';
import FontAwesome from 'react-fontawesome';

const DashNavList = (props) => {
  const {organizations, teams, styles} = props;
  const hasTeams = teams.length > 0;
  const hasOrgs = organizations.length > 1;

  return (
    <div className={css(styles.root)}>
      {hasTeams ?
        <div>
          {teams.map((team) => {
            const {orgName} = organizations.find((org) => org.id === team.orgId) || {};
            return (
              <div key={`teamNav${team.id}`} className={css(styles.iconAndLink)}>
                {!team.isPaid && <FontAwesome name="warning" className={css(styles.itemIcon)} title="Team is disabled for nonpayment" />}
                <DashNavItem
                  href={`/team/${team.id}`}
                  isPaid={team.isPaid}
                  label={team.name}
                  orgLabel={hasOrgs ? orgName : ''}
                />
              </div>
            );
          })
        }
        </div> :
        <div className={css(styles.emptyTeams)}>It appears you are not a member of any team!</div>
      }
    </div>
  );
};

DashNavList.propTypes = {
  styles: PropTypes.object,
  organizations: PropTypes.array,
  teams: PropTypes.arrayOf(
    PropTypes.shape({
      href: PropTypes.string,
      label: PropTypes.string
    })
  )
};

const styleThunk = () => ({
  root: {
    width: '100%'
  },

  emptyTeams: {
    fontSize: appTheme.typography.sBase,
    fontStyle: 'italic',
    padding: '0 0 .125rem 1rem'
  },

  iconAndLink: {
    alignItems: 'center',
    display: 'flex',
    position: 'relative'
  },

  itemIcon: {
    color: appTheme.palette.light,
    fontSize: `${ui.iconSize} !important`,
    position: 'absolute',
    right: '100%',
    textAlign: 'center',
    width: 24
  }
});

export default withStyles(styleThunk)(DashNavList);
