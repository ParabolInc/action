import {css} from 'aphrodite-local-styles/no-important'
import ms from 'ms'
import PropTypes from 'prop-types'
import React, {Component} from 'react'
import Button from 'universal/components/Button'
import ServiceDropdownInput from 'universal/modules/integrations/components/ServiceDropdownInput/ServiceDropdownInput'
import AddSlackChannelMutation from 'universal/mutations/AddSlackChannelMutation'
import formError from 'universal/styles/helpers/formError'
import ui from 'universal/styles/ui'
import withStyles from 'universal/styles/withStyles'
import withMutationProps from 'universal/utils/relay/withMutationProps'

const defaultSelectedChannel = () => ({
  channelId: undefined,
  channelName: 'Select a Slack channel'
})

class AddSlackChannel extends Component {
  static propTypes = {
    accessToken: PropTypes.string,
    environment: PropTypes.object,
    styles: PropTypes.object,
    teamMemberId: PropTypes.string,
    setDirty: PropTypes.func.isRequired,
    error: PropTypes.any,
    submitting: PropTypes.bool,
    submitMutation: PropTypes.func.isRequired,
    onCompleted: PropTypes.func.isRequired,
    onError: PropTypes.func.isRequired
  }

  constructor (props) {
    super(props)
    this.state = {
      options: [],
      selectedChannel: defaultSelectedChannel()
    }
    this.lastUpdated = 0
    this.fetchOptions(props.accessToken)
  }

  componentWillReceiveProps (nextProps) {
    const {accessToken} = nextProps
    if (!this.props.accessToken !== accessToken) {
      this.fetchOptions(accessToken)
    }
  }

  updateDropdownItem = (option) => () => {
    this.setState({
      selectedChannel: {
        channelId: option.id,
        channelName: option.label
      },
      options: this.state.options.filter((row) => row.id !== option.id)
    })
  }

  handleAddChannel = () => {
    const {environment, teamMemberId, onError, onCompleted} = this.props
    const {selectedChannel} = this.state
    if (!selectedChannel.channelId) return
    AddSlackChannelMutation(environment, selectedChannel, teamMemberId, onError, onCompleted)
    this.setState({
      selectedChannel: defaultSelectedChannel()
    })
  }

  fetchOptions = async (accessToken) => {
    const now = new Date()
    const isStale = now - this.lastUpdated > ms('30s')
    if (accessToken && isStale) {
      this.lastUpdated = now
      const uri = `https://slack.com/api/channels.list?token=${accessToken}&exclude_archived=1`
      const res = await window.fetch(uri)
      const resJson = await res.json()
      const {ok, channels, error} = resJson
      if (!ok) {
        throw new Error(error)
      }
      const {subbedChannels} = this.props
      const subbedChannelIds = subbedChannels.map((channel) => channel.channelId)
      const options = channels
        .filter((channel) => !subbedChannelIds.includes(channel.id))
        .map((channel) => ({id: channel.id, label: channel.name}))
      this.setState({
        isLoaded: true,
        options
      })
    }
  }

  render () {
    const {
      isLoaded,
      options,
      selectedChannel: {channelName}
    } = this.state
    const {accessToken, error, styles} = this.props
    return (
      <div className={css(styles.addChannel)}>
        <div className={css(styles.dropdownAndError)}>
          <ServiceDropdownInput
            fetchOptions={() => this.fetchOptions(accessToken)}
            dropdownText={channelName}
            handleItemClick={this.updateDropdownItem}
            options={options}
            isLoaded={isLoaded}
          />
          <div className={css(styles.error)}>{error && error.message}</div>
        </div>
        <div style={{paddingLeft: ui.rowGutter, minWidth: '11rem'}}>
          <Button
            buttonSize='medium'
            colorPalette='warm'
            isBlock
            label='Add Channel'
            onClick={this.handleAddChannel}
          />
        </div>
      </div>
    )
  }
}

const styleThunk = () => ({
  addChannel: {
    display: 'flex',
    width: '100%'
  },
  dropdownAndError: {
    display: 'flex',
    width: '100%',
    flexDirection: 'column'
  },
  error: {
    ...formError,
    textAlign: 'right'
  }
})

export default withStyles(styleThunk)(withMutationProps(AddSlackChannel))
