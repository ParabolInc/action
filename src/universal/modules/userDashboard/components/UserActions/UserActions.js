import React from 'react';
import look, {StyleSheet} from 'react-look';
import ui from 'universal/styles/ui';
import UserActionHeader from 'universal/modules/userDashboard/components/UserActionHeader/UserActionHeader';
import UserActionListContainer from 'universal/modules/userDashboard/containers/UserActionList/UserActionListContainer';

const UserActions = () => {
  const {styles} = UserActions;
  return (
    <div className={styles.root}>
      <UserActionHeader/>
      <UserActionListContainer/>
    </div>
  );
};

UserActions.styles = StyleSheet.create({
  root: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    padding: `0 0 ${ui.dashGutter}`,
    width: '100%'
  }
});

export default look(UserActions);
