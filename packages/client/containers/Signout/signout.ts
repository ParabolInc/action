import Atmosphere from '../../Atmosphere'
import SendClientSegmentEventMutation from '../../mutations/SendClientSegmentEventMutation'
import {LocalStorageKey} from '../../types/constEnums'

const signout = (atmosphere: Atmosphere, history: any) => {
  window.localStorage.removeItem(LocalStorageKey.APP_TOKEN_KEY)
  SendClientSegmentEventMutation(atmosphere, 'User Logout')
  atmosphere.eventEmitter.emit('addSnackbar', {
    key: 'logOut',
    message: 'You’ve been logged out successfully.',
    autoDismiss: 5
  })
  setTimeout(() => {
    atmosphere.close()
    history.replace('/')
  })
}

export default signout
