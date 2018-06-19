import {css} from 'aphrodite-local-styles/no-important'
import PropTypes from 'prop-types'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {withRouter} from 'react-router-dom'
import PrimaryButton from 'universal/components/PrimaryButton'
import LabelHeading from 'universal/components/LabelHeading/LabelHeading'
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere'
import CopyShortLink from 'universal/modules/meeting/components/CopyShortLink/CopyShortLink'
import MeetingMain from 'universal/modules/meeting/components/MeetingMain/MeetingMain'
import MeetingPhaseHeading from 'universal/modules/meeting/components/MeetingPhaseHeading/MeetingPhaseHeading'
import MeetingCopy from 'universal/modules/meeting/components/MeetingCopy/MeetingCopy'
import actionMeeting from 'universal/modules/meeting/helpers/actionMeeting'
import StartMeetingMutation from 'universal/mutations/StartMeetingMutation'
import appTheme from 'universal/styles/theme/appTheme'
import ui from 'universal/styles/ui'
import withStyles from 'universal/styles/withStyles'
import makeHref from 'universal/utils/makeHref'
import withMutationProps from 'universal/utils/relay/withMutationProps'
import {LOBBY} from 'universal/utils/constants'

const MeetingLobby = (props) => {
  const {
    atmosphere,
    history,
    onError,
    onCompleted,
    submitMutation,
    submitting,
    team,
    styles
  } = props
  const {teamId, teamName} = team
  const onStartMeetingClick = () => {
    submitMutation()
    StartMeetingMutation(atmosphere, teamId, history, onError, onCompleted)
  }
  const meetingUrl = makeHref(`/meeting/${teamId}`)
  return (
    <MeetingMain hasHelpFor={LOBBY}>
      {/* */}
      <div className={css(styles.root)}>
        <LabelHeading>{'Welcome to the Meeting Lobby'}</LabelHeading>
        <MeetingPhaseHeading>{`Hi, ${teamName} Team!`}</MeetingPhaseHeading>
        <MeetingCopy>{'Is the whole team here?'}</MeetingCopy>
        <MeetingCopy>
          {'The person who presses “Start Meeting” will be today’s Facilitator.'}
          <br />
          {'Everyone’s display automatically follows the Facilitator.'}
        </MeetingCopy>
        <MeetingCopy>
          <b>{'Today’s Facilitator'}</b>
          {`: begin the ${actionMeeting.checkin.name}!`}
        </MeetingCopy>
        <div className={css(styles.buttonBlock)}>
          <PrimaryButton onClick={onStartMeetingClick} size='large' waiting={submitting}>
            Start Action Meeting
          </PrimaryButton>
        </div>
        <div className={css(styles.urlBlock)}>
          <CopyShortLink url={meetingUrl} />
        </div>
      </div>
      {/* */}
    </MeetingMain>
  )
}

MeetingLobby.propTypes = {
  atmosphere: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  styles: PropTypes.object,
  team: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string
  }),
  submitting: PropTypes.bool,
  submitMutation: PropTypes.func.isRequired,
  onCompleted: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired
}

const styleThunk = () => ({
  root: {
    paddingLeft: ui.meetingSplashGutter,
    paddingTop: '2rem',
    textAlign: 'left',

    [ui.breakpoint.wide]: {
      paddingTop: '3rem'
    },
    [ui.breakpoint.wider]: {
      paddingTop: '4rem'
    },
    [ui.breakpoint.widest]: {
      paddingTop: '6rem'
    }
  },

  helpText: {
    color: appTheme.palette.dark,
    fontSize: appTheme.typography.s2,
    fontWeight: 400,
    lineHeight: 1.5,
    margin: '1.75rem 0 0'
  },

  buttonBlock: {
    margin: '0',
    paddingTop: '2.25rem',
    width: '13rem'
  },

  urlBlock: {
    margin: '3rem 0 0',
    display: 'inline-block',
    verticalAlign: 'middle'
  }
})

export default createFragmentContainer(
  withRouter(withAtmosphere(withMutationProps(withStyles(styleThunk)(MeetingLobby)))),
  graphql`
    fragment MeetingLobby_team on Team {
      teamId: id
      teamName: name
    }
  `
)
