import {useEffect, useState} from 'react'
import {SlackChannelDropdownChannels} from '../components/SlackChannelDropdown'
import SlackClientManager from '../utils/SlackClientManager'

const useSlackChannels = (
  slackAuth: {botAccessToken: string | null; slackUserId: string} | null
) => {
  const [channels, setChannels] = useState<SlackChannelDropdownChannels>([])
  useEffect(() => {
    if (!slackAuth || !slackAuth.botAccessToken) return
    let isMounted = true
    const getChannels = async () => {
      const {botAccessToken, slackUserId} = slackAuth
      const botManager = new SlackClientManager(botAccessToken!)
      const [publicChannelRes, privateChannelRes] = await Promise.all([
        botManager.getConversationList(),
        botManager.getConversationList(['private_channel'])
      ])
      if (!isMounted) return
      if (!publicChannelRes.ok) {
        console.error(publicChannelRes.error)
        return
      }
      let availableChannels
      const {channels: publicChannels} = publicChannelRes
      if (privateChannelRes.ok && privateChannelRes.channels.length) {
        availableChannels = [...privateChannelRes.channels, ...publicChannels]
      } else {
        availableChannels = publicChannels
      }
      availableChannels.sort((a, b) => (a.name > b.name ? 1 : -1))
      const botChannel = {
        id: slackUserId,
        name: '@Parabol'
      }
      availableChannels.unshift({...botChannel, name: '@Parabol'})
      setChannels(availableChannels)
    }
    getChannels().catch()
    return () => {
      isMounted = false
    }
  }, [slackAuth])
  return channels
}

export default useSlackChannels
