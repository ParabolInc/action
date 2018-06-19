import PropTypes from 'prop-types'
import React from 'react'
import portal from 'react-portal-hoc'
import Type from 'universal/components/Type/Type'
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere'
import RemoveOrgUserMutation from 'universal/mutations/RemoveOrgUserMutation'
import withMutationProps from 'universal/utils/relay/withMutationProps'
import {withRouter} from 'react-router-dom'
import DashModal from 'universal/components/Dashboard/DashModal'
import FlatButton from 'universal/components/FlatButton'
import IconLabel from 'universal/components/IconLabel'
import styled from 'react-emotion'

const StyledButton = styled(FlatButton)({
  marginTop: '1.5rem'
})

const LeaveOrgModal = (props) => {
  const {
    atmosphere,
    closeAfter,
    closePortal,
    history,
    location,
    isClosing,
    submitting,
    submitMutation,
    onCompleted,
    onError,
    orgId,
    userId
  } = props
  const handleClick = () => {
    submitMutation()
    RemoveOrgUserMutation(atmosphere, {orgId, userId}, {history, location}, onError, onCompleted)
  }
  return (
    <DashModal
      closeAfter={closeAfter}
      closePortal={closePortal}
      isClosing={isClosing}
      onBackdropClick={closePortal}
    >
      <Type align='center' bold marginBottom='1.5rem' scale='s5' colorPalette='dark'>
        {'Are you sure?'}
      </Type>
      <Type align='center' marginBottom='1.5rem' scale='s3'>
        {'This will remove you from the organization and all teams under it! '}
        <br />
        {'To undo it, you’ll have to ask another Billing Leader to re-add you.'}
      </Type>
      <StyledButton size='large' onClick={handleClick} palette='warm' waiting={submitting}>
        <IconLabel icon='arrow-circle-right' iconAfter label='Leave the organization' />
      </StyledButton>
    </DashModal>
  )
}

LeaveOrgModal.propTypes = {
  atmosphere: PropTypes.object.isRequired,
  closeAfter: PropTypes.number,
  closePortal: PropTypes.func,
  isClosing: PropTypes.bool,
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  orgId: PropTypes.string.isRequired,
  userId: PropTypes.string.isRequired,
  submitting: PropTypes.bool,
  submitMutation: PropTypes.func.isRequired,
  onCompleted: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired
}

export default withRouter(
  withAtmosphere(withMutationProps(portal({escToClose: true, closeAfter: 100})(LeaveOrgModal)))
)
