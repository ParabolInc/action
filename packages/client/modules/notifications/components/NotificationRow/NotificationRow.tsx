import React, {Suspense} from 'react'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {NotificationRow_notification} from '../../../../__generated__/NotificationRow_notification.graphql'
import {NotificationEnum} from '../../../../types/graphql'
import lazyPreload from '../../../../utils/lazyPreload'
import {ValueOf} from '../../../../types/generics'

const typePicker = {
  [NotificationEnum.KICKED_OUT]: lazyPreload(() =>
    import(/* webpackChunkName: 'KickedOut' */ '../KickedOut')
  ),
  [NotificationEnum.PAYMENT_REJECTED]: lazyPreload(() =>
    import(/* webpackChunkName: 'PaymentRejected' */ '../PaymentRejected/PaymentRejected')
  ),
  [NotificationEnum.TASK_INVOLVES]: lazyPreload(() =>
    import(/* webpackChunkName: 'TaskInvolves' */ '../TaskInvolves')
  ),
  [NotificationEnum.PROMOTE_TO_BILLING_LEADER]: lazyPreload(() =>
    import(
      /* webpackChunkName: 'PromoteToBillingLeader' */ '../PromoteToBillingLeader/PromoteToBillingLeader'
    )
  ),
  [NotificationEnum.TEAM_ARCHIVED]: lazyPreload(() =>
    import(/* webpackChunkName: 'TeamArchived' */ '../TeamArchived/TeamArchived')
  ),
  [NotificationEnum.TEAM_INVITATION]: lazyPreload(() =>
    import(/* webpackChunkName: 'TeamInvitation' */ '../TeamInvitation')
  ),
  [NotificationEnum.MEETING_STAGE_TIME_LIMIT_END]: lazyPreload(() =>
    import(/* webpackChunkName: 'MeetingStageTimeLimitEnd' */ '../MeetingStageTimeLimitEnd')
  )
}

interface Props {
  notification: NotificationRow_notification
}

const NotificationRow = (props: Props) => {
  const {notification} = props
  const {type} = notification
  const SpecificNotification = typePicker[type] as ValueOf<typeof typePicker>
  return (
    <Suspense fallback={''}>
      <SpecificNotification notification={notification} />
    </Suspense>
  )
}

export default createFragmentContainer(NotificationRow, {
  notification: graphql`
    fragment NotificationRow_notification on Notification {
      type
      ...KickedOut_notification
      ...PaymentRejected_notification
      ...TaskInvolves_notification
      ...PromoteToBillingLeader_notification
      ...TeamArchived_notification
      ...TeamInvitation_notification
      ...MeetingStageTimeLimitEnd_notification
    }
  `
})
