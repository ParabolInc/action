// /**
//  * Stories for Portal components.
//  *
//  */

// import React from 'react'
// import {storiesOf} from '@storybook/react'
// import RetroBackground from './components/RetroBackground'
// import StoryContainer from './components/StoryContainer'
// import styled from '@emotion/styled'
// import elevation from '../styles/elevation'

// const demoCardSize = '8rem'
// const gridGap = '2.5rem'

// const Grid = styled('div')({
//   display: 'grid',
//   gridGap,
//   gridTemplateColumns: `repeat(auto-fill, ${demoCardSize})`,
//   margin: `${gridGap} 0`
// })

// const Elevation = styled('div')(({depth, index}) => ({
//   backgroundColor: 'white',
//   boxShadow: `${depth}`,
//   borderRadius: '.125rem',
//   color: 'gray',
//   height: demoCardSize,
//   padding: '1rem',
//   width: demoCardSize,
//   '::after': {
//     content: `"${index}dp"`
//   }
// }))

// const Notes = styled('div')({
//   lineHeight: 2,
//   margin: `0 0 ${gridGap}`
// })

// const makeLink = (copy, href) => (
//   <a href={href} rel='noopener noreferrer' target='blank' title={copy}>
//     {copy}
//   </a>
// )

// const RenderBlock = () => (
//   <div>
//     <Grid>
//       {elevation.map((depth, index) => {
//         return <Elevation depth={depth} index={index} key={`${index}dp`} />
//       })}
//     </Grid>
//     <Notes>
//       {makeLink(
//         'See Material Design Elevation for baseline inspiration',
//         'https://material.io/design/environment/elevation.html'
//       )}
//       <br />
//       {makeLink(
//         'See our custom elevation values for common UI components',
//         'https://github.com/ParabolInc/parabol/blob/master/src/universal/styles/elevation.js'
//       )}
//       <br />
//       {makeLink(
//         'See our Team Library components for elevation in Figma',
//         'https://www.figma.com/file/UAT8GVK86KVKdycX8xtK3tmM/UI-elevation?node-id=0%3A1'
//       )}
//     </Notes>
//   </div>
// )

// storiesOf('Elevation', module).add('elevations on parade', () => (
//   <RetroBackground>
//     <StoryContainer
//       description={`This demonstrates custom elevation values and includes some resourceful links for using elevation in the UI`}
//       render={RenderBlock}
//     />
//   </RetroBackground>
// ))
