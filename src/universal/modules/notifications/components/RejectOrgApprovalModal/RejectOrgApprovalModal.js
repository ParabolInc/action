import PropTypes from 'prop-types'
import React from 'react'
import portal from 'react-portal-hoc'
import {Field, reduxForm, SubmissionError} from 'redux-form'
import TextAreaField from 'universal/components/TextAreaField/TextAreaField'
import Type from 'universal/components/Type/Type'
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere'
import RejectOrgApprovalMutation from 'universal/mutations/RejectOrgApprovalMutation'
import ui from 'universal/styles/ui'
import rejectOrgApprovalValidation from './rejectOrgApprovalValidation'
import getGraphQLError from 'universal/utils/relay/getGraphQLError'
import styled, {css} from 'react-emotion'
import FormError from 'universal/components/FormError/FormError'
import RaisedButton from 'universal/components/RaisedButton'
import DashModal from 'universal/components/Dashboard/DashModal'

const StyledButton = styled(RaisedButton)({...ui.buttonBlockStyles})

const validate = (values) => {
  const schema = rejectOrgApprovalValidation()
  return schema(values).errors
}

const RejectOrgApprovalModal = (props) => {
  const {
    atmosphere,
    closeAfter,
    closePortal,
    error,
    handleSubmit,
    isClosing,
    notificationId,
    inviteeEmail,
    inviterName,
    submitting
  } = props
  const onSubmit = (submissionData) => {
    return new Promise((resolve, reject) => {
      const schema = rejectOrgApprovalValidation()
      const {
        data: {reason}
      } = schema(submissionData)
      const variables = {reason, notificationId}
      const onError = (err) => {
        reject(new SubmissionError({_error: err}))
      }
      const onCompleted = (res, errors) => {
        const graphQLError = getGraphQLError(res, errors)
        if (graphQLError) {
          onError(graphQLError)
        } else {
          resolve()
          closePortal()
        }
      }
      RejectOrgApprovalMutation(atmosphere, variables, onError, onCompleted)
    })
  }
  return (
    <DashModal
      closeAfter={closeAfter}
      closePortal={closePortal}
      isClosing={isClosing}
      onBackdropClick={closePortal}
    >
      <Type align='center' bold marginBottom='.5rem' scale='s6' colorPalette='mid'>
        {'Care to say why?'}
      </Type>
      <Type align='center' marginBottom='1rem' scale='sBase' colorPalette='dark'>
        {'Type a response below and '}
        <br />
        {`we’ll pass it along to ${inviterName}.`}
      </Type>
      <form onSubmit={handleSubmit(onSubmit)}>
        {error && <FormError>{error.message}</FormError>}
        <Field component={TextAreaField} name='reason' placeholder='Comment' />
        <div className={css({marginTop: '1rem'})}>
          <StyledButton
            aria-label={`Reject ${inviteeEmail} from the organization`}
            onClick={handleSubmit(onSubmit)}
            palette='warm'
            size={ui.modalButtonSize}
            waiting={submitting}
          >
            {`Reject ${inviteeEmail}`}
          </StyledButton>
        </div>
      </form>
    </DashModal>
  )
}

RejectOrgApprovalModal.propTypes = {
  atmosphere: PropTypes.object.isRequired,
  closeAfter: PropTypes.number.isRequired,
  closePortal: PropTypes.func.isRequired,
  error: PropTypes.any,
  handleSubmit: PropTypes.func.isRequired,
  isClosing: PropTypes.bool,
  inviteeEmail: PropTypes.string,
  inviterName: PropTypes.string,
  notificationId: PropTypes.string.isRequired,
  submitting: PropTypes.bool
}

export default portal({escToClose: true, closeAfter: 100})(
  withAtmosphere(reduxForm({form: 'rejectOrgApproval', validate})(RejectOrgApprovalModal))
)
