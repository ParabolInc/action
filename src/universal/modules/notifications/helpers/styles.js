import ui from 'universal/styles/ui'
import appTheme from 'universal/styles/theme/appTheme'

export default {
  message: {
    color: ui.colorText,
    flex: 1,
    fontSize: appTheme.typography.s3,
    lineHeight: '1.375rem',
    marginLeft: ui.rowCompactGutter
  },
  messageVar: {
    textDecoration: 'underline'
  },
  messageSub: {
    color: ui.colorText,
    fontSize: appTheme.typography.s2,
    marginTop: '.25rem'
  },
  notifLink: {
    cursor: 'pointer',
    ':hover': {
      color: appTheme.palette.warm
    }
  },
  button: {
    marginLeft: ui.rowCompactGutter,
    minWidth: '5.125rem'
  },
  widerButton: {
    marginLeft: ui.rowCompactGutter,
    minWidth: '8.25rem'
  },
  widestButton: {
    marginLeft: ui.rowCompactGutter,
    minWidth: '11rem'
  },
  buttonGroup: {
    display: 'flex'
  },
  owner: {
    display: 'flex',
    alignItems: 'center',
    paddingTop: '.5rem'
  },
  ownerAvatar: {
    borderRadius: '100%',
    display: 'block',
    height: '1.5rem',
    width: '1.5rem'
  },
  ownerName: {
    fontWeight: 600,
    paddingLeft: '.375rem'
  }
}
