import React from 'react';
import PropTypes from 'prop-types';
import { useLocation } from 'react-router-dom';
import useInsightsNavigate from '@redhat-cloud-services/frontend-components-utilities/useInsightsNavigate/useInsightsNavigate';
export const RouterWrapper = ({ Component, ...props }) => {
  const navigate = useInsightsNavigate();
  const location = useLocation();
  return <Component {...props} navigate={navigate} location={location} />;
};

RouterWrapper.propTypes = {
  Component: PropTypes.element,
};
