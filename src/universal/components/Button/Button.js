// import PropTypes from 'prop-types'
// import React, {Component} from 'react'
// import FontAwesome from 'react-fontawesome'
// import tinycolor from 'tinycolor2'
// import {css} from 'aphrodite-local-styles/no-important'
// import withStyles from 'universal/styles/withStyles'
// import ui from 'universal/styles/ui'
// import appTheme from 'universal/styles/theme/appTheme'
// import textOverflow from 'universal/styles/helpers/textOverflow'

// const makeSolidTheme = (themeColor, textColor = '#fff', buttonStyle = 'solid') => {
//   const buttonColor =
//     buttonStyle === 'inverted' ? tinycolor.mix(themeColor, '#fff', 90).toHexString() : themeColor
//   const color =
//     buttonStyle === 'inverted' ? tinycolor.mix(textColor, '#000', 10).toHexString() : textColor

//   return {
//     backgroundColor: buttonColor,
//     borderColor: buttonColor,
//     color,

//     ':hover': {color},
//     ':focus': {color}
//   }
// }

// const makeFlatTheme = (buttonStyle, color) => ({
//   backgroundColor: 'transparent',
//   borderColor: buttonStyle === 'flat' ? 'transparent' : 'currentColor',
//   boxShadow: 'none !important',
//   color,
//   fontWeight: 400,

//   ':hover': {
//     backgroundColor: appTheme.palette.light,
//     boxShadow: 'none',
//     color
//   },
//   ':focus': {
//     backgroundColor: appTheme.palette.light,
//     boxShadow: 'none',
//     color
//   }
// })

// const makeLinkTheme = (color) => {
//   const hoverFocusStyles = {
//     boxShadow: 'none !important',
//     color: tinycolor.mix(color, '#000', 15).toHexString()
//   }
//   return {
//     backgroundColor: 'transparent',
//     boxShadow: 'none !important',
//     color,
//     fontWeight: 400,
//     paddingLeft: 0,
//     paddingRight: 0,

//     ':hover': {
//       ...hoverFocusStyles
//     },
//     ':focus': {
//       ...hoverFocusStyles
//     }
//   }
// }

// const makePrimaryTheme = () => ({
//   ...ui.buttonStylesPrimary
// })

// const makePropColors = (buttonStyle, colorPalette) => {
//   const color = ui.palette[colorPalette]
//   const baseTextColor = buttonStyle === 'inverted' ? color : ui.palette.white
//   const textColor =
//     colorPalette === 'white' || colorPalette === 'light' || colorPalette === 'gray'
//       ? ui.palette.dark
//       : baseTextColor
//   if (buttonStyle === 'flat' || buttonStyle === 'outlined') {
//     return makeFlatTheme(buttonStyle, color)
//   }
//   if (buttonStyle === 'primary') {
//     return makePrimaryTheme()
//   }
//   if (buttonStyle === 'link') {
//     return makeLinkTheme(color)
//   }
//   return makeSolidTheme(color, textColor, buttonStyle)
// }

// class Button extends Component {
//   static propTypes = {
//     'aria-label': PropTypes.string,
//     colorPalette: PropTypes.oneOf(ui.paletteOptions),
//     // depth: up to 3 + 1 (for :hover, :focus) = up to ui.shadow[4]
//     depth: PropTypes.oneOf([0, 1, 2, 3]),
//     disabled: PropTypes.bool,
//     icon: PropTypes.string,
//     iconLarge: PropTypes.bool,
//     iconPalette: PropTypes.oneOf(ui.paletteOptions),
//     iconPlacement: PropTypes.oneOf(['left', 'right']),
//     innerRef: PropTypes.func,
//     isBlock: PropTypes.bool,
//     label: PropTypes.any,
//     onClick: PropTypes.func,
//     onMouseEnter: PropTypes.func,
//     onMouseLeave: PropTypes.func,
//     buttonSize: PropTypes.oneOf(ui.buttonSizeOptions),
//     buttonStyle: PropTypes.oneOf(['flat', 'inverted', 'link', 'outlined', 'primary', 'solid']),
//     styles: PropTypes.object,
//     textTransform: PropTypes.oneOf(['none', 'uppercase']),
//     title: PropTypes.string,
//     type: PropTypes.oneOf(['button', 'menu', 'reset', 'submit']),
//     // https://github.com/facebook/react/issues/4251
//     visuallyDisabled: PropTypes.bool,
//     waiting: PropTypes.bool
//   }

//   constructor (props) {
//     super(props)
//     this.state = {
//       pressedDown: null
//     }
//   }

//   onMouseDown = (e) => {
//     if (e.button === 0) {
//       this.setState({pressedDown: true})
//     }
//   }

//   onMouseUp = (e) => {
//     if (this.state.pressedDown) {
//       this.setState({pressedDown: false})
//     }
//     // We don’t want 'focus' styles to linger after the click (TA)
//     // wait till next tick because other components might need to use the button as the relativeTarget when they get blurred
//     // pull the target out of the event so react can recycle the event
//     const {currentTarget} = e
//     setTimeout(() => currentTarget.blur())
//   }

//   onMouseLeave = (e) => {
//     if (this.state.pressedDown) {
//       this.setState({pressedDown: false})
//     }
//     const {onMouseLeave} = this.props
//     if (onMouseLeave) {
//       onMouseLeave(e)
//     }
//   }

