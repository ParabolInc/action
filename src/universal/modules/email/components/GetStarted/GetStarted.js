import React from 'react';
import theme from 'universal/styles/theme';

const GetStarted = () => {
  const linkStyle = {
    color: theme.palette.cool,
    fontWeight: 700
  };

  const imageStyle = {
    border: 0,
    display: 'block',
    marginBottom: '8px'
  };

  const headingStyle = {
    color: theme.palette.warm,
    fontWeight: 700,
    textTransform: 'uppercase'
  };

  return (
    <div>
      <img
        style={imageStyle}
        src="/static/images/email/email-icon-star@2x.png"
        height="48"
        width="48"
      />
      <span style={headingStyle}>Getting Started</span><br />
      Read our <a href="https://www.parabol.co/action/101/" style={linkStyle}>Action 101</a>
      &nbsp;so your team<br />
      can get into the swing of things.
    </div>
  );
};

export default GetStarted;
