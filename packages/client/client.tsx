import React from 'react'
import {render} from 'react-dom'
import Root from './Root'
import './scrollIntoViewIfNeeded'
import './types/modules.d'

render(<Root />, document.getElementById('root'))
if (__PRODUCTION__ && 'serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    navigator.serviceWorker.register('/sw.js', {scope: '/'}).catch(console.error)
  })
}

// window.addEventListener('beforeinstallprompt', (e) => {
//   // Stash the event so it can be triggered later.
//   console.log("ready to install")
//   // call e.prompt() somewhere
//   e.userChoice
//     .then((choiceResult) => {
//       if (choiceResult.outcome === 'accepted') {
//         console.log('User accepted the A2HS prompt');
//       } else {
//         console.log('User dismissed the A2HS prompt');
//       }
//       e = null;
//     });
// });
//
// window.addEventListener('appinstalled', (evt) => {
//   console.log('a2hs installed');
// });
