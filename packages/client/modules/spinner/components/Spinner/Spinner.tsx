import React from 'react'
import styled from '@emotion/styled'
import {keyframes} from '@emotion/core'

// NOTE: Let’s set this up!
//    1. PATHS    for leaves of the logo
//    2. DURATION for the overall animation
//    3. DELAY    for staggered leaf animation
//    4. TIMING   for staggered leaf animation

/* eslint-disable max-len */
const PATHS = [
  'M770.249 249.923C754.375 348.834 719.936 443.85 668.748 529.961C653.962 555.594 638.208 580.027 621.753 603.191C778.06 568.879 887.271 490.842 887.271 399.989C887.271 342.112 842.879 289.409 770.249 249.79',
  'M443.633 659.936C414.194 659.936 385.122 658.534 356.852 655.864C464.728 774.087 586.923 829.627 665.56 784.2C715.626 755.262 738.99 690.476 737.021 607.8C643.421 643.517 543.909 661.207 443.733 659.936',
  'M218.524 529.973C203.805 504.472 190.487 478.605 178.471 452.67C130.007 605.206 143.024 738.782 221.695 784.209C271.761 813.181 339.718 801.065 410.278 757.874C332.513 694.7 267.415 617.37 218.424 529.973',
  'M218.522 270.056C233.309 244.422 249.063 219.99 265.518 196.826C109.178 231.138 0 309.208 0 400.028C0 457.904 44.3587 510.607 117.021 550.226C132.891 451.304 167.33 356.277 218.522 270.156',
  'M443.634 140.041C473.106 140.041 502.145 141.443 530.416 144.114C422.673 25.9238 300.478 -29.6163 221.841 15.7771C171.774 44.7153 148.41 109.501 150.379 192.177C243.98 156.46 343.492 138.771 443.667 140.041',
  'M668.721 270.01C683.44 295.51 696.758 321.378 708.774 347.312C757.104 194.71 744.087 61.2001 665.45 15.8067C615.384 -13.1649 547.427 -1.0489 476.867 42.1416C554.632 105.316 619.73 182.646 668.721 270.043'
]
/* eslint-enable max-len */
const DURATION = '3s'
const DELAY = 150
const TIMING = 100 / PATHS.length

const keyframesRotate = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}`

const keyframesOpacity = keyframes`
  0% {
    opacity: .25;
  }
  ${TIMING}% {
    opacity: 1;
  }
  ${TIMING * 2}% {
    opacity: 1;
  }
  100% {
    opacity: .25;
  }
}`

const Root = styled('div')<Pick<Props, 'width'>>(({width}) => ({
  display: 'inline-block',
  height: width * 1.11,
  position: 'relative',
  width
}))

const Block = styled('div')<Pick<Props, 'width'>>(({width}) => ({
  left: '50%',
  position: 'absolute',
  top: '50%',
  transform: 'translate3d(-50%, -50%, 0)',
  width
}))

const SVG = styled('svg')<Pick<Props, 'delay' | 'width'>>(({delay, width}) => ({
  animationDelay: `${delay}ms`,
  animationDuration: DURATION,
  animationIterationCount: 'infinite',
  animationName: keyframesRotate.toString(),
  animationTimingFunction: 'cubic-bezier(.8, 0, .1, 1)',
  width
}))

const Path = styled('path')<Pick<Props, 'delay' | 'fill'>>(({delay, fill}) => ({
  animationDelay: `${delay}ms`,
  animationDuration: DURATION,
  animationIterationCount: 'infinite',
  animationName: keyframesOpacity.toString(),
  animationFillMode: 'forwards',
  animationTimingFunction: 'ease-in-out',
  fill,
  opacity: 0.25
}))

interface Props {
  fill: string
  width: number
  // useful for making it seem like a loader was never unmounted
  delay?: number
}

const Spinner = (props: Props) => {
  const {fill, width, delay = 0} = props
  return (
    <Root width={width}>
      <Block width={width}>
        <SVG
          width={width}
          delay={delay}
          viewBox='0 0 888 800'
          version='1.1'
          xmlns='http://www.w3.org/2000/svg'
        >
          {PATHS.map((p, i) => (
            <Path
              delay={delay}
              fill={fill}
              style={{animationDelay: `${DELAY * i + delay}ms`}}
              key={`path${i}`}
              d={p}
            />
          ))}
        </SVG>
      </Block>
    </Root>
  )
}

export default Spinner
