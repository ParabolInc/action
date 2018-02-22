import graphQLSubscriptionType from 'server/graphql/graphQLSubscriptionType';
import AddOrgPayload from 'server/graphql/types/AddOrgPayload';
import AddTeamPayload from 'server/graphql/types/AddTeamPayload';
import ApproveToOrgPayload from 'server/graphql/types/ApproveToOrgPayload';
import CancelApprovalPayload from 'server/graphql/types/CancelApprovalPayload';
import CancelTeamInvitePayload from 'server/graphql/types/CancelTeamInvitePayload';
import ClearNotificationPayload from 'server/graphql/types/ClearNotificationPayload';
import CreateTaskPayload from 'server/graphql/types/CreateTaskPayload';
import DeleteTaskPayload from 'server/graphql/types/DeleteTaskPayload';
import InviteTeamMembersPayload from 'server/graphql/types/InviteTeamMembersPayload';
import RejectOrgApprovalPayload from 'server/graphql/types/RejectOrgApprovalPayload';
import StripeFailPaymentPayload from 'server/graphql/types/StripeFailPaymentPayload';
import User from 'server/graphql/types/User';
import RemoveOrgUserPayload from 'server/graphql/types/RemoveOrgUserPayload';
import UpdateUserProfilePayload from 'server/graphql/types/UpdateUserProfilePayload';

const types = [
  AddOrgPayload,
  AddTeamPayload,
  ApproveToOrgPayload,
  CancelApprovalPayload,
  CancelTeamInvitePayload,
  ClearNotificationPayload,
  CreateTaskPayload,
  DeleteTaskPayload,
  InviteTeamMembersPayload,
  RejectOrgApprovalPayload,
  RemoveOrgUserPayload,
  StripeFailPaymentPayload,
  User,
  UpdateUserProfilePayload
];

export default graphQLSubscriptionType('NotificationSubscriptionPayload', types);
