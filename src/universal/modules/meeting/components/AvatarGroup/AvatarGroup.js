import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import appTheme from 'universal/styles/theme/appTheme';
import Avatar from 'universal/components/Avatar/Avatar';
import {UPDATES} from 'universal/utils/constants';

const AvatarGroup = (props) => {
  const {localPhase, avatars, styles} = props;
  const label = localPhase === UPDATES ? 'Updates given:' : 'Team:';
  return (
    <div className={css(styles.root)}>
      <div className={css(styles.label)}>
        {label}
      </div>
      {
        avatars.map((avatar, index) =>
          <div className={css(styles.item)} key={index}>
            <Avatar {...avatar} size="small" hasBadge hasBorder={avatar.isFacilitating} />
          </div>
        )
      }
    </div>
  );
};

AvatarGroup.propTypes = {
  localPhase: PropTypes.string,
  avatars: PropTypes.array,
  styles: PropTypes.object
};

// NOTE: outer padding for positioned label and overall centering
const outerPadding = '8rem';

const styleThunk = () => ({
  root: {
    fontSize: 0,
    padding: `0 ${outerPadding}`,
    position: 'relative',
    textAlign: 'center'
  },

  label: {
    color: appTheme.palette.mid,
    display: 'inline-block',
    fontFamily: appTheme.typography.serif,
    fontSize: appTheme.typography.s3,
    fontStyle: 'italic',
    fontWeight: 700,
    height: '2.75rem',
    left: 0,
    lineHeight: '2.75rem',
    minWidth: outerPadding,
    padding: '0 .75rem 0 0',
    position: 'absolute',
    textAlign: 'right',
    top: 0,
    verticalAlign: 'middle'
  },

  item: {
    display: 'inline-block',
    margin: '0 .75rem',
    position: 'relative',
    verticalAlign: 'middle'
  }
});

export default withStyles(styleThunk)(AvatarGroup);
