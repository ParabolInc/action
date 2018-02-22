import {css} from 'aphrodite-local-styles';
import PropTypes from 'prop-types';
import React from 'react';
import {createFragmentContainer} from 'react-relay';
import AsyncComponent from 'universal/components/AsyncComponent';
import typePicker from 'universal/modules/notifications/helpers/typePicker';
import formError from 'universal/styles/helpers/formError';
import withStyles from 'universal/styles/withStyles';
import withMutationProps from 'universal/utils/relay/withMutationProps';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';

const NotificationRow = (props) => {
  const {atmosphere, dispatch, error, submitting, submitMutation, onCompleted, onError, notification, styles} = props;
  const {type} = notification;
  const fetchMod = typePicker[type];
  return (
    <div>
      <AsyncComponent
        atmosphere={atmosphere}
        loadingWidth="inherit"
        loadingHeight="5rem"
        fetchMod={fetchMod}
        dispatch={dispatch}
        notification={notification}
        submitting={submitting}
        submitMutation={submitMutation}
        onCompleted={onCompleted}
        onError={onError}
      />
      {error && <div className={css(styles.error)}>{error}</div>}
    </div>
  );
};

NotificationRow.propTypes = {
  atmosphere: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  notification: PropTypes.object.isRequired,
  // mutationProps
  error: PropTypes.any,
  submitting: PropTypes.bool,
  submitMutation: PropTypes.func.isRequired,
  onCompleted: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  styles: PropTypes.object
};

const styleThunk = () => ({
  error: {
    ...formError
  }
});

export default createFragmentContainer(
  withAtmosphere(
    withMutationProps(
      withStyles(styleThunk)(
        NotificationRow
      )
    )
  ),
  graphql`
    fragment NotificationRow_notification on Notification {
      type
      ...AddedToTeam_notification
      ...DenyNewUser_notification
      ...InviteeApproved_notification
      ...KickedOut_notification
      ...PaymentRejected_notification
      ...TaskInvolves_notification
      ...PromoteToBillingLeader_notification
      ...RequestNewUser_notification
      ...TeamArchived_notification
      ...TeamInvite_notification
    }
  `
);
