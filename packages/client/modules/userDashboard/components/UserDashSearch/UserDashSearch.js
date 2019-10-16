import PropTypes from 'prop-types'
import React, {Component} from 'react'
import {commitLocalUpdate, createFragmentContainer} from 'react-relay'
import withAtmosphere from '../../../../decorators/withAtmosphere/withAtmosphere'
import graphql from 'babel-plugin-relay/macro'
import DashSearchControl from '../../../../components/Dashboard/DashSearchControl'

class UserDashSearch extends Component {
  componentWillUnmount() {
    if (this.props.viewer.contentFilter) {
      this.setContentFilter('')
    }
  }

  setContentFilter(nextValue) {
    const {
      atmosphere,
      viewer: {userId}
    } = this.props
    commitLocalUpdate(atmosphere, (store) => {
      const userProxy = store.get(userId)
      userProxy.setValue(nextValue, 'contentFilter')
    })
  }

  updateFilter = (e) => {
    this.setContentFilter(e.target.value)
  }

  render() {
    return <DashSearchControl onChange={this.updateFilter} placeholder='Search My Tasks' />
  }
}

UserDashSearch.propTypes = {
  atmosphere: PropTypes.object.isRequired,
  viewer: PropTypes.object
}

export default createFragmentContainer(withAtmosphere(UserDashSearch), {
  viewer: graphql`
    fragment UserDashSearch_viewer on User {
      userId: id
      contentFilter
    }
  `
})
