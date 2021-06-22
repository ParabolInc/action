import {commitLocalUpdate} from 'react-relay'
import createProxyRecord from '../utils/relay/createProxyRecord'
import useAtmosphere from './useAtmosphere'
import useHotkey from './useHotkey'

const mockUsers = [
  {
    "id": "user::0",
    "picture": "https://action-files.parabol.co/production/store/User/google-oauth2%7C104933228229706489335/picture/WnMejT9Nn.jpeg",
    "preferredName": "matt 🙈"
  },
  {
    "id": "user::1",
    "picture": "https://lh6.googleusercontent.com/-rTmKq5M6C6U/AAAAAAAAAAI/AAAAAAAAAAA/ACHi3rfGejb_iJ8QGwWW1zAuX98Vi_wnGg/s96-c/photo.jpg",
    "preferredName": "Aviva"
  },
  {
    "id": "user::2",
    "picture": "https://action-files.parabol.co/production/store/User/auth0%7C5a5e23a4c6e7140558a5cb22/picture/By-SSWHrf.jpeg",
    "preferredName": "George"
  },
  {
    "id": "user::3",
    "picture": "https://action-files.parabol.co/production/store/User/auth0%7C57f52755a5ec618828a1c1e4/picture/Ym0x_NMfO.png",
    "preferredName": "Terry"
  },
  {
    "id": "user::4",
    "picture": "https://lh5.googleusercontent.com/-pXuNjax_1-Y/AAAAAAAAAAI/AAAAAAAAAAc/YccE6G-0Wcc/photo.jpg",
    "preferredName": "dan"
  },
  {
    "id": "user::5",
    "picture": "https://lh4.googleusercontent.com/-rqmJchCnFwQ/AAAAAAAAAAI/AAAAAAAAAAA/ACHi3rccsQBBX1ckdYv_Vn7QqX3jnrKyfw/s96-c/photo.jpg",
    "preferredName": "Kate Anderson"
  },
  {
    "id": "user::6",
    "picture": "https://lh3.googleusercontent.com/-gMVNR4EkmFM/AAAAAAAAAAI/AAAAAAAAABg/ecJfnrL7RWY/photo.jpg",
    "preferredName": "Taya"
  },
  {
    "id": "user::7",
    "picture": "https://action-files.parabol.co/production/store/User/auth0%7C59c5a7e45315152c967cc0c7/picture/SyzZtX_i-.png",
    "preferredName": "sara"
  },
  {
    "id": "user::8",
    "picture": "https://lh6.googleusercontent.com/-2F3GZjsj1Q4/AAAAAAAAAAI/AAAAAAAAAAA/AMZuuckrQidCEeyyrdMv8MsOP78MjU7Buw/s96-c/photo.jpg",
    "preferredName": "Tiffany Han"
  },
  {
    "id": "user::9",
    "picture": "https://action-files.parabol.co/production/store/User/google-oauth2%7C112540584686400405659/picture/fEJazukfc.jpeg",
    "preferredName": "Jordan"
  },
  {
    "id": "user::10",
    "picture": "https://action-files.parabol.co/static/avatars/aa.png",
    "preferredName": "aa"
  }
]

const useMockPeekers = (stageId: string) => {
  const atmosphere = useAtmosphere()
  useHotkey('a', () => {
    commitLocalUpdate(atmosphere, (store) => {
      const stage = store.get(stageId)!
      const hoveringUsers = stage.getLinkedRecords('hoveringUsers')!
      const nextUserObj = mockUsers[hoveringUsers.length]
      if (!nextUserObj) return
      const nextUser = store.get(nextUserObj.id) || createProxyRecord(store, 'User', nextUserObj)
      const nextHoveringUsers = [...hoveringUsers, nextUser]
      stage.setLinkedRecords(nextHoveringUsers, 'hoveringUsers')
    })
  })
  useHotkey('s', () => {
    commitLocalUpdate(atmosphere, (store) => {
      const stage = store.get(stageId)!
      const hoveringUsers = stage.getLinkedRecords('hoveringUsers')!
      const idxToRemove = Math.floor(Math.random() * hoveringUsers.length)
      const nextHoveringUsers = [...hoveringUsers.slice(0, idxToRemove), ...hoveringUsers.slice(idxToRemove + 1)]
      stage.setLinkedRecords(nextHoveringUsers, 'hoveringUsers')
    })
  })
}

export default useMockPeekers
