import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';

import appTheme from 'universal/styles/theme/appTheme';
import {cashay} from 'cashay';
import makeHref from 'universal/utils/makeHref';
import Button from 'universal/components/Button/Button';
import CopyShortLink from 'universal/modules/meeting/components/CopyShortLink/CopyShortLink';
import MeetingMain from 'universal/modules/meeting/components/MeetingMain/MeetingMain';
import MeetingSection from 'universal/modules/meeting/components/MeetingSection/MeetingSection';
import MeetingPhaseHeading from 'universal/modules/meeting/components/MeetingPhaseHeading/MeetingPhaseHeading';

const createStartMeetingHandler = (members) => () => {
  const self = members.find((member) => member.isSelf);
  if (!self) {
    throw new Error('You are not a member! How can that be?');
  }
  const options = {variables: {facilitatorId: self.id}};
  cashay.mutate('startMeeting', options);
};

const MeetingLobby = (props) => {
  const {members, team, styles} = props;
  const {id: teamId, name: teamName} = team;

  const onStartMeetingClick = createStartMeetingHandler(members);
  const shortUrl = makeHref(`/team/${teamId}`);
  return (
    <MeetingMain>
      {/* */}
      <div className={css(styles.root)}>
        <MeetingPhaseHeading>Hi, {teamName} Team!</MeetingPhaseHeading>
        <div className={css(styles.helpText)}>Is the whole team here?</div>
        <div className={css(styles.prompt)}>
          The person who presses “Start Meeting” will facilitate the meeting.<br />
          Everyone’s display automatically follows the facilitator.
        </div>
        <div className={css(styles.helpText)}>
          Today's facilitator: begin your Check-in round!
        </div>
        <Button
          label="Start Meeting"
          onClick={onStartMeetingClick}
          size="largest"
          buttonStyle="solid"
          colorPalette="cool"
          textTransform="uppercase"
        />
        <p className={css(styles.label)}>MEETING LINK:</p>
        <div className={css(styles.urlBlock)}>
          <CopyShortLink url={shortUrl}/>
        </div>
      </div>
      {/* */}
    </MeetingMain>
  );
};

MeetingLobby.propTypes = {
  members: PropTypes.array,
  params: PropTypes.shape({
    teamId: PropTypes.string
  }),
  styles: PropTypes.object,
  team: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string
  }),
  teamId: PropTypes.string,
  teamName: PropTypes.string,
};

const styleThunk = () => ({
  root: {
    textAlign: 'center'
  },

  label: {
    color: appTheme.palette.dark,
    fontSize: appTheme.typography.s3,
    fontWeight: 700,
    margin: '4rem 0 0',
    textTransform: 'uppercase'
  },

  urlBlock: {
    margin: '.5rem 0 4rem',
    verticalAlign: 'middle'
  },

  prompt: {
    color: appTheme.palette.dark,
    fontSize: appTheme.typography.s6,
    fontWeight: 700,
    margin: '2rem 0 2.25rem'
  },

  helpText: {
    color: appTheme.palette.dark,
    fontSize: appTheme.typography.s6,
    fontWeight: 400,
    lineHeight: 1.5,
    margin: '1rem 0 0'
  }
});

export default withStyles(styleThunk)(MeetingLobby);
