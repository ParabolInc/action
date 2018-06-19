import PropTypes from 'prop-types'
import React from 'react'
import InputField from 'universal/components/InputField/InputField'
import {Field, reduxForm, arrayPush, change} from 'redux-form'
import {randomPlaceholderTheme} from 'universal/utils/makeRandomPlaceholder'
import makeStep3RawSchema from 'universal/validation/makeStep3RawSchema'
import {updateExistingInvites} from 'universal/modules/welcome/ducks/welcomeDuck'
import withStyles from 'universal/styles/withStyles'
import {css} from 'aphrodite-local-styles/no-important'
import WelcomeSubmitButton from 'universal/modules/welcome/components/WelcomeSubmitButton/WelcomeSubmitButton'
import parseEmailAddressList from 'universal/utils/parseEmailAddressList'

const validate = (values) => {
  const schema = makeStep3RawSchema()
  return schema(values).errors
}

const Step3RawInvitees = (props) => {
  const {dispatch, handleSubmit, invitees = [], inviteesRaw, untouch, styles, submitting} = props

  const onAddInviteesButtonClick = () => {
    const parsedAddresses = parseEmailAddressList(inviteesRaw)
    // clear the inviteesRaw form component:
    dispatch(change('welcomeWizardRawInvitees', 'inviteesRaw', ''))
    if (!parsedAddresses) {
      return
    }
    const uniqueEmails = new Set()
    const distinctParsedAddresses = parsedAddresses.reduce((set, email) => {
      if (!uniqueEmails.has(email.address)) {
        uniqueEmails.add(email.address)
        set.push(email)
      }
      return set
    }, [])
    const inviteeEmails = invitees.map((i) => i.email)
    const existingInvites = []
    distinctParsedAddresses.forEach((email, idx) => {
      if (inviteeEmails.includes(email.address)) {
        // highlight that email then fade
        existingInvites.push(idx)
      } else {
        dispatch(
          arrayPush('welcomeWizard', 'invitees', {
            email: email.address,
            fullName: email.name,
            label: email.name ? `"${email.name}" <${email.address}>` : email.address
          })
        )
      }
    })
    if (existingInvites.length) {
      dispatch(updateExistingInvites(existingInvites))
    }
    untouch('inviteesRaw')
  }
  return (
    <form className={css(styles.formBlock)} onSubmit={handleSubmit(onAddInviteesButtonClick)}>
      <Field
        autoFocus={!invitees || invitees.length === 0}
        component={InputField}
        isLarger
        isWider
        name='inviteesRaw'
        placeholder={randomPlaceholderTheme.emailMulti}
        type='text'
        underline
      />
      <WelcomeSubmitButton
        disabled={!inviteesRaw}
        onClick={handleSubmit(onAddInviteesButtonClick)}
        waiting={submitting}
      />
    </form>
  )
}

Step3RawInvitees.propTypes = {
  dispatch: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  invitees: PropTypes.array,
  inviteesRaw: PropTypes.string,
  untouch: PropTypes.func.isRequired,
  styles: PropTypes.object,
  submitting: PropTypes.bool
}

const styleThunk = () => ({
  formBlock: {
    alignItems: 'baseline',
    display: 'flex',
    margin: '0 auto',
    maxWidth: '100%',
    paddingLeft: '2.5rem',
    width: '45.5rem'
  }
})

const formOptions = {
  form: 'welcomeWizardRawInvitees',
  validate
}

export default reduxForm(formOptions)(withStyles(styleThunk)(Step3RawInvitees))
