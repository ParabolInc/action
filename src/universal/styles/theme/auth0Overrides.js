import appTheme from 'universal/styles/theme/appTheme';
import parabolLogoColor from 'universal/styles/theme/images/brand/mark-color@4x.png';

// auth0 lock customization
// -------------------------
// NOTE: https://auth0.com/docs/libraries/lock/ui-customization
// NOTE: Beware what lies ahead, oh brave soul! #shame (TA)
export default {
  'body #a0-lock.a0-theme-default .a0-panel *': {
    fontFamily: appTheme.typography.sansSerif
  },

  'body #a0-lock.a0-theme-default .a0-panel .a0-bg-gradient': {
    backgroundColor: appTheme.palette.dark10l,
    backgroundImage: 'none'
  },

  'body #a0-lock.a0-theme-default .a0-panel .a0-icon-container .a0-image': {
    backgroundImage: `url("${parabolLogoColor}")`,
    backgroundPosition: '0 14px',
    backgroundRepeat: 'no-repeat',
    backgroundSize: '62px 56px',
    display: 'block',
    margin: '0 auto 12px',
    padding: 0,
    height: '70px',
    width: '62px'
  },

  'body #a0-lock.a0-theme-default .a0-panel .a0-icon-container .a0-image img': {
    display: 'none'
  },

  'body #a0-lock.a0-theme-default .a0-switch': {
    borderColor: appTheme.palette.dark
  },

  'body #a0-lock.a0-theme-default .a0-switch .a0-active': {
    backgroundColor: appTheme.palette.dark
  },

  'body #a0-lock.a0-theme-default .a0-switch span': {
    color: appTheme.palette.dark,
    fontWeight: 600
  },

  // eslint-disable-next-line max-len
  'body #a0-lock.a0-theme-default .a0-panel .a0-email .a0-input-box, body #a0-lock.a0-theme-default .a0-panel .a0-password .a0-input-box, body #a0-lock.a0-theme-default .a0-panel .a0-repeatPassword .a0-input-box, body #a0-lock.a0-theme-default .a0-panel .a0-username .a0-input-box': {
    backgroundColor: '#fff',
    borderColor: `transparent transparent ${appTheme.palette.dark50l}`,
    borderStyle: 'dashed',
    borderWidth: '1px 0'
  },

  'body #a0-lock.a0-theme-default .a0-panel button.a0-primary': {
    backgroundColor: `${appTheme.palette.warm} !important`
  }
};
