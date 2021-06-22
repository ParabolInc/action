import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import useStoreQueryRetry from '~/hooks/useStoreQueryRetry'
import UserColumnsContainer from '../modules/userDashboard/containers/UserColumns/UserColumnsContainer'
import {MyDashboardTasks_viewer} from '../__generated__/MyDashboardTasks_viewer.graphql'

interface Props {
  viewer: MyDashboardTasks_viewer | null
  retry(): void
}

const MyDashboardTasks = (props: Props) => {
  const {retry, viewer} = props
  useStoreQueryRetry(retry)

  if (!viewer) return null
  return <UserColumnsContainer viewer={viewer} />
}

export default createFragmentContainer(MyDashboardTasks, {
  viewer: graphql`
    fragment MyDashboardTasks_viewer on User {
      ...UserColumnsContainer_viewer
    }
  `
})
