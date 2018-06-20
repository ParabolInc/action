import React, {Component} from 'react'
import PropTypes from 'prop-types'
import isKeyboardEvent from 'universal/utils/isKeyboardEvent'
import getDisplayName from 'universal/utils/getDisplayName'

/*
 * Takes the child component and puts it in a modal.
 * Provides an isClosing prop to children for animations
 * */

const withToggledPortal = (ComposedComponent) => {
  class ToggledPortal extends Component {
    static displayName = `ToggledPortal(${getDisplayName(ComposedComponent)})`
    static propTypes = {
      isToggleNativeElement: PropTypes.bool,
      onClose: PropTypes.func,
      toggle: PropTypes.any.isRequired,
      LoadableComponent: PropTypes.func.isRequired,
      queryVars: PropTypes.object,
      maxWidth: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      maxHeight: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      setOriginRef: PropTypes.func
    }
    state = {
      isOpen: false,
      isClosing: false
    }

    componentWillMount () {
      const {toggle} = this.props
      this.smartToggle = this.makeSmartToggle(toggle)
    }

    componentWillReceiveProps (nextProps) {
      const {toggle} = nextProps
      if (this.props.toggle !== toggle) {
        this.smartToggle = this.makeSmartToggle(toggle)
      }
    }

    openPortal = () => {
      this.setState({
        isOpen: true,
        isClosing: false
      })
    }

    closePortal = (e) => {
      this.setState({
        isClosing: true
      })

      if (isKeyboardEvent(e) && this.toggleRef) {
        this.toggleRef.focus()
      }
      const {onClose} = this.props
      if (onClose) {
        onClose()
      }
    }

    terminatePortal = () => {
      if (this.state.isOpen) {
        this.setState({
          isClosing: false,
          isOpen: false
        })
      }
    }

    makeSmartToggle (toggle) {
      // strings are plain DOM nodes
      return React.cloneElement(toggle, {
        'aria-haspopup': 'true',
        'aria-expanded': this.state.isOpen,
        onClick: (e) => {
          const {setOriginRef, LoadableComponent} = this.props
          if (LoadableComponent) {
            LoadableComponent.preload()
          }
          if (setOriginRef) {
            setOriginRef(e.currentTarget)
          }
          if (this.state.isOpen) {
            this.closePortal()
          } else {
            this.openPortal()
          }
          // if the modal was gonna do something, do it
          const {onClick} = toggle.props
          if (onClick) {
            onClick(e)
          }
        },
        onMouseEnter: () => {
          const {LoadableComponent} = this.props
          if (LoadableComponent) {
            LoadableComponent.preload()
          }
        },
        [this.props.isToggleNativeElement ? 'ref' : 'innerRef']: (c) => {
          this.toggleRef = c
        }
      })
    }

    render () {
      const {isClosing, isOpen} = this.state
      return (
        <React.Fragment>
          {this.smartToggle}
          <ComposedComponent
            {...this.props}
            isOpen={isOpen}
            isClosing={isClosing}
            closePortal={this.closePortal}
            terminatePortal={this.terminatePortal}
          />
        </React.Fragment>
      )
    }
  }

  return ToggledPortal
}

export type ToggledPortalProps = {
  isClosing: boolean,
  isOpen: boolean,
  closePortal: () => void,
  terminatePortal: () => void
}

export default withToggledPortal
