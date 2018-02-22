import {css} from 'aphrodite-local-styles/no-important';
import PropTypes from 'prop-types';
import React from 'react';
import FontAwesome from 'react-fontawesome';
import {createFragmentContainer} from 'react-relay';
import {Link} from 'react-router-dom';
import {
  DashSectionControl, DashSectionControls, DashSectionHeader,
  DashSectionHeading
} from 'universal/components/Dashboard';
import DashFilterToggle from 'universal/components/DashFilterToggle/DashFilterToggle';
import {Menu, MenuItem} from 'universal/modules/menu';
import {filterTeamMember} from 'universal/modules/teamDashboard/ducks/teamDashDuck';
import ib from 'universal/styles/helpers/ib';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import withStyles from 'universal/styles/withStyles';

const iconStyle = {
  ...ib,
  margin: '0 .5rem 0 0'
};

const inlineBlock = {
  display: 'inline-block',
  height: ui.dashSectionHeaderLineHeight,
  lineHeight: ui.dashSectionHeaderLineHeight,
  verticalAlign: 'middle'
};

const originAnchor = {
  vertical: 'bottom',
  horizontal: 'right'
};

const targetAnchor = {
  vertical: 'top',
  horizontal: 'right'
};

const TeamTasksHeader = (props) => {
  const {dispatch, styles, teamMemberFilterId, teamMemberFilterName, team} = props;
  const {teamId, teamMembers} = team;
  const toggle = <DashFilterToggle label={teamMemberFilterName} />;

  const itemFactory = () => {
    return [<MenuItem
      isActive={teamMemberFilterId === null}
      key={'teamMemberFilterNULL'}
      label={'All members'}
      onClick={() => dispatch(filterTeamMember(null))}
    />].concat(
      teamMembers.map((teamMember) =>
        (<MenuItem
          isActive={teamMember.id === teamMemberFilterId}
          key={`teamMemberFilter${teamMember.id}`}
          label={teamMember.preferredName}
          onClick={() => dispatch(filterTeamMember(teamMember.id, teamMember.preferredName))}
        />)
      ));
  };
  return (
    <DashSectionHeader>
      <DashSectionHeading icon="calendar" label="Team Tasks" />
      <DashSectionControls>
        {/* TODO: needs link to archive */}
        <DashSectionControl>
          <FontAwesome name="archive" style={iconStyle} />
          <Link className={css(styles.link)} to={`/team/${teamId}/archive`}>
            See Archived Tasks
          </Link>
        </DashSectionControl>
        {/* TODO: needs minimal, inline dropdown */}
        <DashSectionControl>
          <div className={css(styles.filterRow)}>
            <b style={inlineBlock}>{'Show Tasks for'}</b><span style={inlineBlock}>:</span>
            {' '}
            <Menu
              itemFactory={itemFactory}
              label="Filter by:"
              maxHeight={ui.dashMenuHeight}
              toggle={toggle}
              originAnchor={originAnchor}
              targetAnchor={targetAnchor}
            />
          </div>
        </DashSectionControl>
      </DashSectionControls>
    </DashSectionHeader>
  );
};

TeamTasksHeader.propTypes = {
  children: PropTypes.any,
  dispatch: PropTypes.func.isRequired,
  styles: PropTypes.object,
  team: PropTypes.object.isRequired,
  teamMemberFilterId: PropTypes.string,
  teamMemberFilterName: PropTypes.string
};

const styleThunk = () => ({
  button: {
    ...inlineBlock,
    color: appTheme.palette.mid,

    ':hover': {
      color: appTheme.palette.dark
    },
    ':focus': {
      color: appTheme.palette.dark
    }
  },

  filterRow: {
    display: 'flex',
    justifyContent: 'flex-end'
  },

  link: {
    ...ib,
    color: appTheme.palette.mid,

    ':hover': {
      color: appTheme.palette.dark
    },
    ':focus': {
      color: appTheme.palette.dark
    }
  }
});

export default createFragmentContainer(
  withStyles(styleThunk)(TeamTasksHeader),
  graphql`
    fragment TeamTasksHeader_team on Team {
      teamId: id
      teamMembers(sortBy: "preferredName") {
        id
        preferredName
      }
    }
  `
);
