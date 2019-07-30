import PropTypes from 'prop-types'
import React from 'react'
import withStyles from '../../styles/withStyles'
import {css} from 'aphrodite-local-styles/no-important'
import ui from '../../styles/ui'

const DashContent = (props) => {
  const {children, hasOverlay, padding, styles} = props
  const style = {padding}
  const rootStyles = css(styles.root, hasOverlay && styles.hasOverlay)
  return (
    <div className={rootStyles} style={style}>
      {children}
    </div>
  )
}

DashContent.propTypes = {
  children: PropTypes.any,
  hasOverlay: PropTypes.bool,
  padding: PropTypes.string,
  styles: PropTypes.object
}

DashContent.defaultProps = {
  padding: '1rem'
}

const styleThunk = () => ({
  root: {
    backgroundColor: ui.dashBackgroundColor,
    display: 'flex !important',
    flex: 1,
    flexDirection: 'column',
    // overflow: 'auto', removed because react-beautiful-dnd only supports 1 scrolling parent
    width: '100%'
  },

  hasOverlay: {
    filter: ui.filterBlur
  }
})

export default withStyles(styleThunk)(DashContent)
