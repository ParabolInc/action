import {Link} from 'react-router-dom'
import React, {ReactNode} from 'react'

interface Props {
  isDemo?: boolean
  isEmail: boolean
  href: string
  title?: string
  style?: any
  children?: ReactNode
}

const AnchorIfEmail = (props: Props) => {
  const {isDemo, isEmail, href, ...aProps} = props
  return isDemo ? (
    <span {...aProps} />
  ) : isEmail ? (
    <a href={href} {...aProps} />
  ) : (
    <Link to={href} {...aProps} />
  )
}

export default AnchorIfEmail
