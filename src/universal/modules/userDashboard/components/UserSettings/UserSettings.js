import {css} from 'aphrodite-local-styles/no-important'
import PropTypes from 'prop-types'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {Field} from 'redux-form'
import OldButton from 'universal/components/Button/Button'
import Button from 'universal/components/Button'
import EditableAvatar from 'universal/components/EditableAvatar/EditableAvatar'
import FieldLabel from 'universal/components/FieldLabel/FieldLabel'
import InputField from 'universal/components/InputField/InputField'
import Panel from 'universal/components/Panel/Panel'
import Helmet from 'react-helmet'
import PhotoUploadModal from 'universal/components/PhotoUploadModal/PhotoUploadModal'
import UserAvatarInput from 'universal/modules/userDashboard/components/UserAvatarInput/UserAvatarInput'
import UserSettingsWrapper from 'universal/modules/userDashboard/components/UserSettingsWrapper/UserSettingsWrapper'
import {ACTIVITY_WELCOME} from 'universal/modules/userDashboard/ducks/settingsDuck'
import defaultUserAvatar from 'universal/styles/theme/images/avatar-user.svg'
import ui from 'universal/styles/ui'
import withStyles from 'universal/styles/withStyles'
import {randomPreferredName} from 'universal/utils/makeRandomPlaceholder'

const renderActivity = (activity) => {
  if (activity === ACTIVITY_WELCOME) {
    return (
      <div>
        {
          'Hey, welcome aboard! In order for your team to recognize who you are, do you mind telling us your name?'
        }
      </div>
    )
  }
  return null
}

const UserSettings = (props) => {
  const {
    activity,
    handleSubmit,
    onSubmit,
    styles,
    viewer: {userId, picture}
  } = props
  const pictureOrDefault = picture || defaultUserAvatar
  const toggle = (
    <div>
      <EditableAvatar picture={pictureOrDefault} size={96} />
    </div>
  )
  const controlSize = 'medium'
  return (
    <UserSettingsWrapper>
      <Helmet title='My Settings | Parabol' />
      <div className={css(styles.body)}>
        <Panel label='My Information'>
          <form className={css(styles.form)} onSubmit={handleSubmit(onSubmit)}>
            <div className={css(styles.avatarBlock)}>
              <PhotoUploadModal picture={pictureOrDefault} toggle={toggle}>
                <UserAvatarInput userId={userId} />
              </PhotoUploadModal>
            </div>
            <div className={css(styles.infoBlock)}>
              {activity && (
                <div className={css(styles.activityBlock)}>{renderActivity(activity)}</div>
              )}
              <FieldLabel
                customStyles={{paddingBottom: ui.fieldLabelGutter}}
                label='Name'
                fieldSize={controlSize}
                indent
                htmlFor='preferredName'
              />
              <div className={css(styles.controlBlock)}>
                <div className={css(styles.fieldBlock)}>
                  {/* TODO: Make me Editable.js (TA) */}
                  <Field
                    autoFocus
                    component={InputField}
                    fieldSize={controlSize}
                    name='preferredName'
                    placeholder={randomPreferredName}
                    type='text'
                  />
                </div>
                <div className={css(styles.buttonBlock)}>
                  <Button
                    icon='check'
                    iconPlacement='right'
                    isBlock
                    label='Update'
                    buttonSize={controlSize}
                    colorPalette='warm'
                    type='submit'
                    depth={3}
                    iconLarge
                  />
                  <div style={{paddingTop: 32}} />
                  <OldButton
                    icon='check'
                    iconPlacement='right'
                    isBlock
                    label='Update'
                    buttonSize={controlSize}
                    colorPalette='warm'
                    type='submit'
                    depth={3}
                    iconLarge
                  />
                </div>
              </div>
            </div>
          </form>
        </Panel>
      </div>
    </UserSettingsWrapper>
  )
}

UserSettings.propTypes = {
  activity: PropTypes.string, // from settingsDuck
  dispatch: PropTypes.func,
  handleSubmit: PropTypes.func,
  nextPage: PropTypes.string, // from settingsDuck
  onSubmit: PropTypes.func,
  userId: PropTypes.string,
  styles: PropTypes.object,
  viewer: PropTypes.object.isRequired
}

const styleThunk = () => ({
  body: {
    width: '100%'
  },

  form: {
    alignItems: 'center',
    borderTop: `1px solid ${ui.rowBorderColor}`,
    display: 'flex',
    padding: ui.panelGutter,
    width: '100%'
  },

  activityBlock: {
    margin: '0 0 1.5rem'
  },

  fieldBlock: {
    flex: 1,
    minWidth: 0,
    paddingRight: '1rem'
  },

  controlBlock: {
    display: 'flex',
    flexDirection: 'row',
    flex: 1,
    width: '100%'
  },

  avatarBlock: {
    // Define
  },

  buttonBlock: {
    minWidth: '12rem' // 7rem
  },

  infoBlock: {
    paddingLeft: ui.panelGutter,
    flex: 1
  }
})

export default createFragmentContainer(
  withStyles(styleThunk)(UserSettings),
  graphql`
    fragment UserSettings_viewer on User {
      userId: id
      preferredName
      picture
    }
  `
)
