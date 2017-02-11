import React from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import FontAwesome from 'react-fontawesome';
import FieldBlock from 'universal/components/FieldBlock/FieldBlock';
import FieldLabel from 'universal/components/FieldLabel/FieldLabel';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import {Menu, MenuItem} from 'universal/modules/menu';
import Button from 'universal/components/Button/Button';

const originAnchor = {
  vertical: 'bottom',
  horizontal: 'right'
};

const targetAnchor = {
  vertical: 'top',
  horizontal: 'right'
};

const DropdownInput = (props) => {
  const {handleCreateNew, input: {name, onChange, value}, label, organizations = [], styles} = props;
  const org = organizations.find((org) => org.id === value);
  const orgName = org && org.name || 'Loading...';
  const toggle = <FontAwesome className={css(styles.downButton)} name="chevron-down"/>;
  const createNew = () =>
    <div className={css(styles.menuButtonBlock)} key={'newOrg'}>
      <Button colorPalette="mid" isBlock label="Create New Organization" size="smallest" onClick={handleCreateNew}/>
    </div>;
  const itemFactory = () => {
    return organizations.map((org, idx) => {
      return (
        <MenuItem
          isActive={value === org.id}
          key={`orgDropdownMenuItem${idx}`}
          label={org.name}
          onClick={() => {
            onChange(org.id)
          }}
        />
      )
    })
      .concat(createNew())
  };
  return (
    <FieldBlock>
      {label && <FieldLabel label={label} htmlFor={name}/>}
      <div className={css(styles.inputBlock)}>
        <span className={css(styles.field)}>{orgName}</span>
        <Menu
          originAnchor={originAnchor}
          menuWidth="12rem"
          targetAnchor={targetAnchor}
          toggle={toggle}
          itemFactory={itemFactory}
          label="Select Organization:"
        >
        </Menu>
      </div>
    </FieldBlock>
  )
};

const styleThunk = () => ({
  downButton: {
    cursor: 'pointer',
    position: 'absolute',
    right: '1rem',
    top: '.375rem'
  },

  field: {
    appearance: 'none',
    border: 0,
    borderBottom: '1px solid transparent',
    borderRadius: 0,
    boxShadow: 'none',
    display: 'block',
    fontFamily: appTheme.typography.sansSerif,
    fontSize: appTheme.typography.s4,
    lineHeight: '1.75rem',
    margin: '0',
    padding: `.125rem ${ui.fieldPaddingHorizontal}`,
    width: '100%',
  },

  inputBlock: {
    background: appTheme.palette.mid10l,
    borderColor: appTheme.palette.mid40l,
    position: 'relative'
  },

  menuButtonBlock: {
    backgroundColor: '#fff',
    borderTop: `1px solid ${ui.menuBorderColor}`,
    padding: '.5rem .5rem 0',
    width: '100%'
  }
});

export default withStyles(styleThunk)(DropdownInput);
