import React from 'react';
import Helmet from 'react-helmet';
import {head} from 'universal/utils/clientOptions';

const style = {
  margin: '0 auto',
  maxWidth: '80rem',
  padding: '2rem'
};

const PatternsContainer = () =>
  <div style={style}>
    <Helmet title="Welcome to the Action Pattern Library" {...head} />

    <h1>Pattern Library</h1>


  </div>;

export default PatternsContainer;
