import styled from '@emotion/styled'

const PokerVotingRowBase = styled('div')({
  alignItems: 'center',
  display: 'flex',
  flexShrink: 0,
  minHeight: 56, // maintain tallest height, account for avatar group plus padding
  padding: '6px 0 6px 16px' // 6px over 8px, account for overlapping 2px border of avatars
})

export default PokerVotingRowBase