//   render () {
//     const {
//       'aria-label': ariaLabel,
//       depth,
//       disabled,
//       icon,
//       iconLarge,
//       iconPalette,
//       iconPlacement,
//       innerRef,
//       isBlock,
//       label,
//       onClick,
//       onMouseEnter,
//       styles,
//       title,
//       type,
//       visuallyDisabled,
//       waiting
//     } = this.props

//     const {pressedDown} = this.state
//     const iconOnly = !label
//     const hasDisabledStyles = Boolean(disabled || visuallyDisabled)

//     const buttonStyles = css(
//       styles.base,
//       depth && styles.depth,
//       isBlock && styles.isBlock,
//       styles.propColors,
//       hasDisabledStyles && styles.disabled,
//       !hasDisabledStyles && pressedDown && styles.pressedDown,
//       waiting && styles.waiting
//     )

//     const makeIconLabel = () => {
//       const defaultIconPlacement = icon && label ? 'left' : ''
//       const thisIconPlacement = iconPlacement || defaultIconPlacement
//       const iconStyle = {
//         color: iconPalette ? ui.palette[iconPalette] : 'inherit',
//         fontSize: iconLarge ? ui.iconSize2x : ui.iconSize,
//         lineHeight: 'inherit',
//         verticalAlign: 'middle'
//       }
//       const iconPlacementStyle = css(
//         thisIconPlacement === 'left' && styles.iconLeft,
//         thisIconPlacement === 'right' && styles.iconRight
//       )
//       const iconMargin = iconOnly ? '' : iconPlacementStyle
//       const makeIcon = () => <FontAwesome className={iconMargin} name={icon} style={iconStyle} />
//       return (
//         <span className={css(styles.buttonInner)}>
//           {iconOnly ? (
//             makeIcon()
//           ) : (
//             <span className={css(styles.buttonInner)}>
//               {thisIconPlacement === 'left' && makeIcon()}
//               <span className={css(styles.label)}>{label}</span>
//               {thisIconPlacement === 'right' && makeIcon()}
//             </span>
//           )}
//         </span>
//       )
//     }

//     return (
//       <button
//         className={buttonStyles}
//         disabled={disabled || waiting}
//         onClick={onClick}
//         onMouseEnter={onMouseEnter}
//         onMouseDown={this.onMouseDown}
//         onMouseUp={this.onMouseUp}
//         onMouseLeave={this.onMouseLeave}
//         ref={innerRef}
//         title={title || ariaLabel}
//         type={type || 'button'}
//         aria-label={ariaLabel}
//       >
//         {icon ? (
//           makeIconLabel()
//         ) : (
//           <span className={css(styles.buttonInner)}>
//             <span className={css(styles.label)}>{label}</span>
//           </span>
//         )}
//       </button>
//     )
//   }
// }

// const styleThunk = (
//   theme,
//   {buttonSize, buttonStyle, colorPalette, depth, disabled, textTransform}
// ) => {
//   const size = buttonSize || ui.buttonSizeOptions[1]
//   const buttonSizeStyles = ui.buttonSizeStyles[size]
//   return {
//     // Button base
//     base: {
//       ...ui.buttonBaseStyles,
//       ...buttonSizeStyles,
//       textTransform: textTransform || 'none',
//       transition: `box-shadow ${ui.transition[0]}, transform ${ui.transition[0]}`
//     },

//     depth: {
//       boxShadow: ui.shadow[depth],
//       ':hover': {
//         boxShadow: !disabled && ui.shadow[depth + 1]
//       },
//       ':focus': {
//         boxShadow: !disabled && ui.shadow[depth + 1]
//       },
//       ':active': {
//         boxShadow: !disabled && ui.shadow[depth + 1]
//       }
//     },

//     isBlock: {
//       ...ui.buttonBlockStyles
//     },

//     // Variants
//     // NOTE: Doing this saves us from creating 6*3 classes
//     propColors: makePropColors(buttonStyle, colorPalette),

//     // Disabled state
//     disabled: {
//       ...ui.buttonDisabledStyles
//     },

//     iconLeft: {
//       marginRight: '.5rem'
//     },

//     iconRight: {
//       marginLeft: '.5rem'
//     },

//     buttonInner: {
//       display: 'block',
//       fontSize: 0,
//       whiteSpace: 'nowrap'
//     },

//     label: {
//       ...textOverflow,
//       display: 'inline-block',
//       fontSize: buttonSizeStyles.fontSize,
//       height: buttonSizeStyles.lineHeight,
//       lineHeight: buttonSizeStyles.lineHeight,
//       maxWidth: '100%',
//       verticalAlign: 'middle'
//     },

//     pressedDown: {
//       transform: 'translate(0, .125rem)',
//       ':hover': {
//         boxShadow: ui.shadow[depth] || 'none'
//       },
//       ':focus': {
//         boxShadow: ui.shadow[depth] || 'none'
//       },
//       ':active': {
//         boxShadow: ui.shadow[depth] || 'none'
//       },
//       ':disabled': {
//         boxShadow: 'none'
//       }
//     },

//     waiting: {
//       ...ui.buttonDisabledStyles,
//       cursor: 'wait'
//     }
//   }
// }

// export default withStyles(styleThunk)(Button)
