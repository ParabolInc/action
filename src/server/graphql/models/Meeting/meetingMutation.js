import getRethink from 'server/database/rethinkDriver';
import {requireSUOrTeamMember} from '../authorization';
import {Meeting} from './meetingSchema';
import sendEmailPromise from 'server/email/sendEmail';

import {
  GraphQLNonNull,
  GraphQLID
} from 'graphql';

export default {
  summarizeMeeting: {
    type: Meeting,
    description: 'Try to send a meeting email summary & return the guts of that email',
    args: {
      meetingId: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'The unique meeting ID that we want to summarize'
      }
    },
    async resolve(source, {meetingId}, {authToken}) {
      const r = getRethink();
      const meeting = await r.table('Meeting').get(meetingId).default({})
        .do((res) => {
          return res.merge({
            invitees: res('invitees').default([])
              .map((invitee) => {
                const teamMember = r.table('TeamMember').get(invitee('id'));
                return invitee.merge({
                  picture: teamMember('picture'),
                  preferredName: teamMember('preferredName'),
                  actions: res('actions').filter({teamMemberId: invitee('id')}),
                  projects: res('projects').filter({teamMemberId: invitee('id')})
                });
              })
          });
        });
      const {facilitator, invitees, teamId, summarySentAt} = meeting;
      // perform the query before the check because 99.9% of attempts will be honest & that will save us a query
      requireSUOrTeamMember(authToken, teamId);
      const teamMemberId = `${authToken.sub}::${teamId}`;
      if (facilitator === teamMemberId && !summarySentAt) {
        // send the summary email
        const userIds = invitees.map((doc) => doc.id.substr(0, doc.id.indexOf('::')));
        const emails = await r.table('User')
          .getAll(r.args(userIds))
          .map((user) => user('email'));
        const emailString = emails.join(', ');
        const emailSuccess = await sendEmailPromise(emailString, 'summaryEmail', {meeting});
        if (emailSuccess) {
          const now = new Date();
          await r.table('Meeting').get(meetingId).update({summarySentAt: now});
        }
      }
      return meeting;
    }
  }
};
