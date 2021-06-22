import styled from '@emotion/styled'
import React, {useState} from 'react'
import adam from '~/styles/theme/images/adam.jpeg'
import cliff from '~/styles/theme/images/cliff.jpeg'
import ian from '~/styles/theme/images/ian.png'
import {PALETTE} from '../../../../styles/paletteV3'

const quotes = [
  {
    text: 'Parabol’s software was the key to unlocking performance on our leadership team.',
    picture: ian,
    name: 'Ian Myers',
    title: 'GM of Platform at Quartz'
  },
  {
    text:
      'We’re big fans of Parabol. It really helps our retrospectives be more efficient and more effective.',
    picture: cliff,
    name: 'Cliff des Ligneris',
    title: 'Senior Product Manager at Doodle'
  },
  {
    text:
      'In 4 weeks we were running like a top: priorities and accountabilities are clear, and frankly, our meetings have been a lot more enjoyable.',
    picture: adam,
    name: 'Adam Pisoni',
    title: 'Founder and CEO at Abl Schools'
  }
]

const Quote = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  fontSize: 16,
  lineHeight: '20px'
})

const Text = styled('div')({
  fontStyle: 'italic',
  maxWidth: 280,
  padding: '0 0 12px',
  position: 'relative'
})

const HangQuote = styled('div')({
  position: 'absolute',
  left: '-2em',
  textAlign: 'right',
  top: 0,
  width: '2em'
})

const Signature = styled('div')({
  alignItems: 'center',
  display: 'flex'
})

const PictureBlock = styled('div')({
  height: 48,
  position: 'relative',
  '&::after': {
    borderRadius: '100%',
    boxShadow: 'inset 0 0 0 1px rgba(0, 0, 0, .25)',
    content: '""',
    height: 48,
    left: 0,
    position: 'absolute',
    top: 0,
    width: 48,
    zIndex: 2
  }
})

const Picture = styled('img')({
  borderRadius: '100%',
  height: 48,
  width: 48
})

const NameAndTitle = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  paddingLeft: 16
})

const Name = styled('div')({
  lineHeight: '24px',
  fontWeight: 600
})

const Title = styled('div')({
  color: PALETTE.SLATE_600,
  fontSize: 13
})

interface Props {
  className?: string
}

const OrgBillingReassuranceQuote = (props: Props) => {
  const {className} = props
  const [quoteNumber] = useState(() => Math.floor(Math.random() * quotes.length))
  const {text, picture, name, title} = quotes[quoteNumber]
  return (
    <Quote className={className}>
      <Text>
        <HangQuote>“</HangQuote>
        {text}”
      </Text>
      <Signature>
        <PictureBlock>
          <Picture src={picture} />
        </PictureBlock>
        <NameAndTitle>
          <Name>{name}</Name>
          <Title>{title}</Title>
        </NameAndTitle>
      </Signature>
    </Quote>
  )
}

export default OrgBillingReassuranceQuote
