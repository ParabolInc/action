import {css} from 'aphrodite-local-styles/no-important'
import PropTypes from 'prop-types'
import React from 'react'
import {Link, withRouter} from 'react-router-dom'
import {destroy, reduxForm} from 'redux-form'
import LabeledFieldArray from 'universal/containers/LabeledFieldArray/LabeledFieldArrayContainer'
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere'
import InviteTeamMembersMutation from 'universal/mutations/InviteTeamMembersMutation'
import SendClientSegmentEventMutation from 'universal/mutations/SendClientSegmentEventMutation'
import withStyles from 'universal/styles/withStyles'
import makeStep3Schema from 'universal/validation/makeStep3Schema'
import RaisedButton from 'universal/components/RaisedButton'

const validate = (values) => {
  const schema = makeStep3Schema()
  return schema(values).errors
}

const Step3InviteeList = (props) => {
  const {
    atmosphere,
    dispatch,
    existingInvites,
    handleSubmit,
    invitees,
    history,
    styles,
    teamId
  } = props
  const onInviteTeamSubmit = () => {
    const inviteeCount = (invitees && invitees.length) || 0
    const gotoTeamDash = () => {
      history.push(`/team/${teamId}`)
    }

    if (inviteeCount > 0) {
      const serverInvitees = invitees.map((invitee) => {
        const {email, fullName} = invitee
        return {
          email,
          fullName
        }
      })
      // We shouldn't need to wait until this mutation completes, but relay flags softTeamMembers for GC & then reruns
      // the optimisticUpdater before the GC had a chance to clean it so it borks on the sentinel. Still a bug in v1.5.0.
      InviteTeamMembersMutation(
        atmosphere,
        {invitees: serverInvitees, teamId},
        dispatch,
        undefined,
        gotoTeamDash
      )
    } else {
      gotoTeamDash()
    }

    // loading that user dashboard is really expensive and causes dropped frames, so let's lighten the load
    setTimeout(() => {
      SendClientSegmentEventMutation(atmosphere, 'Welcome Step3 Completed', {
        inviteeCount
      })
      dispatch(destroy('welcomeWizard')) // bye bye form data!
    }, 1000)
  }

  const fieldArrayHasValue = invitees && invitees.length > 0
  if (fieldArrayHasValue) {
    return (
      <form onSubmit={handleSubmit(onInviteTeamSubmit)}>
        <div style={{margin: '2rem 0 0'}}>
          <LabeledFieldArray
            existingInvites={existingInvites}
            invitees={invitees}
            labelHeader='Invitees'
            labelSource='invitees'
          />
        </div>
        <div style={{margin: '2rem 0 0', textAlign: 'center'}}>
          <RaisedButton
            buttonSize='large'
            onMouseEnter={() => {
              // optimistically fetch the big ol payload
              import(/* webpackChunkName: 'TeamRoot' */ 'universal/modules/teamDashboard/components/TeamRoot')
            }}
            palette='warm'
          >
            {'Looks Good!'}
          </RaisedButton>
        </div>
      </form>
    )
  }
  return (
    <Link
      to={`/team/${teamId}`}
      className={css(styles.noThanks)}
      onMouseEnter={() => {
        import(/* webpackChunkName: 'TeamRoot' */ 'universal/modules/teamDashboard/components/TeamRoot')
      }}
      onClick={() => {
        SendClientSegmentEventMutation(atmosphere, 'Welcome Step3 Completed', {
          inviteeCount: 0
        })
      }}
      style={{margin: '1rem auto', maxWidth: '45.5rem', padding: '0 2.5rem'}}
      title='I’ll invite them later'
    >
      {'Not yet, I just want to kick the tires'}
    </Link>
  )
}

Step3InviteeList.propTypes = {
  atmosphere: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  existingInvites: PropTypes.array,
  handleSubmit: PropTypes.func.isRequired,
  invitees: PropTypes.array,
  history: PropTypes.object.isRequired,
  styles: PropTypes.object,
  teamId: PropTypes.string.isRequired
}
const styleThunk = () => ({
  noThanks: {
    display: 'inline-block',
    margin: '2rem 0',
    textAlign: 'right',
    textDecoration: 'none',
    width: '100%'
  }
})

export default withAtmosphere(
  reduxForm({
    form: 'welcomeWizard',
    destroyOnUnmount: false,
    validate
  })(withRouter(withStyles(styleThunk)(Step3InviteeList)))
)
