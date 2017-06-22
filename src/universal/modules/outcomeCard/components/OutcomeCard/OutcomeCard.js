import PropTypes from 'prop-types';
import React from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import {cardRootStyles} from 'universal/styles/helpers';
import appTheme from 'universal/styles/theme/appTheme';
import labels from 'universal/styles/theme/labels';
import {ACTIVE, STUCK, DONE, FUTURE, USER_DASH} from 'universal/utils/constants';
import {cardBorderTop} from 'universal/styles/helpers';
import EditingStatusContainer from 'universal/containers/EditingStatus/EditingStatusContainer';
import OutcomeCardFooter from 'universal/modules/outcomeCard/components/OutcomeCardFooter/OutcomeCardFooter';
import OutcomeCardAssignMenu from 'universal/modules/outcomeCard/components/OutcomeCardAssignMenu/OutcomeCardAssignMenu';
import OutcomeCardStatusMenu from 'universal/modules/outcomeCard/components/OutcomeCardStatusMenu/OutcomeCardStatusMenu';
import isProjectPrivate from 'universal/utils/isProjectPrivate';
import isProjectArchived from 'universal/utils/isProjectArchived';
import ProjectEditor from 'universal/components/ProjectEditor/ProjectEditor';
import ui from 'universal/styles/ui';
import TitleInput from 'universal/modules/outcomeCard/components/TitleInput/TitleInput';


const OutcomeCard = (props) => {
  const {
    annouceEditing,
    area,
    editorRef,
    isAgenda,
    isEditing,
    handleCardUpdate,
    hasHover,
    hoverOn,
    hoverOff,
    openArea,
    openMenu,
    outcome,
    setEditorRef,
    setEditorState,
    setTitleRef,
    setTitleValue,
    styles,
    teamMembers,
    editorState,
    titleRef,
    titleValue,
    unarchiveProject,
    isDragging
  } = props;
  const isPrivate = isProjectPrivate(outcome.tags);
  const isArchived = isProjectArchived(outcome.tags);
  const {status} = outcome;
  const rootStyles = css(
    styles.root,
    styles.cardBlock,
    styles[status],
    isPrivate && styles.isPrivate,
    isArchived && styles.isArchived
  );
  const openContentMenu = openMenu('content');

  return (
    <div className={rootStyles} onMouseEnter={hoverOn} onMouseLeave={hoverOff}>
      {openArea === 'assign' &&
        <OutcomeCardAssignMenu
          onComplete={openContentMenu}
          outcome={outcome}
          teamMembers={teamMembers}
        />
      }
      {openArea === 'status' &&
        <OutcomeCardStatusMenu
          editorState={editorState}
          isAgenda={isAgenda}
          onComplete={openContentMenu}
          outcome={outcome}
        />
      }
      {openArea === 'content' &&
        <div className={css(styles.content)}>
          <EditingStatusContainer
            isEditing={isEditing}
            outcomeId={outcome.id}
            updatedAt={outcome.updatedAt}
          />
          <TitleInput
            annouceEditing={annouceEditing}
            editorRef={editorRef}
            handleCardUpdate={handleCardUpdate}
            setTitleRef={setTitleRef}
            setTitleValue={setTitleValue}
            titleRef={titleRef}
            titleValue={titleValue}

          />
          <ProjectEditor
            editorRef={editorRef}
            editorState={editorState}
            onBlur={handleCardUpdate}
            isDragging={isDragging}
            setEditorRef={setEditorRef}
            setEditorState={setEditorState}
            teamMembers={teamMembers}
            titleRef={titleRef}
          />
        </div>
      }
      <OutcomeCardFooter
        cardHasHover={hasHover}
        hasOpenStatusMenu={openArea === 'status'}
        isPrivate={isPrivate}
        outcome={outcome}
        showTeam={area === USER_DASH}
        toggleAssignMenu={openMenu('assign')}
        toggleStatusMenu={openMenu('status')}
        unarchiveProject={unarchiveProject}
      />
    </div>
  );
};

OutcomeCard.propTypes = {
  annouceEditing: PropTypes.func.isRequired,
  area: PropTypes.string,
  editorRef: PropTypes.any,
  editorState: PropTypes.object,
  handleCardUpdate: PropTypes.func,
  hasHover: PropTypes.bool,
  hoverOn: PropTypes.func,
  hoverOff: PropTypes.func,
  isAgenda: PropTypes.bool,
  isDragging: PropTypes.bool,
  isEditing: PropTypes.bool,
  openArea: PropTypes.string,
  openMenu: PropTypes.func,
  outcome: PropTypes.shape({
    id: PropTypes.string,
    content: PropTypes.string,
    status: PropTypes.oneOf(labels.projectStatus.slugs),
    teamMemberId: PropTypes.string,
    updatedAt: PropTypes.instanceOf(Date)
  }),
  setTitleRef: PropTypes.func.isRequired,
  setTitleValue: PropTypes.func.isRequired,
  setEditorRef: PropTypes.func.isRequired,
  setEditorState: PropTypes.func,
  styles: PropTypes.object,
  teamMembers: PropTypes.array,
  titleRef: PropTypes.any,
  titleValue: PropTypes.string,
  unarchiveProject: PropTypes.func.isRequired
};

const styleThunk = () => ({
  root: {
    ...cardRootStyles,
    outline: 'none',
    paddingTop: '.1875rem',

    '::after': {
      ...cardBorderTop
    }
  },

  [ACTIVE]: {
    '::after': {
      color: labels.projectStatus[ACTIVE].color
    }
  },

  [STUCK]: {
    '::after': {
      color: labels.projectStatus[STUCK].color
    }
  },

  [DONE]: {
    '::after': {
      color: labels.projectStatus[DONE].color
    }
  },

  [FUTURE]: {
    '::after': {
      color: labels.projectStatus[FUTURE].color
    }
  },

  // TODO: Cards need block containers, not margin (TA)
  cardBlock: {
    marginBottom: '.5rem'
  },

  content: {
    padding: `0 ${ui.cardPaddingBase}`
  },

  isPrivate: {
    backgroundColor: appTheme.palette.light50l
  },

  isArchived: {
    '::after': {
      color: labels.archived.color
    }
  }
});

export default withStyles(styleThunk)(OutcomeCard);
