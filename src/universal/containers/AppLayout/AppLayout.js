import React, { Component } from 'react';
import Helmet from 'react-helmet';
import cssModules from 'react-css-modules';
import styles from './AppLayout.scss';
import NotificationBar from 'universal/components/NotificationBar/NotificationBar';
import MenuDrawer from 'universal/components/MenuDrawer/MenuDrawer';
import UserDrawer from 'universal/components/UserDrawer/UserDrawer';
import ListFilterSet from 'universal/components/ListFilterSet/ListFilterSet';
import TaskList from 'universal/components/TaskList/TaskList';

@cssModules(styles)
// for the decorators
// eslint-disable-next-line react/prefer-stateless-function
export default class AppLayout extends Component {
  render() {
    const handleMenuDrawerToggle = (event) => {
      event.preventDefault();
      console.log('handleMenuDrawerToggle');
    };

    const handleUserDrawerToggle = (event) => {
      event.preventDefault();
      console.log('handleUserDrawerToggle');
    };

    return (
      <div styleName="main">
        <Helmet title="App Layout" />
        <NotificationBar />
        <div styleName="inner">
          <UserDrawer />
          <MenuDrawer />
          <div styleName="header">
            <a
              styleName="menuDrawerToggle"
              href="#"
              onClick={handleMenuDrawerToggle}
              title="Toggle Menu Drawer"
            >M</a>
            <a
              styleName="userDrawerToggle"
              href="#"
              onClick={handleUserDrawerToggle}
              title="Toggle User Drawer"
            >U</a>
            <h1 styleName="heading">Heading Label</h1>
          </div>
          <div styleName="content">
            <p>I am an app layout WIP.</p>
            <ListFilterSet />
            <TaskList />
          </div>
        </div>
      </div>
    );
  }
}
