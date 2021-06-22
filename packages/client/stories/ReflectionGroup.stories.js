// /**
//  * Stories for groups of reflection cards.
//  *
//  */
// import {ContentState} from 'draft-js'
// import React from 'react'
// import shortid from 'shortid'
// import {action} from '@storybook/addon-actions'
// import {storiesOf} from '@storybook/react'

// import ReflectionGroup from '../components/ReflectionGroup/ReflectionGroup'

// import Grid from './components/Grid'
// import RetroBackground from './components/RetroBackground'
// import StoryContainer from './components/StoryContainer'
// import {PALETTE} from '../styles/paletteV2'

// const newId = () => shortid.generate()

// storiesOf('Reflection Group', module)
//   .add('with a few cards', () => (
//     <RetroBackground>
//       <StoryContainer
//         description='Note: we only render the top four cards in the collapsed state'
//         render={() => (
//           <Grid>
//             <ReflectionGroup
//               handleSaveTitle={action('save-title')}
//               id={newId()}
//               reflections={[
//                 {
//                   id: newId(),
//                   content: ContentState.createFromText('This is the bottom card'),
//                   groupColor: PALETTE.PROMPT_GREEN,
//                   reflectionPhaseQuestion: null
//                 },
//                 {
//                   id: newId(),
//                   content: ContentState.createFromText('This is the top card'),
//                   groupColor: PALETTE.PROMPT_FUCHSIA,
//                   reflectionPhaseQuestion: null
//                 }
//               ]}
//               title={''}
//             />
//             <ReflectionGroup
//               handleSaveTitle={action('save-title')}
//               id={newId()}
//               reflections={[
//                 {
//                   id: newId(),
//                   content: ContentState.createFromText('Card'),
//                   groupColor: PALETTE.PROMPT_ORANGE,
//                   reflectionPhaseQuestion: null
//                 },
//                 {
//                   id: newId(),
//                   content: ContentState.createFromText('Card'),
//                   groupColor: PALETTE.PROMPT_PURPLE,
//                   reflectionPhaseQuestion: null
//                 },
//                 {
//                   id: newId(),
//                   content: ContentState.createFromText(`
//                   This one has a lot to say!
//                   Fortunately it does not screw up the translation computation.
//                   `),
//                   groupColor: PALETTE.PROMPT_GREEN,
//                   reflectionPhaseQuestion: null
//                 },
//                 {
//                   id: newId(),
//                   content: ContentState.createFromText('Card'),
//                   groupColor: PALETTE.PROMPT_LIGHT_BLUE,
//                   reflectionPhaseQuestion: null
//                 }
//               ]}
//               title={''}
//             />
//             <ReflectionGroup
//               handleSaveTitle={action('save-title')}
//               id={newId()}
//               reflections={[
//                 {
//                   id: newId(),
//                   content: ContentState.createFromText('Card'),
//                   groupColor: PALETTE.PROMPT_GREEN,
//                   reflectionPhaseQuestion: null
//                 },
//                 {
//                   id: newId(),
//                   content: ContentState.createFromText('Card'),
//                   groupColor: PALETTE.PROMPT_CYAN,
//                   reflectionPhaseQuestion: null
//                 },
//                 {
//                   id: newId(),
//                   content: ContentState.createFromText('Card'),
//                   groupColor: PALETTE.PROMPT_RED,
//                   reflectionPhaseQuestion: null
//                 },
//                 {
//                   id: newId(),
//                   content: ContentState.createFromText('Card'),
//                   groupColor: PALETTE.PROMPT_RED,
//                   reflectionPhaseQuestion: null
//                 },
//                 {
//                   id: newId(),
//                   content: ContentState.createFromText('Card'),
//                   groupColor: PALETTE.PROMPT_BLUE,
//                   reflectionPhaseQuestion: null
//                 },
//                 {
//                   id: newId(),
//                   content: ContentState.createFromText('Card'),
//                   groupColor: PALETTE.PROMPT_YELLOW,
//                   reflectionPhaseQuestion: null
//                 },
//                 {
//                   id: newId(),
//                   content: ContentState.createFromText('Card'),
//                   groupColor: PALETTE.PROMPT_PINK,
//                   reflectionPhaseQuestion: null
//                 },
//                 {
//                   id: newId(),
//                   content: ContentState.createFromText('Card'),
//                   groupColor: PALETTE.PROMPT_LIGHT_GREEN,
//                   reflectionPhaseQuestion: null
//                 },
//                 {
//                   id: newId(),
//                   content: ContentState.createFromText('Card'),
//                   groupColor: PALETTE.PROMPT_VIOLET,
//                   reflectionPhaseQuestion: null
//                 }
//               ]}
//               title={''}
//             />
//           </Grid>
//         )}
//       />
//     </RetroBackground>
//   ))

//   .add('with drop placeholder', () => (
//     <RetroBackground>
//       <StoryContainer
//         render={() => (
//           <Grid>
//             <ReflectionGroup
//               handleSaveTitle={action('save-title')}
//               id={newId()}
//               hovered
//               reflections={[
//                 {
//                   id: newId(),
//                   content: ContentState.createFromText('Card'),
//                   groupColor: PALETTE.PROMPT_ORANGE,
//                   reflectionPhaseQuestion: null
//                 },
//                 {
//                   id: newId(),
//                   content: ContentState.createFromText('Card'),
//                   groupColor: PALETTE.PROMPT_FUCHSIA,
//                   reflectionPhaseQuestion: null
//                 }
//               ]}
//               title={''}
//             />
//           </Grid>
//         )}
//       />
//     </RetroBackground>
//   ))
