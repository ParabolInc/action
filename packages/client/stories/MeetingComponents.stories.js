// // Working on new meeting components
// // import {action} from '@storybook/addon-actions';
// import {storiesOf} from '@storybook/react'
// import MeetingFacilitatorBar from 'modules/meeting/components/MeetingControlBar/MeetingFacilitatorBar'
// import React from 'react'
// import LabelHeading from '../components/LabelHeading/LabelHeading'
// import MeetingCopy from '../modules/meeting/components/MeetingCopy/MeetingCopy'
// import MeetingPhaseHeading from '../modules/meeting/components/MeetingPhaseHeading/MeetingPhaseHeading'
// import RetroBackground from './components/RetroBackground'
// import StoryContainer from './components/StoryContainer'

// storiesOf('Meeting Components', module)
//   .add('Social Check-in Heading', () => (
//     <RetroBackground>
//       <StoryContainer
//         render={() => (
//           <div>
//             <LabelHeading>{'Social Check-in'}</LabelHeading>
//             <MeetingPhaseHeading>{'Terry’s Check-in'}</MeetingPhaseHeading>
//             <MeetingCopy margin='0'>{'Terry, share your response to today’s prompt.'}</MeetingCopy>
//           </div>
//         )}
//       />
//     </RetroBackground>
//   ))
//   .add('Solo Updates Heading', () => (
//     <RetroBackground>
//       <StoryContainer
//         render={() => (
//           <div>
//             <LabelHeading>{'Solo Updates'}</LabelHeading>
//             <MeetingPhaseHeading>{'Terry’s Updates'}</MeetingPhaseHeading>
//             <MeetingCopy margin='0'>{'Terry, what’s changed with your tasks?'}</MeetingCopy>
//           </div>
//         )}
//       />
//     </RetroBackground>
//   ))
//   .add('Check-in Agenda Heading', () => (
//     <RetroBackground>
//       <StoryContainer
//         render={() => (
//           <div>
//             <LabelHeading>{'Team Agenda'}</LabelHeading>
//             <MeetingPhaseHeading>{'“metrics”'}</MeetingPhaseHeading>
//             <MeetingCopy margin='0'>{'Terry, what do you need?'}</MeetingCopy>
//           </div>
//         )}
//       />
//     </RetroBackground>
//   ))
//   .add('Retro Group Heading', () => (
//     <RetroBackground>
//       <StoryContainer
//         render={() => (
//           <div>
//             <LabelHeading>{'Group'}</LabelHeading>
//             <MeetingPhaseHeading>{'Group'}</MeetingPhaseHeading>
//             <MeetingCopy margin='0'>{'Drag cards to group by common topics'}</MeetingCopy>
//           </div>
//         )}
//       />
//     </RetroBackground>
//   ))
//   .add('Retro Vote Heading', () => (
//     <RetroBackground>
//       <StoryContainer
//         render={() => (
//           <div>
//             <LabelHeading>{'Vote'}</LabelHeading>
//             <MeetingPhaseHeading>{'Vote'}</MeetingPhaseHeading>
//             <MeetingCopy margin='0'>{'Vote on the themes you want to discuss'}</MeetingCopy>
//           </div>
//         )}
//       />
//     </RetroBackground>
//   ))
//   .add('Retro Discuss Heading', () => (
//     <RetroBackground>
//       <StoryContainer
//         render={() => (
//           <div>
//             <LabelHeading>{'Discuss'}</LabelHeading>
//             <MeetingPhaseHeading>{'What might we do differently next time?'}</MeetingPhaseHeading>
//             <MeetingCopy margin='0'>
//               {'Create takeaway task cards to capture next steps'}
//             </MeetingCopy>
//           </div>
//         )}
//       />
//     </RetroBackground>
//   ))
//   .add('Meeting Control Bar Example', () => (
//     <RetroBackground>
//       <StoryContainer
//         render={() => (
//           <div style={{display: 'flex', flex: 1, flexDirection: 'column', flexShrink: 0}}>
//             <div style={{display: 'flex', flex: 1, flexShrink: 0}}>{'Meeting Content'}</div>
//             <MeetingFacilitatorBar>
//               {'Psst. Facilitator, you can control the meeting here!'}
//             </MeetingFacilitatorBar>
//           </div>
//         )}
//       />
//     </RetroBackground>
//   ))
