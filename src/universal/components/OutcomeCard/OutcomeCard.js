import React, {Component, PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import {cashay} from 'cashay';
import {Field, reduxForm, initialize} from 'redux-form';
import theme from 'universal/styles/theme';
import labels from 'universal/styles/theme/labels';
import projectStatusStyles from 'universal/styles/helpers/projectStatusStyles';
import TayaAvatar from 'universal/styles/theme/images/avatars/taya-mueller-avatar.jpg';
import fromNow from 'universal/utils/fromNow';
import {editingSetCurrent, editingClearCurrent, editingClearFocus} from 'universal/redux/editingDuck';

import OutcomeCardTextarea from './OutcomeCardTextarea';
import OutcomeCardFooter from './OutcomeCardFooter';
import OutcomeCardAssignMenu from './OutcomeCardAssignMenu';
import OutcomeCardStatusMenu from './OutcomeCardStatusMenu';

const OPEN_CONTENT_MENU = 'OutcomeCard/openContentMenu';
const OPEN_ASSIGN_MENU = 'OutcomeCard/openAssignMenu';
const OPEN_STATUS_MENU = 'OutcomeCard/openStatusMenu';

const combineStyles = StyleSheet.combineStyles;
let styles = {};

@reduxForm()
@look
export default class OutcomeCard extends Component {
  constructor(props) {
    super(props);

    let openMenu = OPEN_CONTENT_MENU;
    if (props.hasOpenAssignMenu) {
      openMenu = OPEN_ASSIGN_MENU;
    } else if (props.hasOpenStatusMenu) {
      openMenu = OPEN_STATUS_MENU;
    }

    // state drives visibility of differing form elements, like assign menu:
    this.state = {openMenu};
  }

  componentWillMount() {
    this.initializeValues(this.props.content);
  }

  componentWillReceiveProps(nextProps) {
    const {content} = this.props;
    const nextContent = nextProps.content;
    if (nextContent !== content) {
      this.initializeValues(nextContent);
    }
  }

  initializeValues(content) {
    const {dispatch, form, projectId} = this.props;
    dispatch(initialize(form, {[projectId]: content}));
  }

  toggleStatusMenu(nextOpenMenu) {
    const {openMenu} = this.state;
    nextOpenMenu = nextOpenMenu ||
      openMenu === OPEN_STATUS_MENU ? OPEN_CONTENT_MENU : OPEN_STATUS_MENU;
    this.setState({openMenu: nextOpenMenu});
  }

  toggleAssignMenu(nextOpenMenu) {
    const {openMenu} = this.state;
    nextOpenMenu = nextOpenMenu ||
      openMenu === OPEN_ASSIGN_MENU ? OPEN_CONTENT_MENU : OPEN_ASSIGN_MENU;
    this.setState({openMenu: nextOpenMenu});
  }

  render() {
    const {openMenu} = this.state;
    const {
      content,
      dispatch,
      editing,
      owner,
      teamId,
      teamMembers,
      teamMemberId,
      status,
      isArchived,
      isProject,
      updatedAt,
      projectId,
      handleSubmit,
      showByTeam
    } = this.props;
    const normalizedProjectId = `Task::${projectId}`;
    const autoFocus = editing.focus === normalizedProjectId;
    const editingMe = editing.current && editing.current[normalizedProjectId] || [];
    const hasOpenStatusMenu = openMenu === OPEN_STATUS_MENU;
    const hasOpenAssignMenu = openMenu === OPEN_ASSIGN_MENU;
    let rootStyles;
    const rootStyleOptions = [styles.root, styles.cardBlock];
    if (isProject) {
      rootStyleOptions.push(styles[status]);
    } else {
      rootStyleOptions.push(styles.isAction);
    }
    rootStyles = combineStyles.apply(null, rootStyleOptions);

    const handleCardActive = (activeState) => {
      if (activeState === undefined) { return; }
      if (activeState) {
        dispatch(editingSetCurrent(teamId, normalizedProjectId));
      } else {
        dispatch(editingClearCurrent(teamId));
      }
    };

    const handleCardUpdate = (submittedData) => {
      const submittedContent = submittedData[projectId];
      if (submittedContent !== content) {
        const options = {
          variables: {
            updatedTask: {
              id: projectId,
              content: submittedContent
            }
          }
        };
        cashay.mutate('updateTask', options);
        if (autoFocus) {
          dispatch(editingClearFocus());
        }
      }
    };

    return (
      <div className={rootStyles}>
        {/* card main */}
        {hasOpenAssignMenu &&
          <OutcomeCardAssignMenu
            currentOwner={owner}
            projectId={projectId}
            teamMembers={teamMembers}
            onComplete={() => this.toggleAssignMenu(OPEN_CONTENT_MENU)}
          />
        }
        {hasOpenStatusMenu &&
          <OutcomeCardStatusMenu
            isArchived={isArchived}
            projectId={projectId}
            status={status}
          />
        }
        {!hasOpenAssignMenu && !hasOpenStatusMenu &&
          <div className={styles.body}>
            <form>
              <Field
                name={projectId}
                autoFocus={autoFocus}
                component={OutcomeCardTextarea}
                editingMe={editingMe}
                isProject={isProject}
                showByTeam={showByTeam}
                teamMemberId={teamMemberId}
                teamMembers={teamMembers}
                timestamp={fromNow(updatedAt)}
                handleActive={handleCardActive}
                handleSubmit={handleSubmit(handleCardUpdate)}
              />
            </form>
          </div>
        }
        {/* card footer */}
        <OutcomeCardFooter
          hasOpenAssignMenu={hasOpenAssignMenu}
          hasOpenStatusMenu={hasOpenStatusMenu}
          toggleAssignMenu={() => this.toggleAssignMenu()}
          toggleStatusMenu={() => this.toggleStatusMenu()}
          {...this.props}
        />
      </div>
    );
  }
}

OutcomeCard.propTypes = {
  content: PropTypes.string,
  dispatch: PropTypes.func.isRequired,
  editing: PropTypes.shape({
    current: PropTypes.object.isRequired,
    focus: PropTypes.string
  }).isRequired,
  status: PropTypes.oneOf(labels.projectStatus.slugs),
  hasOpenAssignMenu: PropTypes.bool,
  hasOpenStatusMenu: PropTypes.bool,
  isArchived: PropTypes.bool,
  isProject: PropTypes.bool,
  owner: PropTypes.object,
  teamId: PropTypes.string,
  teamMemberId: PropTypes.string,
  teamMembers: PropTypes.array,
  showByTeam: PropTypes.bool,
  updatedAt: PropTypes.instanceOf(Date),
  projectId: PropTypes.string,
  handleSubmit: PropTypes.func,
  form: PropTypes.string
};

OutcomeCard.defaultProps = {
  status: labels.projectStatus.active.slug,
  hasOpenAssignMenu: false,
  hasOpenStatusMenu: false,
  isArchived: false,
  isProject: true,
  owner: {
    preferredName: 'Taya Mueller',
    picture: TayaAvatar
  },
  team: {
    preferredName: 'Engineering',
    picture: 'https://placekitten.com/g/24/24'
  },
  showByTeam: false
};

styles = StyleSheet.create({
  root: {
    backgroundColor: '#fff',
    border: `1px solid ${theme.palette.mid30l}`,
    borderRadius: '.5rem',
    borderTop: `.25rem solid ${theme.palette.mid}`,
    maxWidth: '20rem',
    width: '100%'
  },

  cardBlock: {
    marginBottom: '1rem',
    width: '100%'
  },

  body: {
    // TODO: set minHeight? (TA)
    width: '100%'
  },

  isAction: {
    backgroundColor: theme.palette.light50l
  },

  // Status theme colors

  ...projectStatusStyles('borderTopColor')
});
