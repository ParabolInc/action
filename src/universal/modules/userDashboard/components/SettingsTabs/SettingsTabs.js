// import PropTypes from 'prop-types';
// import React from 'react';
// import withStyles from 'universal/styles/withStyles';
// import {css} from 'aphrodite-local-styles/no-important';
// import Tabs from 'universal/components/Tabs/Tabs';
// import Tab from 'universal/components/Tab/Tab';
// import FontAwesome from 'react-fontawesome';
// import {withRouter} from 'react-router-dom';
// import {SETTINGS, settingsOrder} from 'universal/utils/constants';
// import appTheme from 'universal/styles/theme/appTheme';
//
// const iconStyle = {opacity: '.5'};
//
// const SettingsTabs = (props) => {
//   const {notificationsCount, history, styles} = props;
//   let currentPath = SETTINGS;
//   const makeOnClick = (path) => {
//     const fullPath = `/me/${path}`;
//     if (history.isActive(fullPath)) {
//       currentPath = path;
//       if (history.isActive(fullPath, true)) {
//         return undefined;
//       }
//     }
//     return () => {
//       history.push(fullPath);
//     };
//   };
//   const clickHandlers = settingsOrder.map((path) => makeOnClick(path));
//   const notificationIconAndBadge = () => {
//     return (
//       <div className={css(styles.badgeAndBell)}>
//         <FontAwesome name="bell" style={iconStyle} />
//         {notificationsCount > 0 ? <div className={css(styles.badge)}>{notificationsCount}</div> : null}
//       </div>
//
//     );
//   };
//
//   return (
//     <Tabs activeIdx={settingsOrder.indexOf(currentPath)}>
//       <Tab
//         icon={<FontAwesome name="address-card" style={iconStyle} />}
//         label="Settings"
//         onClick={clickHandlers[0]}
//       />
//       <Tab
//         icon={<FontAwesome name="users" style={iconStyle} />}
//         label="Organizations"
//         onClick={clickHandlers[1]}
//       />
//       <Tab
//         icon={notificationIconAndBadge()}
//         label="Notifications"
//         onClick={clickHandlers[2]}
//       />
//     </Tabs>
//   );
// };
//
// SettingsTabs.propTypes = {
//   notificationsCount: PropTypes.number,
//   history: PropTypes.object,
//   styles: PropTypes.object
// };
//
// const styleThunk = () => ({
//   badge: {
//     background: appTheme.palette.warm,
//     borderRadius: '100%',
//     bottom: 0,
//     color: 'white',
//     fontSize: '14px',
//     fontWeight: 600,
//     height: '16px',
//     cursor: 'default',
//     position: 'absolute',
//     right: '-4px',
//     textAlign: 'center',
//     width: '16px'
//   },
//   badgeAndBell: {
//     position: 'relative'
//   }
// });
// export default withRouter(withStyles(styleThunk)(SettingsTabs));
