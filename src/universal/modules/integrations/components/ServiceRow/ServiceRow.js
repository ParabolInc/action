import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import appTheme from 'universal/styles/theme/appTheme';
import Row from 'universal/components/Row/Row';
import Button from "../../../../components/Button/Button";
import {Field, reduxForm} from 'redux-form';
import ServiceDropdownInput from 'universal/modules/integrations/components/ServiceDropdownInput/ServiceDropdownInput';


const ServiceRow = (props) => {
  const {
    accessToken,
    dropdownMapper,
    logo,
    name,
    openOauth,
    removeOauth,
    styles
  } = props;
  return (
    <Row>
      <div className={css(styles.logo)}>
        <img height={50} width={50} src={logo}/>
      </div>
      {/*<div className={css(styles.name)}>*/}
      {/*{name}*/}
      {/*</div>*/}
      <div>
      </div>
      {
        accessToken ?
          <div>
            <Field
              accessToken={accessToken}
              colorPalette="gray"
              dropdownMapper={dropdownMapper}
              component={ServiceDropdownInput}
              name="repo"
            />
            <div className={css(styles.manageService)}>
              <Button
                colorPalette="cool"
                label="Refresh Token"
                size="smallest"
                buttonStyle="flat"
                onClick={openOauth}
              />
              <Button
                colorPalette="warm"
                label="Remove Token"
                size="smallest"
                buttonStyle="flat"
                onClick={removeOauth}
              />
            </div>
          </div> :
          <Button colorPalette="cool" label="Add integration" size="smallest" buttonStyle="solid" onClick={openOauth}/>
      }
    </Row>
  );
};

ServiceRow.propTypes = {
  actions: PropTypes.any,
  email: PropTypes.string,
  invitedAt: PropTypes.string,
  isAdmin: PropTypes.bool,
  isLead: PropTypes.bool,
  picture: PropTypes.string,
  name: PropTypes.string,
  styles: PropTypes.object
};

const styleThunk = () => ({
  logo: {
    flexShrink: 0
  },

  manageService: {
    display: 'flex'
  },

  name: {
    color: appTheme.palette.dark,
    display: 'inline-block',
    fontSize: appTheme.typography.s4,
    lineHeight: '1.625rem',
    verticalAlign: 'middle'
  },
});

export default reduxForm()(
  withStyles(styleThunk)(ServiceRow)
);
