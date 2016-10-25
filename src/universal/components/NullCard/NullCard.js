import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import appTheme from 'universal/styles/theme/appTheme';
import {Ellipsis, Type} from 'universal/components';
import CreateCardRootStyles from '../CreateCard/CreateCardRootStyles';
import {cardBorderTop} from 'universal/styles/helpers';
import makeUsername from 'universal/utils/makeUsername';

const NullCard = (props) => {
  const {styles, type, preferredName} = props;
  const username = makeUsername(preferredName);
  return (
    <div className={css(styles.root)}>
      <Type align="center" bold scale="s3" colorPalette="mid">
        @{username}<br />is adding a {type}<Ellipsis />
      </Type>
    </div>
  );
};

NullCard.propTypes = {
  styles: PropTypes.object,
  type: PropTypes.oneOf(['Action', 'Project']),
  preferredName: PropTypes.string,
};

const styleThunk = () => ({
  root: {
    ...CreateCardRootStyles,

    '::after': {
      ...cardBorderTop,
      color: appTheme.palette.mid40l
    }
  }
});

export default withStyles(styleThunk)(NullCard);
