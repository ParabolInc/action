/**
 * A horizontal separator; looks like:
 *  ---------- some text ----------
 *
 * @flow
 */

import React, {Fragment} from 'react';
import styled from 'react-emotion';

import appTheme from 'universal/styles/theme/appTheme';

const SeparatorContainer = styled('div')({
  padding: '1rem 0',
  display: 'flex'
});

const separatorLineStyles = {
  margin: 'auto',
  width: '10rem',
  borderBottom: `1px solid ${appTheme.palette.mid}`
};

const LeftSeparator = styled('div')({
  ...separatorLineStyles,
  marginRight: '0.5rem'
});

const RightSeparator = styled('div')({
  ...separatorLineStyles,
  marginLeft: '0.5rem'
});

const FullSeparator = styled('div')({
  ...separatorLineStyles,
  width: '20rem'
});

type Props = {
  text?: string
};

export default ({text}: Props) => (
  <SeparatorContainer>
    {text ? (
      <Fragment>
        <LeftSeparator />
        {text}
        <RightSeparator />
      </Fragment>
    ) : (
      <FullSeparator />
    )}
  </SeparatorContainer>
);
