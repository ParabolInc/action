import React, {PropTypes, Component} from 'react';
import cssModules from 'react-css-modules';
import styles from './StatusNav.scss';
import StatusNavItem from 'universal/components/StatusNavItem/StatusNavItem';

@cssModules(styles)
// for the decorators
// eslint-disable-next-line react/prefer-stateless-function
export default class StatusNav extends Component {
  static propTypes = {
    navItems: PropTypes.array.isRequired
  }
  render() {
    return (
      <div styleName="nav">
        {this.props.navItems.map(item =>
          <StatusNavItem {...item} key={item.id} />
        )}
      </div>
    );
  }
}
