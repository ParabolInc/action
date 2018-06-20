import {css} from 'aphrodite-local-styles/no-important'
import PropTypes from 'prop-types'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import TaskEditor from 'universal/components/TaskEditor/TaskEditor'
import TaskIntegrationLink from 'universal/components/TaskIntegrationLink'
import TaskWatermark from 'universal/components/TaskWatermark'
import EditingStatusContainer from 'universal/containers/EditingStatus/EditingStatusContainer'
import OutcomeCardFooter from 'universal/modules/outcomeCard/components/OutcomeCardFooter/OutcomeCardFooter'
import OutcomeCardStatusIndicator from 'universal/modules/outcomeCard/components/OutcomeCardStatusIndicator/OutcomeCardStatusIndicator'
import labels from 'universal/styles/theme/labels'
import ui from 'universal/styles/ui'
import withStyles from 'universal/styles/withStyles'
import isTaskArchived from 'universal/utils/isTaskArchived'
import isTaskPrivate from 'universal/utils/isTaskPrivate'
import isTempId from 'universal/utils/relay/isTempId'
import cardRootStyles from 'universal/styles/helpers/cardRootStyles'

const OutcomeCard = (props) => {
  const {
    area,
    cardHasFocus,
    cardHasHover,
    cardHasMenuOpen,
    editorRef,
    editorState,
    isAgenda,
    isDragging,
    isEditing,
    handleAddTask,
    hasDragStyles,
    task,
    setEditorRef,
    setEditorState,
    trackEditingComponent,
    styles,
    toggleMenuState
  } = props
  const isPrivate = isTaskPrivate(task.tags)
  const isArchived = isTaskArchived(task.tags)
  const {status, team} = task
  const {teamId} = team
  const rootStyles = css(
    styles.root,
    styles.cardBlock,
    // hover before focus, it matters
    cardHasHover && styles.cardHasHover,
    cardHasFocus && styles.cardHasFocus,
    hasDragStyles && styles.hasDragStyles
  )
  const {integration, taskId} = task
  const {service} = integration || {}
  const statusTitle = `Card status: ${labels.taskStatus[status].label}`
  const privateTitle = ', marked as #private'
  const archivedTitle = ', set as #archived'
  const statusIndicatorTitle = `${statusTitle}${isPrivate ? privateTitle : ''}${
    isArchived ? archivedTitle : ''
  }`
  const cardIsActive = cardHasFocus || cardHasHover || cardHasMenuOpen
  return (
    <div className={rootStyles}>
      <TaskWatermark service={service} />
      <div className={css(styles.contentBlock)}>
        <div className={css(styles.cardTopMeta)}>
          <div className={css(styles.statusIndicatorBlock)} title={statusIndicatorTitle}>
            <OutcomeCardStatusIndicator status={status} />
            {isPrivate && <OutcomeCardStatusIndicator status='private' />}
            {isArchived && <OutcomeCardStatusIndicator status='archived' />}
          </div>
          <EditingStatusContainer
            cardIsActive={cardIsActive}
            isEditing={isEditing}
            task={task}
            toggleMenuState={toggleMenuState}
          />
        </div>
        <TaskEditor
          editorRef={editorRef}
          editorState={editorState}
          readOnly={Boolean(isTempId(taskId) || isArchived || isDragging || service)}
          setEditorRef={setEditorRef}
          setEditorState={setEditorState}
          trackEditingComponent={trackEditingComponent}
          teamId={teamId}
          team={team}
        />
        <TaskIntegrationLink integration={integration || null} />
        <OutcomeCardFooter
          area={area}
          cardIsActive={cardIsActive}
          editorState={editorState}
          handleAddTask={handleAddTask}
          isAgenda={isAgenda}
          isPrivate={isPrivate}
          task={task}
          toggleMenuState={toggleMenuState}
        />
      </div>
    </div>
  )
}

OutcomeCard.propTypes = {
  area: PropTypes.string,
  editorRef: PropTypes.any,
  editorState: PropTypes.object,
  cardHasHover: PropTypes.bool,
  cardHasFocus: PropTypes.bool,
  cardHasMenuOpen: PropTypes.bool,
  cardHasIntegration: PropTypes.bool,
  handleAddTask: PropTypes.func,
  hasDragStyles: PropTypes.bool,
  isAgenda: PropTypes.bool,
  isDragging: PropTypes.bool,
  isEditing: PropTypes.bool,
  task: PropTypes.object.isRequired,
  setEditorRef: PropTypes.func.isRequired,
  setEditorState: PropTypes.func,
  trackEditingComponent: PropTypes.func,
  styles: PropTypes.object,
  teamMembers: PropTypes.array,
  toggleMenuState: PropTypes.func.isRequired
}

const styleThunk = () => ({
  root: {
    ...cardRootStyles,
    borderTop: 0,
    outline: 'none',
    padding: `${ui.cardPaddingBase} 0 0`,
    transition: `box-shadow ${ui.transition[0]}`
  },

  // hover before focus, it matters

  cardHasHover: {
    boxShadow: ui.shadow[1]
  },

  cardHasFocus: {
    boxShadow: ui.shadow[2]
  },

  hasDragStyles: {
    boxShadow: 'none'
  },

  cardBlock: {
    marginBottom: '.625rem'
  },

  cardTopMeta: {
    paddingBottom: '.5rem'
  },

  statusIndicatorBlock: {
    display: 'flex',
    paddingLeft: ui.cardPaddingBase
  },

  contentBlock: {
    position: 'relative',
    zIndex: ui.ziMenu - 1
  }
})

export default createFragmentContainer(
  withStyles(styleThunk)(OutcomeCard),
  graphql`
    fragment OutcomeCard_task on Task {
      taskId: id
      integration {
        service
        ...TaskIntegrationLink_integration
      }
      status
      tags
      team {
        teamId: id
      }
      # grab userId to ensure sorting on connections works
      userId
      ...EditingStatusContainer_task
      ...OutcomeCardFooter_task
    }
  `
)
